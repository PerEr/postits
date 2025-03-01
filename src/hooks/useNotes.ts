import { useState, useCallback, useEffect } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'postit-notes';

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

  // Load notes from localStorage on initial render
  useEffect(() => {
    if (isBrowser) {
      try {
        const savedNotes = localStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          console.log('Loading saved notes:', parsedNotes);
          
          // Handle migration from old format (notes without boardId)
          const migratedNotes = parsedNotes.map((note: Note) => {
            if (!note.boardId) {
              return { ...note, boardId: activeBoardId };
            }
            return note;
          });
          
          setNotes(migratedNotes);
        } else {
          console.log('No saved notes found in localStorage');
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isBrowser, activeBoardId]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isBrowser && !isLoading) {
      // Create a timeout variable
      const saveTimeout = setTimeout(() => {
        try {
          // Skip saving on initial render with empty notes
          if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
            console.log('Saving notes to localStorage:', notes);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
          }
        } catch (error) {
          console.error('Failed to save notes:', error);
        }
      }, 1000); // 1000ms = 1 second delay
  
      // Cleanup function to clear timeout if notes change before 1 second
      return () => clearTimeout(saveTimeout);
    }
  }, [notes, isBrowser, isLoading]);

  // Get notes for the current active board
  const boardNotes = notes.filter(note => note.boardId === activeBoardId);

  const addNote = useCallback((x: number, y: number, color = NOTE_COLORS[0]) => {
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
    
    setNotes(prevNotes => [...prevNotes, newNote]);
  }, [activeBoardId]);

  const updateNotePosition = useCallback((id: number, x: number, y: number) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id ? { ...note, x, y } : note
    ));
  }, []);

  const updateNoteText = useCallback((id: number, text: string) => {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === id ? { ...note, text } : note
    ));
  }, []);

  const deleteNote = useCallback((id: number) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }, []);

  const clearAllNotes = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete all notes from this board?`)) {
      // Only clear notes from the current board
      setNotes(prevNotes => prevNotes.filter(note => note.boardId !== activeBoardId));
    }
  }, [activeBoardId]);

  // Add function to change note color
  const updateNoteColor = useCallback((id: number, color: string) => {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === id ? { ...note, color } : note
    ));
  }, []);
  
  // Helper function to get a random color for variety
  const getRandomColor = useCallback(() => {
    return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  }, []);

  // Function to update multiple notes at once (used for grouping/ungrouping)
  const updateNotes = useCallback((updatedNotes: Note[]) => {
    setNotes(prevNotes => {
      // Create a map of all existing notes by ID for quick lookup
      const noteMap = new Map(prevNotes.map(note => [note.id, note]));
      
      // Update the map with the modified notes
      updatedNotes.forEach(note => {
        noteMap.set(note.id, note);
      });
      
      // Convert the map back to an array
      return Array.from(noteMap.values());
    });
  }, []);

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