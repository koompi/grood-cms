'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface BlockConfig {
  id: string
  type: string
  attrs: Record<string, unknown>
}

export default function NewPageTemplatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
    blocks: [] as BlockConfig[]
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    redirect('/auth/login')
  }

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: slugify(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/page-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/page-templates/${data.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/page-templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Page Template</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create a reusable template for pages
          </p>
        </div>
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
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Homepage Hero"
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
                    placeholder="homepage-hero"
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
                    placeholder="Describe what this template is for..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  After creating the template, you can add default blocks in the editor.
                </p>
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Template
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
