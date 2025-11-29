'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, ExternalLink, Monitor, Tablet, Smartphone } from 'lucide-react'
import { type BlockType } from '@/components/editor/blocks/types'

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
  status: string
}

export default function PreviewGroodPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const [page, setPage] = useState<GroodPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

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
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getViewportWidth = () => {
    switch (viewport) {
      case 'tablet': return 'max-w-[768px]'
      case 'mobile': return 'max-w-[375px]'
      default: return 'max-w-full'
    }
  }

  // Render individual blocks
  const renderBlock = (block: BlockConfig) => {
    switch (block.type) {
      case 'hero':
        return (
          <div 
            key={block.id}
            className="relative min-h-[400px] flex items-center justify-center bg-cover bg-center"
            style={{
              backgroundImage: block.attrs.imageUrl ? `url(${block.attrs.imageUrl})` : undefined,
              backgroundColor: block.attrs.imageUrl ? undefined : '#1a1a1a'
            }}
          >
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: (block.attrs.overlayOpacity as number || 50) / 100 }}
            />
            <div className={`relative z-10 text-center px-4 ${
              block.attrs.alignment === 'left' ? 'text-left' :
              block.attrs.alignment === 'right' ? 'text-right' : 'text-center'
            }`}>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {(block.attrs.title as string) || 'Hero Title'}
              </h1>
              {typeof block.attrs.subtitle === 'string' && block.attrs.subtitle && (
                <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
                  {block.attrs.subtitle}
                </p>
              )}
              {typeof block.attrs.ctaText === 'string' && block.attrs.ctaText && (
                <div className="flex gap-4 justify-center">
                  <Button className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                    {block.attrs.ctaText}
                  </Button>
                  {typeof block.attrs.secondaryCtaText === 'string' && block.attrs.secondaryCtaText && (
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      {block.attrs.secondaryCtaText}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'callToAction':
        return (
          <div 
            key={block.id}
            className="py-16 px-4"
            style={{
              backgroundColor: (block.attrs.backgroundColor as string) || '#3b82f6',
              color: (block.attrs.textColor as string) || '#ffffff'
            }}
          >
            <div className={`max-w-3xl mx-auto ${
              block.attrs.alignment === 'left' ? 'text-left' :
              block.attrs.alignment === 'right' ? 'text-right' : 'text-center'
            }`}>
              <h2 className="text-3xl font-bold mb-4">
                {(block.attrs.title as string) || 'Call to Action'}
              </h2>
              {typeof block.attrs.description === 'string' && block.attrs.description && (
                <p className="text-lg opacity-90 mb-6">
                  {block.attrs.description}
                </p>
              )}
              {typeof block.attrs.buttonText === 'string' && block.attrs.buttonText && (
                <Button 
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {block.attrs.buttonText}
                </Button>
              )}
            </div>
          </div>
        )

      case 'testimonial':
        return (
          <div key={block.id} className="py-16 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto text-center">
              {typeof block.attrs.rating === 'number' && block.attrs.rating > 0 && (
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: block.attrs.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">★</span>
                  ))}
                </div>
              )}
              <blockquote className="text-2xl italic text-gray-700 mb-6">
                &ldquo;{(block.attrs.quote as string) || 'Testimonial quote'}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                {typeof block.attrs.authorImage === 'string' && block.attrs.authorImage && (
                  <img 
                    src={block.attrs.authorImage} 
                    alt={typeof block.attrs.authorName === 'string' ? block.attrs.authorName : 'Author'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    {(block.attrs.authorName as string) || 'Author Name'}
                  </p>
                  {typeof block.attrs.authorTitle === 'string' && block.attrs.authorTitle && (
                    <p className="text-sm text-gray-500">
                      {block.attrs.authorTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'videoEmbed':
        const videoUrl = block.attrs.videoUrl as string
        let embedUrl = ''
        if (videoUrl) {
          if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.includes('youtu.be') 
              ? videoUrl.split('/').pop() 
              : new URLSearchParams(new URL(videoUrl).search).get('v')
            embedUrl = `https://www.youtube.com/embed/${videoId}`
          } else if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('/').pop()
            embedUrl = `https://player.vimeo.com/video/${videoId}`
          }
        }
        return (
          <div key={block.id} className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`relative ${
                block.attrs.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                block.attrs.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
              }`}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Video URL not set</p>
                  </div>
                )}
              </div>
              {typeof block.attrs.caption === 'string' && block.attrs.caption && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  {block.attrs.caption}
                </p>
              )}
            </div>
          </div>
        )

      case 'productGrid':
        return (
          <div key={block.id} className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              {typeof block.attrs.title === 'string' && block.attrs.title && (
                <h2 className="text-3xl font-bold text-center mb-8">
                  {block.attrs.title}
                </h2>
              )}
              <div className={`grid gap-6 ${
                block.attrs.columns === 2 ? 'grid-cols-2' :
                block.attrs.columns === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4" />
                    <h3 className="font-semibold">Product {i}</h3>
                    <p className="text-sm text-gray-500">$1,999</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div key={block.id} className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className={`grid ${
                block.attrs.gap === 'small' ? 'gap-2' :
                block.attrs.gap === 'large' ? 'gap-8' : 'gap-4'
              } ${
                block.attrs.columns === 2 ? 'grid-cols-2' :
                block.attrs.columns === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div key={block.id} className="py-8 px-4 bg-gray-100 text-center">
            <p className="text-gray-500">Unknown block type: {block.type}</p>
          </div>
        )
    }
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
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/admin/pages/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="font-medium">{page.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded ${viewport === 'desktop' ? 'bg-white shadow' : ''}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded ${viewport === 'tablet' ? 'bg-white shadow' : ''}`}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded ${viewport === 'mobile' ? 'bg-white shadow' : ''}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Link href={`/admin/pages/${id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>

            {page.status === 'PUBLISHED' && (
              <a href={`/p/${page.slug}`} target="_blank">
                <Button size="sm" className="bg-[#fdc501] hover:bg-[#e5b101] text-black">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="p-6">
        <div className={`mx-auto bg-white shadow-xl rounded-lg overflow-hidden transition-all ${getViewportWidth()}`}>
          {page.blocks.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg font-medium">No blocks added yet</p>
                <p className="text-sm mt-1">Add blocks in the editor to see the preview</p>
              </div>
            </div>
          ) : (
            <div>
              {page.blocks.map(block => renderBlock(block))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
