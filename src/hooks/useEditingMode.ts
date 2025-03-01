import { useState, useCallback, useRef, useEffect } from 'react';

export function useEditingMode() {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingNoteId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingNoteId]);

  const startEditing = useCallback((id: number) => {
    setEditingNoteId(id);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  return {
    editingNoteId,
    editInputRef,
    startEditing,
    stopEditing
  };
}