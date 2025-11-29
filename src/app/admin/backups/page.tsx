'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Clock,
  HardDrive,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Plus
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

interface Backup {
  filename: string
  path: string
  createdAt: string
  size: number
  sizeFormatted: string
  description?: string
}

export default function BackupsPage() {
  const { data: session, status } = useSession()
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null)
  const [deletingFilename, setDeletingFilename] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/login')
    }
    fetchBackups()
  }, [session, status])

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/backups')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() || undefined }),
      })
      if (response.ok) {
        const data = await response.json()
        setBackups([data.backup, ...backups])
        setDescription('')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestore = async (filename: string) => {
    setRestoringFilename(filename)
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      })
      if (response.ok) {
        alert('Backup restored successfully. Please restart the application.')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to restore backup')
      }
    } catch (error) {
      console.error('Failed to restore backup:', error)
    } finally {
      setRestoringFilename(null)
    }
  }

  const handleDelete = async (filename: string) => {
    setDeletingFilename(filename)
    try {
      const response = await fetch(`/api/admin/backups?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setBackups(backups.filter(b => b.filename !== filename))
      }
    } catch (error) {
      console.error('Failed to delete backup:', error)
    } finally {
      setDeletingFilename(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTotalSize = () => {
    const total = backups.reduce((sum, b) => sum + b.size, 0)
    if (total < 1024) return total + ' B'
    if (total < 1024 * 1024) return (total / 1024).toFixed(1) + ' KB'
    if (total < 1024 * 1024 * 1024) return (total / (1024 * 1024)).toFixed(1) + ' MB'
    return (total / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading backups...</span>
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
            <Database className="h-7 w-7" />
            Database Backups
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage database backups for disaster recovery
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-800 font-medium">Backup created successfully!</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Backups</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Size</p>
                <p className="text-2xl font-bold">{getTotalSize()}</p>
              </div>
              <HardDrive className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Backup</p>
                <p className="text-lg font-bold">
                  {backups.length > 0 ? formatDate(backups[0].createdAt) : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Backup</CardTitle>
          <CardDescription>
            Create a snapshot of the current database state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Optional description (e.g., 'Before major update')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup History</CardTitle>
          <CardDescription>
            Up to 10 most recent backups are kept automatically
          </CardDescription>
        </CardHeader>
        {backups.length === 0 ? (
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Database className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No backups yet</h3>
              <p className="text-gray-500">
                Create your first backup to protect your data
              </p>
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-100">
            {backups.map((backup, index) => (
              <div 
                key={backup.filename} 
                className="p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {backup.description || backup.filename}
                      </span>
                      {index === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(backup.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{backup.sizeFormatted}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={restoringFilename === backup.filename}
                        >
                          {restoringFilename === backup.filename ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Restore
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Restore Backup?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace the current database with the backup from{' '}
                            <strong>{formatDate(backup.createdAt)}</strong>. 
                            A backup of the current state will be created before restoring.
                            You may need to restart the application after restoration.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRestore(backup.filename)}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Restore Backup
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingFilename === backup.filename}
                        >
                          {deletingFilename === backup.filename ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this backup. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(backup.filename)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Backup best practices</p>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Create a backup before making major changes</li>
                <li>Keep backups of important milestones</li>
                <li>Test restoration periodically to ensure backups work</li>
                <li>Consider downloading backups for offsite storage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
