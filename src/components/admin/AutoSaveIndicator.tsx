'use client'

import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLastSaved } from '@/hooks/useAutoSave'

interface AutoSaveIndicatorProps {
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  lastError: Error | null
  className?: string
}

export function AutoSaveIndicator({
  isDirty,
  isSaving,
  lastSavedAt,
  lastError,
  className,
}: AutoSaveIndicatorProps) {
  // Determine the state and display
  const getDisplay = () => {
    if (isSaving) {
      return {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        text: 'Saving...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      }
    }

    if (lastError) {
      return {
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        text: 'Save failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }

    if (isDirty) {
      return {
        icon: <Cloud className="h-3.5 w-3.5" />,
        text: 'Unsaved changes',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    }

    if (lastSavedAt) {
      return {
        icon: <Check className="h-3.5 w-3.5" />,
        text: `Saved ${formatLastSaved(lastSavedAt)}`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    }

    return {
      icon: <CloudOff className="h-3.5 w-3.5" />,
      text: 'Not saved',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
    }
  }

  const display = getDisplay()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
        display.color,
        display.bgColor,
        className
      )}
    >
      {display.icon}
      <span>{display.text}</span>
    </div>
  )
}

/**
 * Compact version for toolbar use
 */
interface AutoSaveIndicatorCompactProps {
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  lastError: Error | null
}

export function AutoSaveIndicatorCompact({
  isDirty,
  isSaving,
  lastSavedAt,
  lastError,
}: AutoSaveIndicatorCompactProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastError) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600" title={lastError.message}>
        <AlertCircle className="h-3 w-3" />
        <span>Failed</span>
      </div>
    )
  }

  if (isDirty) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-600">
        <Cloud className="h-3 w-3" />
        <span>Unsaved</span>
      </div>
    )
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <Check className="h-3 w-3" />
        <span>{formatLastSaved(lastSavedAt)}</span>
      </div>
    )
  }

  return null
}
