'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SSEEvent, ConnectionStatus } from '@/types/events'

/**
 * Hook for managing SSE connection with auto-reconnect
 */
export function useSSE(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [clientId, setClientId] = useState<string>('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const reconnectAttemptsRef = useRef(0)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setStatus('connecting')
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setStatus('connected')
      reconnectAttemptsRef.current = 0
    }

    eventSource.onerror = () => {
      setStatus('disconnected')
      eventSource.close()

      // Exponential backoff reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      reconnectAttemptsRef.current++

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent

        // Store client ID from connected event
        if (event.type === 'connected') {
          setClientId(event.clientId)
        }

        // Notify all listeners
        listenersRef.current.forEach((listener) => listener(event))
      } catch (error) {
        console.error('Failed to parse SSE event:', error)
      }
    }
  }, [url])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [connect])

  const subscribe = useCallback((listener: (event: SSEEvent) => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return { status, clientId, subscribe }
}
