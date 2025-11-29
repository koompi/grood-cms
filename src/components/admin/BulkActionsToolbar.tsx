'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  EyeOff, 
  Archive,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react'

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive'
  confirmTitle?: string
  confirmDescription?: string
}

export interface SelectableItem {
  id: string
}

interface BulkActionsToolbarProps<T extends SelectableItem> {
  items: T[]
  selectedIds: Set<string>
  onSelectAll: () => void
  onClearSelection: () => void
  onAction: (action: string, ids: string[]) => Promise<void>
  actions: BulkAction[]
}

export function BulkActionsToolbar<T extends SelectableItem>({
  items,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onAction,
  actions,
}: BulkActionsToolbarProps<T>) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null)
  const [processing, setProcessing] = useState(false)

  const selectedCount = selectedIds.size
  const allSelected = items.length > 0 && selectedCount === items.length

  const handleAction = async (action: BulkAction) => {
    if (action.confirmTitle) {
      setConfirmAction(action)
    } else {
      await executeAction(action)
    }
  }

  const executeAction = async (action: BulkAction) => {
    setProcessing(true)
    try {
      await onAction(action.id, Array.from(selectedIds))
      onClearSelection()
    } finally {
      setProcessing(false)
      setConfirmAction(null)
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className="bg-[#1a1a1a] text-white p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className="border-white/30 data-[state=checked]:bg-[#fdc501] data-[state=checked]:border-[#fdc501]"
          />
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
              onClick={() => handleAction(action)}
              disabled={processing}
              className={action.variant === 'destructive' ? '' : 'bg-white/10 hover:bg-white/20 text-white border-0'}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <span className="mr-1">{action.icon}</span>
              )}
              {action.label}
            </Button>
          ))}
          
          {actions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(3).map((action, index) => (
                  <div key={action.id}>
                    {index > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleAction(action)}
                      className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
                    >
                      <span className="mr-2">{action.icon}</span>
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription?.replace('{count}', String(selectedCount))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              disabled={processing}
              className={confirmAction?.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Default bulk actions for content types
export const defaultPostActions: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publish',
    icon: <Eye className="h-4 w-4" />,
  },
  {
    id: 'unpublish',
    label: 'Unpublish',
    icon: <EyeOff className="h-4 w-4" />,
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    id: 'delete',
    label: 'Move to Trash',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    confirmTitle: 'Move to Trash?',
    confirmDescription: 'Are you sure you want to move {count} items to trash? You can restore them later from the Trash.',
  },
]

export const defaultPageActions: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publish',
    icon: <Eye className="h-4 w-4" />,
  },
  {
    id: 'unpublish',
    label: 'Unpublish',
    icon: <EyeOff className="h-4 w-4" />,
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    id: 'delete',
    label: 'Move to Trash',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    confirmTitle: 'Move to Trash?',
    confirmDescription: 'Are you sure you want to move {count} pages to trash? You can restore them later from the Trash.',
  },
]

export const defaultProductActions: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publish',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    id: 'draft',
    label: 'Set as Draft',
    icon: <EyeOff className="h-4 w-4" />,
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    id: 'delete',
    label: 'Move to Trash',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    confirmTitle: 'Move to Trash?',
    confirmDescription: 'Are you sure you want to move {count} products to trash? You can restore them later from the Trash.',
  },
]
