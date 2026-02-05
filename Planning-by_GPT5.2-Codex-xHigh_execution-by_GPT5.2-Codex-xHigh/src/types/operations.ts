export interface InsertOp {
  type: 'insert'
  index: number
  text: string
}

export interface DeleteOp {
  type: 'delete'
  index: number
  length: number
}

export type Operation = InsertOp | DeleteOp

export interface OperationMessage {
  op: Operation
  clientId: string
  revision: number
}

export interface OperationAck {
  ack: true
  revision: number
  transformedOp?: Operation | null
}
