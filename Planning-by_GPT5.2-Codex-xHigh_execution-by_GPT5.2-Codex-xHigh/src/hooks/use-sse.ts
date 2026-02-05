'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ConnectionStatus, SSEEvent } from '@/types/events'
import { parseSSEMessage } from '@/lib/sse/client'

export function useSSE(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const listenersRef = useRef<Set<(event: SSEEvent) => void>>(new Set())

  const eventSourceRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isMounted = true

    function scheduleReconnect() {
      if (!isMounted) return
      const retryDelay = Math.min(30000, 1000 * 2 ** retryCountRef.current)
      retryCountRef.current += 1

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        connect()
      }, retryDelay)
    }

    function connect() {
      if (!isMounted) return
      eventSourceRef.current?.close()

      setStatus((prev) => (prev === 'connected' ? 'syncing' : 'connecting'))

      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        retryCountRef.current = 0
        setStatus('connected')
      }

      eventSource.onmessage = (event) => {
        const parsed = parseSSEMessage(event.data)
        if (!parsed) return
        listenersRef.current.forEach((listener) => listener(parsed))
      }

      eventSource.onerror = () => {
        eventSource.close()
        setStatus('disconnected')
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      isMounted = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      eventSourceRef.current?.close()
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
