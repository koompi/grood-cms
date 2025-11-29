import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'

interface BlockConfig {
  id: string
  type: string
  attrs: Record<string, unknown>
}

interface Props {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
  const page = await prisma.groodPage.findFirst({
    where: {
      slug,
      status: 'PUBLISHED'
    }
  })
  return page
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  
  if (!page) {
    return { title: 'Page Not Found' }
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
      images: page.ogImage ? [page.ogImage] : undefined
    }
  }
}

export default async function GroodPageSlug({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    notFound()
  }

  const blocks = (page.blocks as unknown as BlockConfig[]) || []

  return (
    <main className="min-h-screen">
      {blocks.map(block => renderBlock(block))}
    </main>
  )
}

function renderBlock(block: BlockConfig) {
  switch (block.type) {
    case 'hero':
      return (
        <section 
          key={block.id}
          className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: block.attrs.imageUrl ? `url(${block.attrs.imageUrl})` : undefined,
            backgroundColor: block.attrs.imageUrl ? undefined : '#1a1a1a'
          }}
        >
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: (block.attrs.overlayOpacity as number || 50) / 100 }}
          />
          <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto ${
            block.attrs.alignment === 'left' ? 'text-left' :
            block.attrs.alignment === 'right' ? 'text-right' : 'text-center'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {(block.attrs.title as string) || 'Hero Title'}
            </h1>
            {typeof block.attrs.subtitle === 'string' && block.attrs.subtitle && (
              <p className="text-xl md:text-2xl text-white/80 mb-8">
                {block.attrs.subtitle}
              </p>
            )}
            {typeof block.attrs.ctaText === 'string' && block.attrs.ctaText && (
              <div className="flex gap-4 justify-center flex-wrap">
                <Link 
                  href={(block.attrs.ctaUrl as string) || '#'}
                  className="inline-flex items-center px-8 py-4 bg-[#fdc501] hover:bg-[#e5b101] text-black font-semibold rounded-lg transition-colors"
                >
                  {block.attrs.ctaText}
                </Link>
                {typeof block.attrs.secondaryCtaText === 'string' && block.attrs.secondaryCtaText && (
                  <Link 
                    href={(block.attrs.secondaryCtaUrl as string) || '#'}
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-colors"
                  >
                    {block.attrs.secondaryCtaText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )

    case 'callToAction':
      return (
        <section 
          key={block.id}
          className="py-20 px-4"
          style={{
            backgroundColor: (block.attrs.backgroundColor as string) || '#3b82f6',
            color: (block.attrs.textColor as string) || '#ffffff'
          }}
        >
          <div className={`max-w-4xl mx-auto ${
            block.attrs.alignment === 'left' ? 'text-left' :
            block.attrs.alignment === 'right' ? 'text-right' : 'text-center'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {(block.attrs.title as string) || 'Call to Action'}
            </h2>
            {typeof block.attrs.description === 'string' && block.attrs.description && (
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                {block.attrs.description}
              </p>
            )}
            {typeof block.attrs.buttonText === 'string' && block.attrs.buttonText && (
              <Link 
                href={(block.attrs.buttonUrl as string) || '#'}
                className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {block.attrs.buttonText}
              </Link>
            )}
          </div>
        </section>
      )

    case 'testimonial':
      return (
        <section key={block.id} className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            {typeof block.attrs.rating === 'number' && block.attrs.rating > 0 && (
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: block.attrs.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-3xl">★</span>
                ))}
              </div>
            )}
            <blockquote className="text-2xl md:text-3xl italic text-gray-700 mb-8">
              &ldquo;{(block.attrs.quote as string) || 'Testimonial quote'}&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              {typeof block.attrs.authorImage === 'string' && block.attrs.authorImage && (
                <img 
                  src={block.attrs.authorImage} 
                  alt={(block.attrs.authorName as string) || 'Author'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-lg">
                  {(block.attrs.authorName as string) || 'Author Name'}
                </p>
                {typeof block.attrs.authorTitle === 'string' && block.attrs.authorTitle && (
                  <p className="text-gray-500">
                    {block.attrs.authorTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
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
        <section key={block.id} className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className={`relative ${
              block.attrs.aspectRatio === '4:3' ? 'aspect-[4/3]' :
              block.attrs.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
            }`}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full rounded-xl shadow-2xl"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Video not available</p>
                </div>
              )}
            </div>
            {typeof block.attrs.caption === 'string' && block.attrs.caption && (
              <p className="text-center text-sm text-gray-500 mt-4">
                {block.attrs.caption}
              </p>
            )}
          </div>
        </section>
      )

    case 'productGrid':
      // This would fetch products from the database
      return (
        <section key={block.id} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {typeof block.attrs.title === 'string' && block.attrs.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {block.attrs.title}
              </h2>
            )}
            <div className={`grid gap-8 ${
              block.attrs.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              block.attrs.columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {/* Products would be fetched and mapped here */}
              <div className="text-center text-gray-500 col-span-full py-12">
                Products will be displayed here
              </div>
            </div>
          </div>
        </section>
      )

    case 'gallery':
      const images = (block.attrs.images as Array<{ url: string; alt: string; caption?: string }>) || []
      return (
        <section key={block.id} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className={`grid ${
              block.attrs.gap === 'small' ? 'gap-2' :
              block.attrs.gap === 'large' ? 'gap-8' : 'gap-4'
            } ${
              block.attrs.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              block.attrs.columns === 4 ? 'grid-cols-2 lg:grid-cols-4' : 
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {images.length > 0 ? (
                images.map((img, i) => (
                  <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                    <img 
                      src={img.url} 
                      alt={img.alt || ''}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  Add images to the gallery
                </div>
              )}
            </div>
          </div>
        </section>
      )

    default:
      return null
  }
}
