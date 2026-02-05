'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SSEEvent, ConnectionStatus } from '@/types/events'

export function useSSE(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      setStatus('connecting')
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => setStatus('connected')

      eventSource.onerror = () => {
        setStatus('disconnected')
        eventSource.close()
        // Simple reconnect logic
        reconnectTimeout = setTimeout(connect, 2000)
      }

      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent
          listenersRef.current.forEach((listener) => listener(event))
        } catch (err) {
          console.error('Failed to parse SSE event', err)
        }
      }
    }

    connect()

    return () => {
      eventSourceRef.current?.close()
      clearTimeout(reconnectTimeout)
    }
  }, [url])

  const subscribe = useCallback((listener: (event: SSEEvent) => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return { status, subscribe }
}
