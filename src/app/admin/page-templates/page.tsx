'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Layout,
  MoreVertical,
  Copy,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PageTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  blocks: unknown[]
  createdAt: string
  updatedAt: string
  _count: {
    pages: number
  }
}

export default function PageTemplatesAdminPage() {
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PageTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchTemplates()
  }, [session, status])

  useEffect(() => {
    if (searchTerm) {
      setFilteredTemplates(
        templates.filter(t =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.slug.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredTemplates(templates)
    }
  }, [templates, searchTerm])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/page-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/page-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDuplicate = async (template: PageTemplate) => {
    try {
      const response = await fetch('/api/admin/page-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          slug: `${template.slug}-copy-${Date.now()}`,
          description: template.description,
          blocks: template.blocks
        })
      })

      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading templates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Templates</h1>
          <p className="text-gray-500 text-sm mt-1">
            Reusable templates for building pages
          </p>
        </div>
        <Link href="/admin/page-templates/new">
          <Button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus:border-[#fdc501] focus:ring-[#fdc501]"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Layout className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Get started by creating your first template'}
              </p>
              {!searchTerm && (
                <Link href="/admin/page-templates/new">
                  <Button className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first template
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-violet-100 to-violet-50 relative">
                {template.thumbnail ? (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layout className="h-12 w-12 text-violet-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/page-templates/${template.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link 
                    href={`/admin/page-templates/${template.id}`}
                    className="font-semibold text-gray-900 hover:text-violet-600 transition-colors"
                  >
                    {template.name}
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {template._count.pages}
                  </Badge>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono">/{template.slug}</span>
                  <span>Updated {formatDate(template.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
