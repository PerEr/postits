import { useState, useCallback } from 'react';
import { Note } from '../types';

/**
 * Hook for managing note selection and grouping functionality
 */
export function useNoteSelection(
  notes: Note[],
  updateNotes: (updatedNotes: Note[]) => void
) {
  // State for selected note IDs
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  // State for area selection
  const [selectionArea, setSelectionArea] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isSelecting: boolean;
  } | null>(null);

  // Toggle note selection
  const toggleNoteSelection = useCallback((id: number, isMultiSelect = false) => {
    setSelectedNoteIds(prev => {
      // Check if note is already selected
      const isSelected = prev.includes(id);
      
      if (isMultiSelect) {
        // Multi-select: toggle the specific note, keep others selected
        return isSelected
          ? prev.filter(noteId => noteId !== id)
          : [...prev, id];
      } else {
        // Single select: replace selection with just this note, or clear if already selected
        return isSelected && prev.length === 1
          ? []
          : [id];
      }
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    console.log('Clearing selection');
    setSelectedNoteIds([]);
  }, []);

  // Start area selection
  const startAreaSelection = useCallback((x: number, y: number) => {
    console.log('Start area selection at:', { x, y });
    setSelectionArea({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isSelecting: true
    });
  }, []);

  // Update area selection as it's being drawn
  const updateAreaSelection = useCallback((x: number, y: number) => {
    console.log('Update area selection');
    if (selectionArea?.isSelecting) {
      setSelectionArea(prev => 
        prev ? { ...prev, endX: x, endY: y } : null
      );
    }
  }, [selectionArea]);

  // Finish area selection and select notes inside the area
  const completeAreaSelection = useCallback((isMultiSelect = false) => {
    console.log('Completing area selection');
    if (selectionArea) {
      // Normalize rectangle coordinates (ensure startX <= endX and startY <= endY)
      const left = Math.min(selectionArea.startX, selectionArea.endX);
      const right = Math.max(selectionArea.startX, selectionArea.endX);
      const top = Math.min(selectionArea.startY, selectionArea.endY);
      const bottom = Math.max(selectionArea.startY, selectionArea.endY);
      
      console.log('Selection area:', { left, right, top, bottom });
      console.log('Total notes:', notes.length);
      
      // Find notes that intersect with the selection area
      // This will now select ALL notes that intersect with the area, even those outside the visible board
      // Log the selection area
      console.log('Selection area (board coordinates):', { left, right, top, bottom });
      console.log('Total notes to check:', notes.length);
      
      const notesInArea = notes.filter(note => {
        // Note width and height in pixels - adjust if your notes have different dimensions
        const NOTE_WIDTH = 200;
        const NOTE_HEIGHT = 200;
        
        // Calculate note boundaries
        const noteRight = note.x + NOTE_WIDTH;
        const noteBottom = note.y + NOTE_HEIGHT;
        
        // Check if the note intersects with selection area
        const intersects = (
          note.x < right &&
          noteRight > left &&
          note.y < bottom &&
          noteBottom > top
        );
        
        if (intersects) {
          console.log('✅ Note inside selection:', note.id, note.text?.substring(0, 20), { x: note.x, y: note.y });
        }
        
        return intersects;
      });
      
      const noteIdsInArea = notesInArea.map(note => note.id);
      
      // Update selection based on multi-select or not
      console.log('Selected notes in area:', noteIdsInArea);
      setSelectedNoteIds(prev => {
        if (isMultiSelect) {
          // Add new notes to existing selection
          const combinedSelection = [...prev];
          noteIdsInArea.forEach(id => {
            if (!combinedSelection.includes(id)) {
              combinedSelection.push(id);
            }
          });
          return combinedSelection;
        } else {
          // Replace selection with new notes
          return noteIdsInArea;
        }
      });
      
      // Clear the selection area
      setSelectionArea(null);
    }
  }, [selectionArea, notes]);

  // Cancel area selection
  const cancelAreaSelection = useCallback(() => {
    setSelectionArea(null);
  }, []);

  // Group selected notes
  const groupSelectedNotes = useCallback(() => {
    if (selectedNoteIds.length <= 1) {
      // Need at least 2 notes to form a group
      return;
    }
    
    // Generate a new group ID
    const groupId = `group-${Date.now()}`;
    
    // Apply the group ID to the selected notes
    const updatedNotes = notes.map(note => 
      selectedNoteIds.includes(note.id)
        ? { ...note, groupId }
        : note
    );
    
    // Update notes with the new grouping
    updateNotes(updatedNotes);
  }, [selectedNoteIds, notes, updateNotes]);

  // Ungroup notes in a group
  const ungroupNotes = useCallback((groupIdToRemove: string) => {
    // Remove groupId from notes in this group
    const updatedNotes = notes.map(note => 
      note.groupId === groupIdToRemove
        ? { ...note, groupId: undefined }
        : note
    );
    
    // Update notes without the grouping
    updateNotes(updatedNotes);
  }, [notes, updateNotes]);

  // Ungroup selected notes
  const ungroupSelectedNotes = useCallback(() => {
    if (selectedNoteIds.length === 0) {
      return;
    }
    
    // Get all unique group IDs from selected notes
    const groupIds = new Set<string>();
    selectedNoteIds.forEach(id => {
      const note = notes.find(n => n.id === id);
      if (note?.groupId) {
        groupIds.add(note.groupId);
      }
    });
    
    // Remove groupId from notes in these groups
    const updatedNotes = notes.map(note => 
      note.groupId && groupIds.has(note.groupId)
        ? { ...note, groupId: undefined }
        : note
    );
    
    // Update notes without the grouping
    updateNotes(updatedNotes);
  }, [selectedNoteIds, notes, updateNotes]);

  // Get all note IDs that should move together (selected + in same groups)
  const getRelatedNoteIds = useCallback((noteId: number): number[] => {
    // Find the note by ID
    const note = notes.find(n => n.id === noteId);
    if (!note) return [noteId];

    // If the note is part of a group, return all notes in that group
    if (note.groupId) {
      return notes
        .filter(n => n.groupId === note.groupId)
        .map(n => n.id);
    }

    // If note is selected, return all selected notes
    if (selectedNoteIds.includes(noteId)) {
      return selectedNoteIds;
    }

    // Otherwise, just return this note
    return [noteId];
  }, [notes, selectedNoteIds]);

  return {
    selectedNoteIds,
    selectionArea,
    toggleNoteSelection,
    clearSelection,
    startAreaSelection,
    updateAreaSelection,
    completeAreaSelection,
    cancelAreaSelection,
    groupSelectedNotes,
    ungroupNotes,
    ungroupSelectedNotes,
    getRelatedNoteIds
  };
}