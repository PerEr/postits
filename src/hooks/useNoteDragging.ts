import { useState, useCallback } from 'react';
import { DraggedNote, Note } from '../types';

export function useNoteDragging(
  notes: Note[], 
  updateNotePosition: (id: number, x: number, y: number) => void,
  boardZoom: number,
  getRelatedNoteIds: (noteId: number) => number[] = (id) => [id]
) {
  // console.log('useNoteDragging');
  const [draggedNote, setDraggedNote] = useState<DraggedNote | null>(null);
  // To keep track of which notes are moving together
  const [dragGroup, setDragGroup] = useState<number[]>([]);

  const handleDragStart = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    // Get all related notes that should move together
    const relatedIds = getRelatedNoteIds(id);
    
    // Store the group of note IDs being dragged
    setDragGroup(relatedIds);
    setDraggedNote({ id, startX: e.clientX, startY: e.clientY });
    console.log('Started dragging notes:', relatedIds);
  }, [getRelatedNoteIds]);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (draggedNote) {
      // Calculate the raw screen movement
      const dx = e.clientX - draggedNote.startX;
      const dy = e.clientY - draggedNote.startY;
      
      // Adjust for zoom level - divide by zoom factor to get the actual board distance
      const adjustedDx = dx / boardZoom;
      const adjustedDy = dy / boardZoom;
      
      // Move all notes in the drag group
      dragGroup.forEach(noteId => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
          // Use adjusted distances for note movement
          updateNotePosition(noteId, note.x + adjustedDx, note.y + adjustedDy);
        }
      });
      
      // Update start position for next movement calculation
      setDraggedNote({ ...draggedNote, startX: e.clientX, startY: e.clientY });
    }
  }, [draggedNote, dragGroup, notes, updateNotePosition, boardZoom]);

  const handleDragEnd = useCallback(() => {
    if (draggedNote) {
      console.log('Finished dragging notes:', dragGroup);
    }
    setDraggedNote(null);
    //setDragGroup([]);
    console.log('drag group:', dragGroup);
  }, [draggedNote, dragGroup]);

  return {
    draggedNote,
    dragGroup,
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
}