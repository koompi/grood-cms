'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react'

interface PageContextState {
  pageType?: 'home' | 'page' | 'post' | 'product' | 'ebike' | 'accessory' | 'store' | 'contact'
  pageId?: string
  pageSlug?: string
  isEditMode: boolean
}

interface PageContextValue extends PageContextState {
  setPageContext: (ctx: Partial<Omit<PageContextState, 'isEditMode'>>) => void
  setEditMode: (enabled: boolean) => void
  toggleEditMode: () => void
}

const PageCtx = createContext<PageContextValue>({
  isEditMode: false,
  setPageContext: () => {},
  setEditMode: () => {},
  toggleEditMode: () => {},
})

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<Omit<PageContextState, 'isEditMode'>>({})
  const [isEditMode, setIsEditMode] = useState(false)

  const setPageContext = useCallback((ctx: Partial<Omit<PageContextState, 'isEditMode'>>) => {
    setContext(prev => {
      // Only update if values actually changed
      if (
        prev.pageType === ctx.pageType &&
        prev.pageId === ctx.pageId &&
        prev.pageSlug === ctx.pageSlug
      ) {
        return prev
      }
      return { ...prev, ...ctx }
    })
  }, [])

  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditMode(enabled)
  }, [])

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
  }, [])

  const value = useMemo(() => ({
    ...context,
    isEditMode,
    setPageContext,
    setEditMode,
    toggleEditMode,
  }), [context, isEditMode, setPageContext, setEditMode, toggleEditMode])

  return (
    <PageCtx.Provider value={value}>
      {children}
    </PageCtx.Provider>
  )
}

export function usePageContext() {
  return useContext(PageCtx)
}

export function useEditMode() {
  const { isEditMode, setEditMode, toggleEditMode } = useContext(PageCtx)
  return { isEditMode, setEditMode, toggleEditMode }
}

// Component to set page context from server components
export function SetPageContext({ 
  pageType, 
  pageId, 
  pageSlug 
}: { 
  pageType?: PageContextState['pageType']
  pageId?: string
  pageSlug?: string
}) {
  const { setPageContext } = usePageContext()

  useEffect(() => {
    setPageContext({ pageType, pageId, pageSlug })
    // Cleanup on unmount
    return () => {
      setPageContext({})
    }
  }, [pageType, pageId, pageSlug, setPageContext])

  return null
}
