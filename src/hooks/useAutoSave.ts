"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface AutoSaveOptions {
  /** Delay in milliseconds before saving (default: 2000) */
  delay?: number;
  /** Callback to perform the save operation */
  onSave: (data: unknown) => Promise<void>;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

export interface AutoSaveState {
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Last error if save failed */
  lastError: Error | null;
  /** Status message for display */
  statusMessage: string;
}

export interface AutoSaveReturn extends AutoSaveState {
  /** Mark content as changed, triggering auto-save countdown */
  markDirty: (data: unknown) => void;
  /** Force an immediate save */
  saveNow: () => Promise<void>;
  /** Cancel pending auto-save */
  cancelAutoSave: () => void;
  /** Reset the dirty state without saving */
  resetDirty: () => void;
}

export function useAutoSave({
  delay = 2000,
  onSave,
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: AutoSaveOptions): AutoSaveReturn {
  const [state, setState] = useState<AutoSaveState>({
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    lastError: null,
    statusMessage: "",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<unknown>(null);
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateState = useCallback((updates: Partial<AutoSaveState>) => {
    if (!isUnmountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const performSave = useCallback(async () => {
    if (!pendingDataRef.current || !enabled) return;

    const dataToSave = pendingDataRef.current;

    updateState({
      isSaving: true,
      statusMessage: "Saving...",
      lastError: null,
    });

    onSaveStart?.();

    try {
      await onSave(dataToSave);

      if (!isUnmountedRef.current) {
        const now = new Date();
        updateState({
          isSaving: false,
          isDirty: false,
          lastSavedAt: now,
          statusMessage: `Saved at ${now.toLocaleTimeString()}`,
        });
        pendingDataRef.current = null;
        onSaveSuccess?.();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Save failed");
      if (!isUnmountedRef.current) {
        updateState({
          isSaving: false,
          lastError: err,
          statusMessage: `Failed to save: ${err.message}`,
        });
        onSaveError?.(err);
      }
    }
  }, [enabled, onSave, onSaveStart, onSaveSuccess, onSaveError, updateState]);

  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markDirty = useCallback(
    (data: unknown) => {
      if (!enabled) return;

      pendingDataRef.current = data;

      // Cancel any pending save
      cancelAutoSave();

      updateState({
        isDirty: true,
        statusMessage: "Unsaved changes",
      });

      // Schedule new save
      timeoutRef.current = setTimeout(() => {
        performSave();
      }, delay);
    },
    [enabled, delay, cancelAutoSave, performSave, updateState]
  );

  const saveNow = useCallback(async () => {
    cancelAutoSave();
    await performSave();
  }, [cancelAutoSave, performSave]);

  const resetDirty = useCallback(() => {
    cancelAutoSave();
    pendingDataRef.current = null;
    updateState({
      isDirty: false,
      statusMessage: "",
    });
  }, [cancelAutoSave, updateState]);

  return {
    ...state,
    markDirty,
    saveNow,
    cancelAutoSave,
    resetDirty,
  };
}

/**
 * Format relative time for "last saved" display
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 5) return "Just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
