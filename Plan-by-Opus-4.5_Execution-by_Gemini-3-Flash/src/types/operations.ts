/**
 * InsertOp inserts text at a specific index
 */
export interface InsertOp {
  type: 'insert'
  index: number
  text: string
}

/**
 * DeleteOp deletes a range of characters
 */
export interface DeleteOp {
  type: 'delete'
  index: number
  length: number
}

export type Operation = InsertOp | DeleteOp

/**
 * OperationMessage wraps an operation with metadata
 */
export interface OperationMessage {
  op: Operation
  clientId: string
  revision: number
}

/**
 * OperationResult from server after processing
 */
export interface OperationResult {
  ack: boolean
  revision: number
  transformedOp?: Operation
}
