'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Trash2,
  Plus,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronUp,
  Eye,
  Image,
  Grid,
  MessageSquare,
  Video,
  MousePointer
} from 'lucide-react'
import { blockTemplates, type BlockType } from '@/components/editor/blocks/types'

interface BlockConfig {
  id: string
  type: BlockType
  attrs: Record<string, unknown>
}

interface GroodPage {
  id: string
  title: string
  slug: string
  blocks: BlockConfig[]
  templateId: string | null
  template: {
    id: string
    name: string
  } | null
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
  status: string
  publishedAt: string | null
}

const blockIcons: Record<BlockType, React.ReactNode> = {
  hero: <Image className="h-4 w-4" />,
  productGrid: <Grid className="h-4 w-4" />,
  testimonial: <MessageSquare className="h-4 w-4" />,
  gallery: <Image className="h-4 w-4" />,
  videoEmbed: <Video className="h-4 w-4" />,
  callToAction: <MousePointer className="h-4 w-4" />
}

const blockColors: Record<BlockType, string> = {
  hero: 'from-blue-500 to-blue-600',
  productGrid: 'from-purple-500 to-purple-600',
  testimonial: 'from-amber-500 to-amber-600',
  gallery: 'from-emerald-500 to-emerald-600',
  videoEmbed: 'from-red-500 to-red-600',
  callToAction: 'from-pink-500 to-pink-600'
}

