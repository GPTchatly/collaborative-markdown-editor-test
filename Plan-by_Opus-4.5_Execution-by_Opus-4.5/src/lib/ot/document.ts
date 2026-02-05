/**
 * OT Document model with history tracking.
 * Provides a structured way to manage document state and operation history.
 */

import type { Operation, OperationRecord } from '@/types/operations'
import { applyOperation } from './operations'
import { transform } from './transform'

/**
 * Document class that maintains text, revision, and operation history.
 */
export class OTDocument {
    private _text: string
    private _revision: number
    private _history: OperationRecord[]
    private readonly maxHistoryLength: number

    constructor(initialText: string = '', maxHistoryLength: number = 100) {
        this._text = initialText
        this._revision = 0
        this._history = []
        this.maxHistoryLength = maxHistoryLength
    }

    /**
     * Gets the current document text.
     */
    get text(): string {
        return this._text
    }

    /**
     * Gets the current revision number.
     */
    get revision(): number {
        return this._revision
    }

    /**
     * Gets the operation history.
     */
    get history(): ReadonlyArray<OperationRecord> {
        return this._history
    }

    /**
     * Applies an operation to the document.
     * The operation should already be transformed if necessary.
     *
     * @param op - The operation to apply
     * @param clientId - ID of the client that made the operation
     * @returns The new revision number
     */
    applyOperation(op: Operation, clientId: string): number {
        // Apply the operation
        this._text = applyOperation(this._text, op)

        // Increment revision
        this._revision++

        // Add to history
        this._history.push({
            op,
            clientId,
            revision: this._revision,
            timestamp: new Date(),
        })

        // Trim history if needed
        if (this._history.length > this.maxHistoryLength) {
            this._history = this._history.slice(-this.maxHistoryLength)
        }

        return this._revision
    }

    /**
     * Transforms an incoming operation against all operations that have
     * been applied since the given base revision.
     *
     * @param op - The operation to transform
     * @param baseRevision - The revision the operation was based on
     * @returns The transformed operation
     */
    transformOperation(op: Operation, baseRevision: number): Operation {
        let transformedOp = op

        // Find all operations applied after the base revision
        for (const record of this._history) {
            if (record.revision > baseRevision) {
                transformedOp = transform(transformedOp, record.op)
            }
        }

        return transformedOp
    }

    /**
     * Gets operations since a given revision.
     *
     * @param sinceRevision - The revision to get operations since
     * @returns Array of operation records
     */
    getOperationsSince(sinceRevision: number): OperationRecord[] {
        return this._history.filter((record) => record.revision > sinceRevision)
    }

    /**
     * Creates a snapshot of the current document state.
     */
    snapshot(): { text: string; revision: number } {
        return {
            text: this._text,
            revision: this._revision,
        }
    }

    /**
     * Resets the document to a new state.
     * Used for testing or reinitialization.
     */
    reset(text: string = '', revision: number = 0): void {
        this._text = text
        this._revision = revision
        this._history = []
    }
}
