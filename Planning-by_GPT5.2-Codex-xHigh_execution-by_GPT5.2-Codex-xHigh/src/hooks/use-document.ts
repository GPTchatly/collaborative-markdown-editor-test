'use client'

import { useCallback, useState } from 'react'

import type { Document } from '@/types/document'
import type { Operation } from '@/types/operations'
import { applyOperation } from '@/lib/ot/operations'

export function useDocument(initialDocument: Document) {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)

  const applyRemoteOperation = useCallback((op: Operation, nextRevision: number) => {
    setText((current) => applyOperation(current, op))
    setRevision(nextRevision)
  }, [])

  const replaceDocument = useCallback((doc: Document) => {
    setText(doc.text)
    setRevision(doc.revision)
  }, [])

  return {
    text,
    revision,
    setText,
    setRevision,
    applyRemoteOperation,
    replaceDocument,
  }
}
