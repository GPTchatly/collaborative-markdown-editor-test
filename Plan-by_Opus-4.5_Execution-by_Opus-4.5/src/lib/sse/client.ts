/**
 * SSE client utilities for browser-side connection management.
 */

import { z } from 'zod'
import type { SSEEvent, ConnectionStatus } from '@/types/events'

/**
 * Zod schema for validating SSE events.
 */
const sseEventSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('connected'),
        revision: z.number(),
        clientId: z.string(),
    }),
    z.object({
        type: z.literal('update'),
        op: z.discriminatedUnion('type', [
            z.object({
                type: z.literal('insert'),
                index: z.number(),
                text: z.string(),
            }),
            z.object({
                type: z.literal('delete'),
                index: z.number(),
                length: z.number(),
            }),
        ]),
        sourceClientId: z.string(),
        revision: z.number(),
    }),
    z.object({
        type: z.literal('ack'),
        revision: z.number(),
        transformedOp: z
            .discriminatedUnion('type', [
                z.object({
                    type: z.literal('insert'),
                    index: z.number(),
                    text: z.string(),
                }),
                z.object({
                    type: z.literal('delete'),
                    index: z.number(),
                    length: z.number(),
                }),
            ])
            .optional(),
    }),
    z.object({
        type: z.literal('heartbeat'),
        timestamp: z.number(),
    }),
])

/**
 * Parses and validates an SSE event from raw data.
 *
 * @param data - Raw event data string
 * @returns Parsed SSE event or null if invalid
 */
export function parseSSEEvent(data: string): SSEEvent | null {
    try {
        const parsed = JSON.parse(data)
        const result = sseEventSchema.safeParse(parsed)
        if (result.success) {
            return result.data
        }
        console.warn('[SSE] Invalid event data:', result.error)
        return null
    } catch (error) {
        console.error('[SSE] Failed to parse event:', error)
        return null
    }
}

/**
 * Configuration for reconnection strategy.
 */
export interface ReconnectConfig {
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
    jitterFactor: number
}

const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
}

/**
 * Creates a reconnection strategy with exponential backoff and jitter.
 *
 * @param config - Reconnect configuration
 * @returns Object with methods to manage reconnection
 */
export function createReconnectStrategy(config: Partial<ReconnectConfig> = {}) {
    const { initialDelayMs, maxDelayMs, backoffMultiplier, jitterFactor } = {
        ...DEFAULT_RECONNECT_CONFIG,
        ...config,
    }

    let attempts = 0
    let currentDelay = initialDelayMs

    return {
        /**
         * Gets the next delay time with jitter.
         */
        getNextDelay(): number {
            const jitter = 1 + (Math.random() * 2 - 1) * jitterFactor
            const delay = Math.min(currentDelay * jitter, maxDelayMs)
            currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs)
            attempts++
            return delay
        },

        /**
         * Resets the strategy after successful connection.
         */
        reset(): void {
            attempts = 0
            currentDelay = initialDelayMs
        },

        /**
         * Gets the current attempt count.
         */
        getAttempts(): number {
            return attempts
        },
    }
}

/**
 * SSE connection state type.
 */
export interface SSEConnectionState {
    status: ConnectionStatus
    clientId: string | null
    revision: number
    lastEventTime: number
}

/**
 * Creates an initial SSE connection state.
 */
export function createInitialSSEState(): SSEConnectionState {
    return {
        status: 'connecting',
        clientId: null,
        revision: 0,
        lastEventTime: 0,
    }
}
