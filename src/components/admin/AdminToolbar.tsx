'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Settings,
  Edit,
  Plus,
  FileText,
  ImageIcon,
  LayoutDashboard,
  X,
  ChevronUp,
  Zap,
  Newspaper,
  ShoppingBag,
  Store,
  MessageSquare,
  HelpCircle,
  Eye,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useEditMode } from './PageContext'

interface AdminToolbarProps {
  pageType?: 'home' | 'page' | 'post' | 'product' | 'ebike' | 'accessory' | 'store' | 'contact'
  pageId?: string
  pageSlug?: string
}

interface UserWithRole {
  role?: string
}

export function AdminToolbar({ pageType, pageId }: AdminToolbarProps) {
  const { data: session } = useSession()
  const [isMinimized, setIsMinimized] = useState(false)
  const { isEditMode, toggleEditMode } = useEditMode()

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as UserWithRole)?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  if (!canEdit) return null

  // Get edit URL based on page type
  const getEditUrl = () => {
    switch (pageType) {
      case 'home':
        return '/admin/settings'
      case 'page':
        return pageId ? `/admin/pages/${pageId}` : '/admin/pages'
      case 'post':
        return pageId ? `/admin/content/posts/${pageId}` : '/admin/content/posts'
      case 'product':
        return pageId ? `/admin/content/products/${pageId}` : '/admin/content/products'
      case 'ebike':
        return pageId ? `/admin/ebikes/${pageId}` : '/admin/ebikes'
      case 'accessory':
        return pageId ? `/admin/accessories/${pageId}` : '/admin/accessories'
      case 'store':
        return '/admin/stores'
      case 'contact':
        return '/admin/settings'
      default:
        return '/admin/dashboard'
    }
  }

  const quickAddItems = [
    { label: 'New Page', icon: FileText, href: '/admin/pages/new' },
    { label: 'New Post', icon: Newspaper, href: '/admin/content/posts/new' },
    { label: 'New E-Bike', icon: Zap, href: '/admin/ebikes/new' },
    { label: 'New Accessory', icon: ShoppingBag, href: '/admin/accessories/new' },
    { label: 'New Store', icon: Store, href: '/admin/stores/new' },
    { label: 'New Testimonial', icon: MessageSquare, href: '/admin/testimonials/new' },
    { label: 'New FAQ', icon: HelpCircle, href: '/admin/faqs/new' },
  ]

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`h-12 w-12 rounded-full shadow-xl ${
            isEditMode 
              ? 'bg-[#fdc501] hover:bg-[#fdc501]/90 text-black' 
              : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
          }`}
        >
          {isEditMode ? <Check className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl border transition-colors ${
        isEditMode 
          ? 'bg-[#fdc501] border-[#fdc501]/50' 
          : 'bg-[#1a1a1a] border-white/10'
      }`}>
        {/* Edit Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleEditMode}
          className={`h-9 px-3 rounded-full font-medium ${
            isEditMode 
              ? 'bg-black text-white hover:bg-black/80' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          {isEditMode ? <Check className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isEditMode ? 'Done Editing' : 'Edit Mode'}
        </Button>

        <div className={`w-px h-6 ${isEditMode ? 'bg-black/20' : 'bg-white/20'}`} />

        {/* Edit Current Page */}
        {pageType && (
          <Link href={getEditUrl()}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 rounded-full ${
                isEditMode 
                  ? 'text-black/70 hover:text-black hover:bg-black/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Full Editor
            </Button>
          </Link>
        )}

        {/* Quick Add Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 rounded-full ${
                isEditMode 
                  ? 'text-black/70 hover:text-black hover:bg-black/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48 mb-2">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickAddItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="cursor-pointer">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={`w-px h-6 ${isEditMode ? 'bg-black/20' : 'bg-white/20'}`} />

        {/* Media Library */}
        <Link href="/admin/media">
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 p-0 rounded-full ${
              isEditMode 
                ? 'text-black/70 hover:text-black hover:bg-black/10' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Media Library"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </Link>

        {/* Dashboard Link */}
        <Link href="/admin/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 p-0 rounded-full ${
              isEditMode 
                ? 'text-black/70 hover:text-black hover:bg-black/10' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Admin Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </Link>

        {/* Settings */}
        <Link href="/admin/settings">
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 p-0 rounded-full ${
              isEditMode 
                ? 'text-black/70 hover:text-black hover:bg-black/10' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        <div className={`w-px h-6 ${isEditMode ? 'bg-black/20' : 'bg-white/20'}`} />

        {/* Minimize */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className={`h-9 w-9 p-0 rounded-full ${
            isEditMode 
              ? 'text-black/50 hover:text-black hover:bg-black/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title="Minimize"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Edit mode hint */}
      {isEditMode && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-black/60 whitespace-nowrap bg-[#fdc501]/80 px-3 py-1 rounded-full">
          Click on any highlighted area to edit
        </div>
      )}
    </div>
  )
}
