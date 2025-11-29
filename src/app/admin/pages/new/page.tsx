'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface PageTemplate {
  id: string
  name: string
  slug: string
  blocks: unknown[]
}

export default function NewGroodPagePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [form, setForm] = useState({
    title: '',
    slug: '',
    templateId: '',
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    status: 'DRAFT'
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchTemplates()
  }, [session, status])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: slugify(title)
    }))
  }

  const handleTemplateChange = (templateId: string) => {
    setForm(prev => ({ ...prev, templateId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return

    setIsSubmitting(true)
    try {
      // Get blocks from template if selected
      let blocks: unknown[] = []
      if (form.templateId) {
        const template = templates.find(t => t.id === form.templateId)
        if (template) {
          blocks = template.blocks || []
        }
      }

      const response = await fetch('/api/admin/builder-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          blocks
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/pages/${data.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create page')
      }
    } catch (error) {
      console.error('Error creating page:', error)
      alert('Failed to create page')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/pages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Page</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create a new block-based page
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., About Us"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500">/p/</span>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="about-us"
                      className="font-mono"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select 
                    value={form.templateId} 
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template</SelectItem>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Start with pre-defined blocks from a template
                  </p>
                </div>
              </CardContent>
            </Card>

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
                </div>
                <div>
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={form.ogImage}
                    onChange={(e) => setForm(prev => ({ ...prev, ogImage: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
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
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#fdc501] hover:bg-[#e5b101] text-black"
                  disabled={isSubmitting || !form.title || !form.slug}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Page
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
