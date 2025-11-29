'use client'

import { useState, ReactNode, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Check, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditMode } from './PageContext'

interface EditableRegionProps {
  children: ReactNode
  editUrl: string
  label?: string
  className?: string
  showOnHover?: boolean
}

export function EditableRegion({ 
  children, 
  editUrl, 
  label = 'Edit',
  className = '',
  showOnHover = true
}: EditableRegionProps) {
  const { data: session } = useSession()
  const { isEditMode } = useEditMode()
  const [isHovered, setIsHovered] = useState(false)

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as { role?: string })?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  if (!canEdit) {
    return <>{children}</>
  }

  const showOverlay = isEditMode || (isHovered && showOnHover)

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Edit overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
          showOverlay
            ? 'bg-[#fdc501]/10 ring-2 ring-[#fdc501] ring-inset rounded-lg'
            : ''
        }`}
      />
      
      {/* Edit button */}
      <div
        className={`absolute top-2 right-2 transition-all duration-200 ${
          showOverlay ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <Link href={editUrl}>
          <Button
            size="sm"
            className="h-8 bg-[#fdc501] hover:bg-[#fdc501]/90 text-black shadow-lg pointer-events-auto font-medium"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            {label}
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface EditableSectionProps {
  children: ReactNode
  editUrl: string
  title: string
  description?: string
  className?: string
}

export function EditableSection({
  children,
  editUrl,
  title,
  description,
  className = '',
}: EditableSectionProps) {
  const { data: session } = useSession()
  const { isEditMode } = useEditMode()
  const [isHovered, setIsHovered] = useState(false)

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as { role?: string })?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  if (!canEdit) {
    return <>{children}</>
  }

  const showOverlay = isEditMode || isHovered

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Section edit overlay */}
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-[#fdc501]/5 ring-2 ring-[#fdc501]/60 ring-inset rounded-xl pointer-events-none" />
          <div className="absolute -top-3 left-4 bg-[#1a1a1a] text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 z-10">
            <span className="font-medium">{title}</span>
            {description && (
              <span className="text-gray-400">• {description}</span>
            )}
            <Link 
              href={editUrl}
              className="ml-2 flex items-center gap-1 text-[#fdc501] hover:text-[#fdc501]/80 transition-colors"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

interface InlineEditTextProps {
  value: string
  onSave: (value: string) => Promise<void>
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  className?: string
  placeholder?: string
  multiline?: boolean
}

export function InlineEditText({
  value,
  onSave,
  as: Component = 'p',
  className = '',
  placeholder = 'Click to edit...',
  multiline = false
}: InlineEditTextProps) {
  const { data: session } = useSession()
  const { isEditMode } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as { role?: string })?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  if (!canEdit) {
    return <Component className={className}>{value || placeholder}</Component>
  }

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
      // Revert on error
      setEditValue(value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const startEditing = () => {
    if (isEditMode) {
      setIsEditing(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={`${className} w-full bg-white text-black border-2 border-[#fdc501] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fdc501]/50 resize-y min-h-[80px]`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={`${className} w-full bg-white text-black border-2 border-[#fdc501] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fdc501]/50`}
          />
        )}
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#fdc501]" />
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                title="Save (Enter)"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Show editable state only when in edit mode
  if (isEditMode) {
    return (
      <Component
        className={`${className} cursor-pointer hover:bg-[#fdc501]/20 ring-2 ring-[#fdc501]/30 ring-inset rounded px-2 -mx-2 transition-all group relative`}
        onClick={startEditing}
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
        <Edit className="h-3.5 w-3.5 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-70 transition-opacity text-[#fdc501]" />
      </Component>
    )
  }

  return <Component className={className}>{value || placeholder}</Component>
}

interface InlineEditImageProps {
  src: string
  alt: string
  onSave: (url: string) => Promise<void>
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
}

export function InlineEditImage({
  src,
  alt,
  onSave: _onSave, // TODO: Will be used when inline media picker is implemented
  width,
  height,
  className = '',
  fill = false,
  priority = false
}: InlineEditImageProps) {
  const { data: session } = useSession()
  const { isEditMode } = useEditMode()
  const [isHovered, setIsHovered] = useState(false)

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as { role?: string })?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  const handleSelectImage = () => {
    // For now, open media library in new tab
    // TODO: Implement inline media picker modal and use _onSave
    window.open('/admin/media?select=true', '_blank')
  }

  if (!canEdit) {
    return fill ? (
      <Image src={src} alt={alt} fill className={className} priority={priority} />
    ) : (
      <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />
    )
  }

  const showOverlay = isEditMode && isHovered

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {fill ? (
        <Image src={src} alt={alt} fill className={className} priority={priority} />
      ) : (
        <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />
      )}
      
      {/* Edit overlay */}
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all">
            <Button
              onClick={handleSelectImage}
              className="bg-[#fdc501] hover:bg-[#fdc501]/90 text-black font-medium"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Change Image
            </Button>
          </div>
          <div className="absolute top-2 right-2 bg-[#fdc501] text-black text-xs px-2 py-1 rounded font-medium">
            Click to replace
          </div>
        </>
      )}
    </div>
  )
}

