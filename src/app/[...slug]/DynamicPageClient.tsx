'use client'

import { useRouter } from 'next/navigation'
import { SetPageContext, InlineEditText, InlineRichText } from '@/components/admin'

interface DynamicPageClientProps {
  page: {
    id: string
    title: string
    slug: string
    content: { type: 'doc'; content: unknown[] } | null
  }
}

export function DynamicPageClient({ page }: DynamicPageClientProps) {
  const router = useRouter()

  const handleSaveField = async (field: string, value: unknown) => {
    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })

    if (!response.ok) {
      throw new Error('Failed to save')
    }

    router.refresh()
  }

  return (
    <div className="min-h-screen">
      {/* Set page context for admin toolbar */}
      <SetPageContext
        pageType="page"
        pageId={page.id}
        pageSlug={page.slug}
      />

      {/* Hero Section */}
      <section className="bg-black text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <InlineEditText
            value={page.title}
            onSave={async (val) => handleSaveField('title', val)}
            as="h1"
            className="text-4xl md:text-6xl font-bold mb-4"
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[#fdc501] prose-a:no-underline hover:prose-a:underline">
            <InlineRichText
              content={page.content}
              onSave={async (content) => handleSaveField('content', content)}
              placeholder="Add page content..."
            />
          </div>
        </div>
      </section>
    </div>
  )
}
