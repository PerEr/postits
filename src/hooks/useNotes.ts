import { useState, useCallback, useEffect } from 'react';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

// Define available colors for notes
const NOTE_COLORS = [
  '#ffd700', // Gold (default)
  '#ff9999', // Light red
  '#99ff99', // Light green
  '#9999ff', // Light blue
  '#ffcc99', // Light orange
  '#99ffff', // Light cyan
  '#ff99ff', // Light magenta
  '#ffff99', // Light yellow
];

export function useNotes(isBrowser: boolean, activeBoardId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load notes from Supabase on initial render or when active board changes
  useEffect(() => {
    async function loadNotes() {
      console.log('useNotes: loadNotes called', { isBrowser, user, activeBoardId });
      
      if (!isBrowser) {
        console.log('useNotes: Skipping load - not in browser');
        return;
      }
      
      if (!user) {
        console.log('useNotes: No user yet, will load data after auth');
        setIsLoading(false); // Don't keep the loading state active
        return;
      }
      
      if (!activeBoardId) {
        console.log('useNotes: No active board ID yet');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('useNotes: Starting to load notes for user', user.id);
        setIsLoading(true);
        
        // Query notes for all boards to keep them cached
        const { data: notesData, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (notesData) {
          // Map database notes to our application format
          const mappedNotes: Note[] = notesData.map(note => ({
            id: note.id,
            text: note.text,
            x: note.x,
            y: note.y,
            color: note.color,
            boardId: note.board_id,
            groupId: note.group_id || undefined
          }));
          
          setNotes(mappedNotes);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, [isBrowser, user, activeBoardId]);

  // Get notes for the current active board
  const boardNotes = notes && notes.length > 0 
    ? notes.filter(note => note.boardId === activeBoardId) 
    : [];

  // Helper function to add a note to Supabase
  const addNoteToSupabase = async (note: Note) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('notes')
      .insert({
        id: note.id,
        text: note.text,
        x: note.x,
        y: note.y,
        color: note.color,
        board_id: note.boardId,
        group_id: note.groupId || null,
        user_id: user.id,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
  };

  const addNote = useCallback(async (x: number, y: number, color = NOTE_COLORS[0]) => {
    if (!user || !activeBoardId) return;
    
    try {
      const NOTE_WIDTH = 200;
      const NOTE_HEIGHT = 200;
      
      console.log('Adding note at position:', { x, y, color, boardId: activeBoardId });
      
      const newNote: Note = {
        id: Date.now(),
        text: 'New Note',
        x: x - (NOTE_WIDTH / 2),
        y: y - (NOTE_HEIGHT / 2),
        color: color,
        boardId: activeBoardId
      };
      
      // Optimistically update local state
      setNotes(prevNotes => (Array.isArray(prevNotes) ? [...prevNotes, newNote] : [newNote]));
      
      // Save to Supabase
      await addNoteToSupabase(newNote);
    } catch (error) {
      console.error('Failed to add note:', error);
      // Revert optimistic update if save fails
      setNotes(prevNotes => 
        Array.isArray(prevNotes) 
          ? prevNotes.filter(note => note.id !== Date.now())
          : []);
    }
  }, [activeBoardId, user]);

  // Debounced updates to Supabase to prevent too many requests
  const updateNoteInSupabase = useCallback(async (note: Note) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          text: note.text,
          x: note.x,
          y: note.y,
          color: note.color,
          group_id: note.groupId || null,
          user_id: user.id, // Always ensure user_id is set
          board_id: note.boardId // Always ensure board_id is set
        })
        .eq('id', note.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update note in Supabase:', error);
    }
  }, [user]);

  const updateNotePosition = useCallback((id: number, x: number, y: number) => {
    if (!user) return;
    
    // Update local state immediately
    setNotes(prevNotes => {
      if (!Array.isArray(prevNotes)) return [];
      
      return prevNotes.map(note => 
        note.id === id ? { ...note, x, y } : note
      );
    });
    
    // Then schedule the API update separately
    const updateTimeout = setTimeout(() => {
      // Find the note with the updated position
      const noteToUpdate = notes.find(note => note.id === id);
      if (noteToUpdate) {
        // Make a copy with the new position before sending to API
        const updatedNote = { ...noteToUpdate, x, y };
        updateNoteInSupabase(updatedNote);
      }
    }, 1000);
    
    // Clean up timeout on next call
    return () => clearTimeout(updateTimeout);
  }, [user, updateNoteInSupabase, notes]);

  const updateNoteText = useCallback((id: number, text: string) => {
    if (!user) return;
    
    // Update local state first
    setNotes(prevNotes => {
      if (!Array.isArray(prevNotes)) return [];
      
      return prevNotes.map(note =>
        note.id === id ? { ...note, text } : note
      );
    });
    
    // Then schedule the API update separately
    const updateTimeout = setTimeout(() => {
      // Find the note with the updated text
      const noteToUpdate = notes.find(note => note.id === id);
      if (noteToUpdate) {
        // Make a copy with the new text before sending to API
        const updatedNote = { ...noteToUpdate, text };
        updateNoteInSupabase(updatedNote);
      }
    }, 1000);
    
    // Clean up timeout on next call
    return () => clearTimeout(updateTimeout);
  }, [user, updateNoteInSupabase, notes]);

  const deleteNote = useCallback(async (id: number) => {
    if (!user) return;
    
    try {
      // Optimistically update local state
      setNotes(prevNotes => 
        Array.isArray(prevNotes) 
          ? prevNotes.filter(note => note.id !== id) 
          : []);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Could potentially revert the optimistic update here
    }
  }, [user]);

  const clearAllNotes = useCallback(async () => {
    if (!user || !activeBoardId) return;
    
    if (window.confirm(`Are you sure you want to delete all notes from this board?`)) {
      try {
        // Optimistically update local state
        setNotes(prevNotes => 
          Array.isArray(prevNotes) 
            ? prevNotes.filter(note => note.boardId !== activeBoardId) 
            : []);
        
        // Delete from Supabase
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('board_id', activeBoardId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Failed to clear notes:', error);
        // Could potentially revert the optimistic update here
      }
    }
  }, [activeBoardId, user]);

  // Add function to change note color
  const updateNoteColor = useCallback((id: number, color: string) => {
    if (!user) return;
    
    // Update local state first
    setNotes(prevNotes => {
      if (!Array.isArray(prevNotes)) return [];
      
      return prevNotes.map(note =>
        note.id === id ? { ...note, color } : note
      );
    });
    
    // Then update in Supabase separately
    setTimeout(() => {
      const noteToUpdate = notes.find(note => note.id === id);
      if (noteToUpdate) {
        const updatedNote = { ...noteToUpdate, color };
        updateNoteInSupabase(updatedNote);
      }
    }, 100);
  }, [user, updateNoteInSupabase, notes]);
  
  // Helper function to get a random color for variety
  const getRandomColor = useCallback(() => {
    return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  }, []);

  // Function to update multiple notes at once (used for grouping/ungrouping)
  const updateNotes = useCallback(async (updatedNotes: Note[]) => {
    if (!user) return;
    
    try {
      setNotes(prevNotes => {
        if (!Array.isArray(prevNotes) || prevNotes.length === 0) {
          return updatedNotes;
        }
        
        // Create a map of all existing notes by ID for quick lookup
        const noteMap = new Map(prevNotes.map(note => [note.id, note]));
        
        // Update the map with the modified notes
        updatedNotes.forEach(note => {
          noteMap.set(note.id, note);
        });
        
        // Convert the map back to an array
        return Array.from(noteMap.values());
      });
      
      // Update all notes in Supabase (create batched upsert transaction)
      const notesForSupabase = updatedNotes.map(note => ({
        id: note.id,
        text: note.text,
        x: note.x,
        y: note.y,
        color: note.color,
        board_id: note.boardId,
        group_id: note.groupId || null,
        user_id: user.id
      }));
      
      const { error } = await supabase
        .from('notes')
        .upsert(notesForSupabase);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  }, [user]);

  return {
    notes: boardNotes, // Only return notes for the active board
    allNotes: notes,   // All notes across all boards
    isLoading,
    addNote,
    updateNotePosition,
    updateNoteText,
    updateNoteColor,
    deleteNote,
    clearAllNotes,
    updateNotes,
    availableColors: NOTE_COLORS,
    getRandomColor
  };
}