interface InlineRichTextProps {
  content: { type: 'doc'; content: unknown[] } | null
  onSave: (content: { type: 'doc'; content: unknown[] }) => Promise<void>
  className?: string
  placeholder?: string
}

export function InlineRichText({
  content,
  onSave,
  className = '',
  placeholder = 'Click to edit content...'
}: InlineRichTextProps) {
  const { data: session } = useSession()
  const { isEditMode } = useEditMode()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)

  // Dynamically import Tiptap editor
  const [Editor, setEditor] = useState<React.ComponentType<{
    content?: unknown
    onChange?: (content: unknown) => void
    placeholder?: string
    className?: string
  }> | null>(null)

  useEffect(() => {
    if (isEditing) {
      import('@/components/editor/RichEditor').then((mod) => {
        setEditor(() => mod.RichEditor)
      })
    }
  }, [isEditing])

  // Update editContent when content prop changes
  useEffect(() => {
    setEditContent(content)
  }, [content])

  // Only show for authenticated users with admin/editor roles
  const userRole = (session?.user as { role?: string })?.role
  const canEdit = session && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole || '')

  if (!canEdit || !isEditMode) {
    return (
      <div className={className}>
        {content ? (
          <TiptapRendererLazy content={content} />
        ) : (
          <p className="text-gray-400 italic">{placeholder}</p>
        )}
      </div>
    )
  }

  const handleSave = async () => {
    if (!editContent) return

    setIsSaving(true)
    try {
      await onSave(editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  if (isEditing && Editor) {
    return (
      <div className="relative">
        <div className="border-2 border-[#fdc501] rounded-lg overflow-hidden">
          <Editor
            content={editContent}
            onChange={(newContent) => setEditContent(newContent as { type: 'doc'; content: unknown[] })}
            placeholder={placeholder}
          />
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          {isSaving ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-[#fdc501]" />
              <span className="text-sm">Saving...</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium shadow-lg"
                title="Save changes"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm font-medium shadow-lg"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Show editable state
  return (
    <div
      className={`${className} cursor-pointer hover:bg-[#fdc501]/10 ring-2 ring-[#fdc501]/30 ring-inset rounded-lg p-4 -m-4 transition-all group relative`}
      onClick={() => setIsEditing(true)}
    >
      {content ? (
        <TiptapRendererLazy content={content} />
      ) : (
        <p className="text-gray-400 italic">{placeholder}</p>
      )}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdc501] text-black text-sm font-medium shadow-lg">
          <Edit className="h-3.5 w-3.5" />
          Edit Content
        </span>
      </div>
    </div>
  )
}

// Lazy load TiptapRenderer to avoid issues
function TiptapRendererLazy({ content }: { content: { type: 'doc'; content: unknown[] } | null }) {
  const [Renderer, setRenderer] = useState<React.ComponentType<{ content: unknown; className?: string }> | null>(null)

  useEffect(() => {
    import('@/components/content/TiptapRenderer').then((mod) => {
      setRenderer(() => mod.TiptapRenderer as React.ComponentType<{ content: unknown; className?: string }>)
    })
  }, [])

  if (!Renderer) {
    return <div className="animate-pulse bg-gray-100 h-20 rounded" />
  }

  return <Renderer content={content} />
}
