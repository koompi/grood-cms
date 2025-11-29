import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions'

// GET all page templates
export async function GET() {
  try {
    const authResult = await withPermission('pages', 'view')
    if (authResult instanceof NextResponse) return authResult

    const templates = await prisma.pageTemplate.findMany({
      include: {
        _count: {
          select: { pages: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching page templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page templates' },
      { status: 500 }
    )
  }
}

// POST create new page template
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission('pages', 'create')
    if (authResult instanceof NextResponse) return authResult

    const body = await request.json()
    const { name, slug, description, thumbnail, blocks } = body

    // Check if slug exists
    const existing = await prisma.pageTemplate.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A template with this slug already exists' },
        { status: 400 }
      )
    }

    const template = await prisma.pageTemplate.create({
      data: {
        name,
        slug,
        description,
        thumbnail,
        blocks: blocks || []
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating page template:', error)
    return NextResponse.json(
      { error: 'Failed to create page template' },
      { status: 500 }
    )
  }
}
