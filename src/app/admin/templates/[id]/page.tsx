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
  ArrowLeft, 
  Save, 
  Loader2,
  Trash2,
  Plus,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { blockTemplates, type BlockType } from '@/components/editor/blocks/types'

interface BlockConfig {
  id: string
  type: BlockType
  attrs: Record<string, unknown>
}

interface PageTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  blocks: BlockConfig[]
  pages: Array<{
    id: string
    title: string
    slug: string
    status: string
  }>
}

export default function EditPageTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
    blocks: [] as BlockConfig[]
  })
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)
  const [showBlockPicker, setShowBlockPicker] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchTemplate()
  }, [session, status, id])

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/templates/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data)
        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          thumbnail: data.thumbnail || '',
          blocks: data.blocks || []
        })
      } else {
        router.push('/admin/templates')
      }
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('Template updated successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Failed to update template')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/templates')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
            <p className="text-gray-500 text-sm mt-1">{template.name}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Blocks Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Default Blocks</CardTitle>
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
                          className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors"
                        >
                          <span className="font-medium text-sm text-gray-900">{block.name}</span>
                          <span className="block text-xs text-gray-500 mt-1">{block.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.blocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No blocks yet. Add blocks to create a template structure.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.blocks.map((block, index) => (
                      <div 
                        key={block.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{getBlockLabel(block.type)}</Badge>
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
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                              onClick={() => removeBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedBlock === block.id && (
                          <div className="p-3 border-t border-gray-200 bg-white">
                            <p className="text-xs text-gray-500 mb-2">Block Settings (JSON)</p>
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
                                  // Invalid JSON, ignore
                                }
                              }}
                              className="font-mono text-xs"
                              rows={6}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={form.thumbnail}
                    onChange={(e) => setForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                {form.thumbnail && (
                  <div className="mt-3 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={form.thumbnail} 
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {template.pages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pages Using This Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.pages.map(page => (
                      <Link
                        key={page.id}
                        href={`/admin/grood-pages/${page.id}`}
                        className="block p-2 rounded-lg hover:bg-gray-50"
                      >
                        <span className="font-medium text-sm">{page.title}</span>
                        <span className="block text-xs text-gray-500 font-mono">/{page.slug}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-[#fdc501] hover:bg-[#e5b101] text-black"
                  disabled={isSubmitting || !form.name || !form.slug}
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
          </div>
        </div>
      </form>
    </div>
  )
}