export default function EditGroodPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState<GroodPage | null>(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    blocks: [] as BlockConfig[],
    templateId: '',
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    status: 'DRAFT'
  })
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'blocks' | 'seo'>('blocks')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchPage()
  }, [session, status, id])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/builder-pages/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPage(data)
        setForm({
          title: data.title,
          slug: data.slug,
          blocks: data.blocks || [],
          templateId: data.templateId || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          ogImage: data.ogImage || '',
          status: data.status
        })
      } else {
        router.push('/admin/pages')
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/builder-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('Page saved successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update page')
      }
    } catch (error) {
      console.error('Error updating page:', error)
      alert('Failed to update page')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const response = await fetch(`/api/admin/builder-pages/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/pages')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete page')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const addBlock = (type: BlockType) => {
    const blockTemplate = blockTemplates.find(b => b.type === type)
    const newBlock: BlockConfig = {
      id: `block-${Date.now()}`,
      type,
      attrs: blockTemplate?.defaultAttrs || {}
    }
    setForm(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))
    setShowBlockPicker(false)
    setExpandedBlock(newBlock.id)
  }

  const removeBlock = (blockId: string) => {
    setForm(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }))
    if (expandedBlock === blockId) {
      setExpandedBlock(null)
    }
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...form.blocks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newBlocks.length) return
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    setForm(prev => ({ ...prev, blocks: newBlocks }))
  }

  const getBlockLabel = (type: BlockType) => {
    const labels: Record<BlockType, string> = {
      hero: 'Hero Section',
      productGrid: 'Product Grid',
      testimonial: 'Testimonial',
      gallery: 'Image Gallery',
      videoEmbed: 'Video Embed',
      callToAction: 'Call to Action'
    }
    return labels[type] || type
  }

  // Block Settings Components
  const renderBlockSettings = (block: BlockConfig) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={(block.attrs.title as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'title', e.target.value)}
                placeholder="Hero title"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={(block.attrs.subtitle as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'subtitle', e.target.value)}
                placeholder="Hero subtitle"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Background Image URL</Label>
              <Input
                value={(block.attrs.imageUrl as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'imageUrl', e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">CTA Text</Label>
                <Input
                  value={(block.attrs.ctaText as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'ctaText', e.target.value)}
                  placeholder="Learn More"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">CTA URL</Label>
                <Input
                  value={(block.attrs.ctaUrl as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'ctaUrl', e.target.value)}
                  placeholder="/about"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Alignment</Label>
              <Select
                value={(block.attrs.alignment as string) || 'center'}
                onValueChange={(value) => updateBlockAttr(block.id, 'alignment', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'callToAction':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={(block.attrs.title as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'title', e.target.value)}
                placeholder="CTA title"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={(block.attrs.description as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'description', e.target.value)}
                placeholder="CTA description..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={(block.attrs.buttonText as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'buttonText', e.target.value)}
                  placeholder="Get Started"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Button URL</Label>
                <Input
                  value={(block.attrs.buttonUrl as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'buttonUrl', e.target.value)}
                  placeholder="/contact"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Background Color</Label>
                <Input
                  type="color"
                  value={(block.attrs.backgroundColor as string) || '#3b82f6'}
                  onChange={(e) => updateBlockAttr(block.id, 'backgroundColor', e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs">Text Color</Label>
                <Input
                  type="color"
                  value={(block.attrs.textColor as string) || '#ffffff'}
                  onChange={(e) => updateBlockAttr(block.id, 'textColor', e.target.value)}
                  className="mt-1 h-10"
                />
              </div>
            </div>
          </div>
        )
      case 'testimonial':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Quote</Label>
              <Textarea
                value={(block.attrs.quote as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'quote', e.target.value)}
                placeholder="Customer testimonial..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Author Name</Label>
                <Input
                  value={(block.attrs.authorName as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'authorName', e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Author Title</Label>
                <Input
                  value={(block.attrs.authorTitle as string) || ''}
                  onChange={(e) => updateBlockAttr(block.id, 'authorTitle', e.target.value)}
                  placeholder="CEO, Company"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Author Image URL</Label>
              <Input
                value={(block.attrs.authorImage as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'authorImage', e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Rating (1-5)</Label>
              <Select
                value={String((block.attrs.rating as number) || 5)}
                onValueChange={(value) => updateBlockAttr(block.id, 'rating', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} star{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'videoEmbed':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Video URL (YouTube/Vimeo)</Label>
              <Input
                value={(block.attrs.videoUrl as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Caption</Label>
              <Input
                value={(block.attrs.caption as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'caption', e.target.value)}
                placeholder="Video caption"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Aspect Ratio</Label>
              <Select
                value={(block.attrs.aspectRatio as string) || '16:9'}
                onValueChange={(value) => updateBlockAttr(block.id, 'aspectRatio', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 'productGrid':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={(block.attrs.title as string) || ''}
                onChange={(e) => updateBlockAttr(block.id, 'title', e.target.value)}
                placeholder="Our Products"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Columns</Label>
              <Select
                value={String((block.attrs.columns as number) || 3)}
                onValueChange={(value) => updateBlockAttr(block.id, 'columns', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Products will be automatically fetched based on your e-bike catalog.
            </p>
          </div>
        )
      case 'gallery':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Columns</Label>
              <Select
                value={String((block.attrs.columns as number) || 3)}
                onValueChange={(value) => updateBlockAttr(block.id, 'columns', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Gap Size</Label>
              <Select
                value={(block.attrs.gap as string) || 'medium'}
                onValueChange={(value) => updateBlockAttr(block.id, 'gap', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500">
              Add images through the Media Library.
            </p>
          </div>
        )
      default:
        return (
          <div className="p-3 text-xs text-gray-500">
            <p className="mb-2">Raw settings (JSON):</p>
            <Textarea
              value={JSON.stringify(block.attrs, null, 2)}
              onChange={(e) => {
                try {
                  const attrs = JSON.parse(e.target.value)
                  setForm(prev => ({
                    ...prev,
                    blocks: prev.blocks.map(b => 
                      b.id === block.id ? { ...b, attrs } : b
                    )
                  }))
                } catch {
                  // Invalid JSON
                }
              }}
              className="font-mono text-xs"
              rows={6}
            />
          </div>
        )
    }
  }

  const updateBlockAttr = (blockId: string, key: string, value: unknown) => {
    setForm(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === blockId 
          ? { ...b, attrs: { ...b.attrs, [key]: value } }
          : b
      )
    }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
            <p className="text-gray-500 text-sm mt-1">{page.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/pages/${id}/preview`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Details */}
            <Card>
              <CardHeader>
                <CardTitle>Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-sm">/p/</span>
                      <Input
                        id="slug"
                        value={form.slug}
                        onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        className="font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('blocks')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'blocks'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Blocks ({form.blocks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'seo'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                SEO
              </button>
            </div>

            {activeTab === 'blocks' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Page Blocks</CardTitle>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowBlockPicker(!showBlockPicker)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Block
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showBlockPicker && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select a block type:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {blockTemplates.map(block => (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => addBlock(block.type)}
                            className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-start gap-3"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${blockColors[block.type]} flex items-center justify-center text-white`}>
                              {blockIcons[block.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm text-gray-900 block">{block.name}</span>
                              <span className="text-xs text-gray-500 line-clamp-1">{block.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.blocks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No blocks yet</p>
                      <p className="text-sm mt-1">Click &ldquo;Add Block&rdquo; to start building your page</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.blocks.map((block, index) => (
                        <div 
                          key={block.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <div className={`w-6 h-6 rounded bg-gradient-to-br ${blockColors[block.type]} flex items-center justify-center text-white`}>
                              {blockIcons[block.type]}
                            </div>
                            <span className="font-medium text-sm text-gray-700">{getBlockLabel(block.type)}</span>
                            <div className="flex-1" />
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === form.blocks.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setExpandedBlock(
                                  expandedBlock === block.id ? null : block.id
                                )}
                              >
                                <Settings className={`h-4 w-4 transition-transform ${expandedBlock === block.id ? 'rotate-90' : ''}`} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeBlock(block.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {expandedBlock === block.id && (
                            <div className="p-4 border-t border-gray-200 bg-white">
                              {renderBlockSettings(block)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'seo' && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={form.seoTitle}
                      onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="Page title for search engines"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {form.seoTitle.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="seoDescription">Meta Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={form.seoDescription}
                      onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="Brief description for search engines..."
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {form.seoDescription.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="ogImage">Open Graph Image</Label>
                    <Input
                      id="ogImage"
                      value={form.ogImage}
                      onChange={(e) => setForm(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="https://..."
                      className="mt-1"
                    />
                    {form.ogImage && (
                      <div className="mt-2 aspect-video max-w-xs bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={form.ogImage} 
                          alt="OG preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={form.status} 
                    onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {page.publishedAt && (
                  <div className="text-xs text-gray-500">
                    First published: {new Date(page.publishedAt).toLocaleDateString()}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[#fdc501] hover:bg-[#e5b101] text-black"
                  disabled={isSubmitting || !form.title || !form.slug}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {page.template && (
              <Card>
                <CardHeader>
                  <CardTitle>Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{page.template.name}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
