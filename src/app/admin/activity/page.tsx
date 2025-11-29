'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Activity,
  FileText,
  Package,
  Image,
  Users,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Copy,
  Archive,
  Eye,
  Search,
  RefreshCw,
  ChevronDown,
  Layout
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  entityTitle: string | null
  details: Record<string, unknown> | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}

interface ActivitySummary {
  recentActivity: ActivityLog[]
  actionCounts: Record<string, number>
  totalActions: number
}

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  publish: Eye,
  unpublish: Eye,
  duplicate: Copy,
  archive: Archive,
  restore: Archive,
  upload: Upload,
}

const entityIcons: Record<string, React.ElementType> = {
  post: FileText,
  page: Layout,
  product: Package,
  media: Image,
  user: Users,
  setting: Settings,
}

const actionColors: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  publish: 'bg-purple-100 text-purple-700 border-purple-200',
  unpublish: 'bg-amber-100 text-amber-700 border-amber-200',
  duplicate: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  archive: 'bg-gray-100 text-gray-700 border-gray-200',
  restore: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function ActivityPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    search: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
  }, [session, status])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/activity?summary=true&days=7')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }, [])

  const fetchLogs = useCallback(async (reset = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '30' })
      
      if (!reset && cursor) {
        params.append('cursor', cursor)
      }
      if (filters.entityType !== 'all') {
        params.append('entityType', filters.entityType)
      }
      if (filters.action !== 'all') {
        params.append('action', filters.action)
      }

      const response = await fetch(`/api/admin/activity?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(reset ? data.items : [...logs, ...data.items])
        setHasMore(data.hasMore)
        setCursor(data.nextCursor)
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, filters, logs])

  useEffect(() => {
    fetchSummary()
    fetchLogs(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.entityType, filters.action])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getActionMessage = (log: ActivityLog) => {
    const actionVerbs: Record<string, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      publish: 'published',
      unpublish: 'unpublished',
      duplicate: 'duplicated',
      archive: 'archived',
      restore: 'restored',
    }
    const verb = actionVerbs[log.action] || log.action
    return verb
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading activity...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track changes and actions across your content
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchSummary()
            fetchLogs(true)
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalActions}</p>
                  <p className="text-xs text-gray-500">Actions (7 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.actionCounts.create || 0}</p>
                  <p className="text-xs text-gray-500">Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.actionCounts.update || 0}</p>
                  <p className="text-xs text-gray-500">Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.actionCounts.delete || 0}</p>
                  <p className="text-xs text-gray-500">Deleted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activity..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 bg-white"
          />
        </div>
        <Select
          value={filters.entityType}
          onValueChange={(value) => setFilters({ ...filters, entityType: value })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="product">Products</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.action}
          onValueChange={(value) => setFilters({ ...filters, action: value })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Created</SelectItem>
            <SelectItem value="update">Updated</SelectItem>
            <SelectItem value="delete">Deleted</SelectItem>
            <SelectItem value="publish">Published</SelectItem>
            <SelectItem value="duplicate">Duplicated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 && !isLoading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-500">
                Activity will appear here as you create, edit, and manage content.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => {
                const ActionIcon = actionIcons[log.action] || Pencil
                const EntityIcon = entityIcons[log.entityType] || FileText
                const actionColor = actionColors[log.action] || 'bg-gray-100 text-gray-700'
                
                return (
                  <div 
                    key={log.id}
                    className="p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {log.user?.image ? (
                          <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${log.user.image})` }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium text-gray-900">
                            {log.user?.name || log.user?.email || 'Unknown User'}
                          </span>
                          <Badge className={`${actionColor} text-xs border capitalize`}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {getActionMessage(log)}
                          </Badge>
                          <span className="text-gray-500">a</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            <EntityIcon className="h-3 w-3 mr-1" />
                            {log.entityType}
                          </Badge>
                        </div>
                        
                        {log.entityTitle && (
                          <p className="mt-1 text-sm font-medium text-gray-700 line-clamp-1">
                            &ldquo;{log.entityTitle}&rdquo;
                          </p>
                        )}
                        
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Load More */}
          {hasMore && (
            <div className="p-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => fetchLogs(false)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
