'use client'

/**
 * Hook for managing SSE (Server-Sent Events) connection.
 * Handles connection lifecycle, reconnection, and event subscription.
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SSEEvent, ConnectionStatus } from '@/types/events'
import { parseSSEEvent, createReconnectStrategy } from '@/lib/sse/client'

export interface UseSSEOptions {
    /** URL to connect to */
    url: string
    /** Client ID to include in connection */
    clientId: string
    /** Whether to automatically connect */
    autoConnect?: boolean
    /** Callback when connected */
    onConnected?: (event: SSEEvent & { type: 'connected' }) => void
}

export interface UseSSEReturn {
    /** Current connection status */
    status: ConnectionStatus
    /** Subscribe to SSE events */
    subscribe: (listener: (event: SSEEvent) => void) => () => void
    /** Manually connect */
    connect: () => void
    /** Manually disconnect */
    disconnect: () => void
}

/**
 * Hook for SSE connection management.
 *
 * @param options - SSE configuration options
 * @returns SSE connection state and methods
 */
export function useSSE(options: UseSSEOptions): UseSSEReturn {
    const { url, clientId, autoConnect = true, onConnected } = options

    const [status, setStatus] = useState<ConnectionStatus>('connecting')
    const eventSourceRef = useRef<EventSource | null>(null)
    const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())
    const reconnectStrategyRef = useRef(createReconnectStrategy())
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isConnectingRef = useRef(false)

    /**
     * Clears any pending reconnect timeout.
     */
    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
    }, [])

    /**
     * Schedules a reconnection attempt.
     */
    const scheduleReconnect = useCallback(() => {
        clearReconnectTimeout()
        const delay = reconnectStrategyRef.current.getNextDelay()
        console.log(`[SSE] Scheduling reconnect in ${Math.round(delay)}ms`)
        reconnectTimeoutRef.current = setTimeout(() => {
            connect()
        }, delay)
    }, [clearReconnectTimeout])

    /**
     * Connects to the SSE endpoint.
     */
    const connect = useCallback(() => {
        if (isConnectingRef.current || eventSourceRef.current?.readyState === EventSource.OPEN) {
            return
        }

        isConnectingRef.current = true
        clearReconnectTimeout()
        setStatus('connecting')

        const fullUrl = `${url}?clientId=${encodeURIComponent(clientId)}`
        console.log(`[SSE] Connecting to ${fullUrl}`)

        const eventSource = new EventSource(fullUrl)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
            console.log('[SSE] Connection opened')
            isConnectingRef.current = false
            reconnectStrategyRef.current.reset()
            // Status will be set to 'connected' when we receive the connected event
        }

        eventSource.onmessage = (event) => {
            const parsedEvent = parseSSEEvent(event.data)
            if (!parsedEvent) {
                return
            }

            // Handle connected event specially
            if (parsedEvent.type === 'connected') {
                setStatus('connected')
                onConnected?.(parsedEvent)
            }

            // Skip heartbeat events for listeners
            if (parsedEvent.type !== 'heartbeat') {
                listenersRef.current.forEach((listener) => listener(parsedEvent))
            }
        }

        eventSource.onerror = () => {
            console.log('[SSE] Connection error')
            isConnectingRef.current = false
            eventSource.close()
            eventSourceRef.current = null
            setStatus('disconnected')
            scheduleReconnect()
        }
    }, [url, clientId, onConnected, clearReconnectTimeout, scheduleReconnect])

    /**
     * Disconnects from the SSE endpoint.
     */
    const disconnect = useCallback(() => {
        console.log('[SSE] Disconnecting')
        clearReconnectTimeout()
        isConnectingRef.current = false
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }
        setStatus('disconnected')
    }, [clearReconnectTimeout])

    /**
     * Subscribes to SSE events.
     */
    const subscribe = useCallback((listener: (event: SSEEvent) => void) => {
        listenersRef.current.add(listener)
        return () => {
            listenersRef.current.delete(listener)
        }
    }, [])

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect()
        }

        return () => {
            disconnect()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return {
        status,
        subscribe,
        connect,
        disconnect,
    }
}
