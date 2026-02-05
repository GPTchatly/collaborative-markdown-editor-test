'use client'

import { createContext, useContext } from 'react'

interface EditorContextValue {
  readOnly: boolean
}

const EditorContext = createContext<EditorContextValue>({ readOnly: false })

export function EditorProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value?: Partial<EditorContextValue>
}) {
  const mergedValue: EditorContextValue = {
    readOnly: false,
    ...value,
  }

  return <EditorContext.Provider value={mergedValue}>{children}</EditorContext.Provider>
}

export function useEditorContext() {
  return useContext(EditorContext)
}
