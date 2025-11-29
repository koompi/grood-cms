import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPage } from '@/modules/content/services/page'
import { DynamicPageClient } from './DynamicPageClient'

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
        return {
            title: "Page Not Found",
        };
    }

    const seo = page.seo as { title?: string; description?: string } | null;

    return {
        title: seo?.title || page.title,
        description: seo?.description,
        openGraph: {
            title: seo?.title || page.title,
            description: seo?.description,
        },
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    const pageData = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content as { type: 'doc'; content: unknown[] } | null,
    }

    return <DynamicPageClient page={pageData} />
}
