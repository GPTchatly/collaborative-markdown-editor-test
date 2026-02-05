'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SSEEvent, ConnectionStatus } from '@/types/events'

/**
 * Hook to manage an SSE connection.
 */
export function useSSE(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout

    const connect = () => {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setStatus('connected')
      }

      eventSource.onerror = () => {
        setStatus('disconnected')
        eventSource.close()
        // Exponential backoff logic could go here
        retryTimeout = setTimeout(connect, 3000)
      }

      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent
          listenersRef.current.forEach((listener) => listener(event))
        } catch (err) {
          console.error('Failed to parse SSE event:', err)
        }
      }
    }

    connect()

    return () => {
      eventSourceRef.current?.close()
      clearTimeout(retryTimeout)
    }
  }, [url])

  const subscribe = useCallback((listener: (event: SSEEvent) => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return { status, setStatus, subscribe }
}
