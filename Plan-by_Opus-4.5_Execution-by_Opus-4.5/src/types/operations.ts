/**
 * Operational Transformation types for the collaborative editor.
 */

/**
 * Insert operation — inserts text at a specific index.
 */
export interface InsertOp {
    type: 'insert'
    index: number
    text: string
}

/**
 * Delete operation — deletes characters starting at a specific index.
 */
export interface DeleteOp {
    type: 'delete'
    index: number
    length: number
}

/**
 * A single operation (either insert or delete).
 */
export type Operation = InsertOp | DeleteOp

/**
 * Operation message sent from client to server.
 */
export interface OperationMessage {
    op: Operation
    clientId: string
    revision: number
}

/**
 * Acknowledgment response from server after applying an operation.
 */
export interface OperationAck {
    ack: true
    revision: number
    transformedOp?: Operation
}

/**
 * Record of an operation with metadata, stored in history.
 */
export interface OperationRecord {
    op: Operation
    clientId: string
    revision: number
    timestamp: Date
}
