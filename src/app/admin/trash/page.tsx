'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  RotateCcw, 
  FileText, 
  Layout, 
  Package,
  AlertTriangle,
  Clock,
  Loader2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TrashItem {
  id: string
  title?: string
  name?: string
  itemType: 'post' | 'page' | 'product'
  deletedAt: string
  author?: { name: string; email: string }
}

interface TrashCounts {
  posts: number
  pages: number
  products: number
  total: number
}

export default function TrashPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<TrashItem[]>([])
  const [counts, setCounts] = useState<TrashCounts>({ posts: 0, pages: 0, products: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'posts' | 'pages' | 'products'>('all')
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isEmptying, setIsEmptying] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchTrash()
  }, [session, status, filter])

  const fetchTrash = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('type', filter)
      
      const response = await fetch(`/api/admin/trash?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setCounts(data.counts)
      }
    } catch (error) {
      console.error('Failed to fetch trash:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (item: TrashItem) => {
    setRestoringId(item.id)
    try {
      const response = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, itemType: item.itemType }),
      })
      if (response.ok) {
        setItems(items.filter(i => i.id !== item.id))
        setCounts(prev => ({
          ...prev,
          [item.itemType + 's']: prev[item.itemType + 's' as keyof TrashCounts] as number - 1,
          total: prev.total - 1,
        }))
      }
    } catch (error) {
      console.error('Failed to restore item:', error)
    } finally {
      setRestoringId(null)
    }
  }

  const handleDelete = async (item: TrashItem) => {
    setDeletingId(item.id)
    try {
      const response = await fetch(`/api/admin/trash?id=${item.id}&itemType=${item.itemType}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setItems(items.filter(i => i.id !== item.id))
        setCounts(prev => ({
          ...prev,
          [item.itemType + 's']: prev[item.itemType + 's' as keyof TrashCounts] as number - 1,
          total: prev.total - 1,
        }))
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEmptyTrash = async () => {
    setIsEmptying(true)
    try {
      const response = await fetch('/api/admin/trash?emptyAll=true', {
        method: 'DELETE',
      })
      if (response.ok) {
        setItems([])
        setCounts({ posts: 0, pages: 0, products: 0, total: 0 })
      }
    } catch (error) {
      console.error('Failed to empty trash:', error)
    } finally {
      setIsEmptying(false)
    }
  }

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'post':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'page':
        return <Layout className="h-5 w-5 text-violet-500" />
      case 'product':
        return <Package className="h-5 w-5 text-emerald-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getItemBadge = (itemType: string) => {
    switch (itemType) {
      case 'post':
        return 'bg-blue-100 text-blue-700'
      case 'page':
        return 'bg-violet-100 text-violet-700'
      case 'product':
        return 'bg-emerald-100 text-emerald-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading trash...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="h-7 w-7" />
            Trash
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Deleted items can be restored or permanently removed
          </p>
        </div>
        {counts.total > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isEmptying}>
                {isEmptying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Empty Trash?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {counts.total} items in the trash. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmptyTrash} className="bg-red-600 hover:bg-red-700">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-[#fdc501]' : 'hover:shadow-md'}`}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">All Items</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'posts' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
          onClick={() => setFilter('posts')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Posts</p>
                <p className="text-2xl font-bold">{counts.posts}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'pages' ? 'ring-2 ring-violet-500' : 'hover:shadow-md'}`}
          onClick={() => setFilter('pages')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pages</p>
                <p className="text-2xl font-bold">{counts.pages}</p>
              </div>
              <Layout className="h-8 w-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'products' ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => setFilter('products')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="text-2xl font-bold">{counts.products}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trash Items */}
      <Card>
        {items.length === 0 ? (
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trash is empty</h3>
              <p className="text-gray-500">
                Deleted items will appear here and can be restored or permanently removed
              </p>
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div 
                key={`${item.itemType}-${item.id}`} 
                className="p-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getItemIcon(item.itemType)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {item.title || item.name}
                      </span>
                      <Badge className={`${getItemBadge(item.itemType)} text-xs`}>
                        {item.itemType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Deleted {formatDate(item.deletedAt)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item)}
                      disabled={restoringId === item.id}
                    >
                      {restoringId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{item.title || item.name}&quot;. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(item)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Trash retention policy</p>
              <p className="text-sm text-amber-700 mt-1">
                Items in the trash will be automatically deleted after 30 days. 
                Restore items to keep them permanently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
