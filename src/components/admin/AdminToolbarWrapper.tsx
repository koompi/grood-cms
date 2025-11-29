'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { PageContextProvider, usePageContext } from '@/components/admin/PageContext'

interface AdminToolbarWrapperProps {
  children: ReactNode
  pageType?: 'home' | 'page' | 'post' | 'product' | 'ebike' | 'accessory' | 'store' | 'contact'
  pageId?: string
  pageSlug?: string
}

function AdminToolbarInner() {
  const pathname = usePathname()
  const context = usePageContext()

  // Auto-detect page type from pathname if not provided in context
  const detectedPageType = context.pageType || detectPageType(pathname)

  return (
    <AdminToolbar 
      pageType={detectedPageType} 
      pageId={context.pageId}
      pageSlug={context.pageSlug}
    />
  )
}

export function AdminToolbarWrapper({ 
  children, 
}: AdminToolbarWrapperProps) {
  return (
    <PageContextProvider>
      {children}
      <AdminToolbarInner />
    </PageContextProvider>
  )
}

function detectPageType(pathname: string): AdminToolbarWrapperProps['pageType'] {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/blog/')) return 'post'
  if (pathname.startsWith('/blog')) return 'post'
  if (pathname.startsWith('/our-rides/')) return 'ebike'
  if (pathname.startsWith('/our-rides')) return 'ebike'
  if (pathname.startsWith('/accessories')) return 'accessory'
  if (pathname.startsWith('/products/')) return 'product'
  if (pathname.startsWith('/products')) return 'product'
  if (pathname.startsWith('/find-store')) return 'store'
  if (pathname.startsWith('/contact')) return 'contact'
  if (pathname.startsWith('/p/')) return 'page'
  return 'page'
}
