'use client'

import { createContext, useContext } from 'react'

interface EditorContextValue {
  documentName?: string
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value?: EditorContextValue
}) {
  return <EditorContext.Provider value={value ?? {}}>{children}</EditorContext.Provider>
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider')
  }
  return context
}
