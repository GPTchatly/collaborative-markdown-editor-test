'use client'

import { useState } from 'react'
import type { DocumentSnapshot } from '@/types/document'

export function useDocument(initialDocument: DocumentSnapshot) {
  const [text, setText] = useState(initialDocument.text)
  const [revision, setRevision] = useState(initialDocument.revision)

  return {
    text,
    setText,
    revision,
    setRevision,
  }
}
