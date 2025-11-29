import { notFound } from 'next/navigation'
import { getProduct, getRelatedProducts } from '@/modules/ecommerce/services/product'
import { ProductPageClient } from './ProductPageClient'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id)
  
  // Prepare data for client component
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    shortDescription: product.shortDescription,
    description: product.description as { type: 'doc'; content: unknown[] } | null,
    specifications: product.specifications as Record<string, string> | null,
    featured: product.featured,
    featuredImage: product.featuredImage,
    categories: product.categories,
    reviews: product.reviews,
  }

  const relatedData = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    featuredImage: p.featuredImage,
  }))

  return <ProductPageClient product={productData} relatedProducts={relatedData} />
}