import { useState, useCallback, useEffect } from 'react';
import { Board, BoardState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

const DEFAULT_BOARD_STATE: BoardState = {
  offset: { x: 0, y: 0 },
  zoom: 1.0
};

export function useBoards(isBrowser: boolean) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Helper to create a new board
  const createNewBoard = useCallback((name: string): Board => {
    // Create a unique ID that includes a user prefix if available
    const userPrefix = user ? user.id.substring(0, 8) : '';
    const uniqueId = `board-${userPrefix}-${Date.now()}`;
    
    return {
      id: uniqueId,
      name,
      state: { ...DEFAULT_BOARD_STATE },
      createdAt: Date.now()
    };
  }, [user]);

  // Helper function to create a board in Supabase
  const createBoardInSupabase = useCallback(async (board: Board) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('boards')
      .insert({
        id: board.id,
        name: board.name,
        state: board.state as unknown as any,
        created_at: new Date(board.createdAt).toISOString(),
        user_id: user.id
      });
      
    if (error) throw error;
  }, [user]);

  // Load boards from Supabase on initial render
  useEffect(() => {
    async function loadBoards() {
      console.log('useBoards: loadBoards called', { isBrowser, user });
      
      if (!isBrowser) {
        console.log('useBoards: Skipping load - not in browser');
        return;
      }
      
      if (!user) {
        console.log('useBoards: No user yet, will load data after auth');
        setIsLoading(false); // Set loading to false since we're waiting for auth
        return;
      }
      
      try {
        console.log('useBoards: Starting to load boards for user', user.id);
        setIsLoading(true);
        
        // Clear any localStorage data to prevent conflicts with database
        localStorage.removeItem('postit-notes-boards');
        localStorage.removeItem('postit-notes');
        
        // Get user's boards from Supabase
        const { data: boardsData, error: boardsError } = await supabase
          .from('boards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (boardsError) throw boardsError;
        
        // Get the active board ID from localStorage (still keep this preference locally)
        let activeId = localStorage.getItem('active-board-id');
        
        if (boardsData && boardsData.length > 0) {
          // Map the database boards to our application format
          const mappedBoards: Board[] = boardsData.map(board => ({
            id: board.id,
            name: board.name,
            state: board.state as unknown as BoardState,
            createdAt: new Date(board.created_at).getTime()
          }));
          
          console.log('Loaded boards from Supabase:', mappedBoards);
          setBoards(mappedBoards);
          
          // If no active board or the active board doesn't exist anymore,
          // use the first board in the list
          if (!activeId || !mappedBoards.find(board => board.id === activeId)) {
            activeId = mappedBoards[0].id;
          }
          
          setActiveBoardId(activeId);
          localStorage.setItem('active-board-id', activeId);
        } else {
          // If no boards exist, create a default one
          console.log('No boards found, creating default board');
          const defaultBoard = createNewBoard('My Board');
          await createBoardInSupabase(defaultBoard);
          
          setBoards([defaultBoard]);
          setActiveBoardId(defaultBoard.id);
          localStorage.setItem('active-board-id', defaultBoard.id);
        }
      } catch (error) {
        console.error('Failed to load boards:', error);
        // Create a default board if loading fails
        const defaultBoard = createNewBoard('My Board');
        try {
          await createBoardInSupabase(defaultBoard);
        } catch (e) {
          console.error('Failed to create default board:', e);
        }
        
        setBoards([defaultBoard]);
        setActiveBoardId(defaultBoard.id);
        localStorage.setItem('active-board-id', defaultBoard.id);
      } finally {
        setIsLoading(false);
      }
    }

    loadBoards();
  }, [isBrowser, user, createNewBoard, createBoardInSupabase]);

  // Add a new board
  const addBoard = useCallback(async () => {
    if (!user) return '';
    
    try {
      const newBoard = createNewBoard(`Board ${boards.length + 1}`);
      
      // Save to Supabase
      await createBoardInSupabase(newBoard);
      
      setBoards(prevBoards => 
        Array.isArray(prevBoards) ? [...prevBoards, newBoard] : [newBoard]);
      setActiveBoardId(newBoard.id);
      localStorage.setItem('active-board-id', newBoard.id);
      
      return newBoard.id;
    } catch (error) {
      console.error('Failed to add board:', error);
      return '';
    }
  }, [boards.length, createNewBoard, user, createBoardInSupabase]);

  // Delete a board
  const deleteBoard = useCallback(async (boardId: string) => {
    if (!user) return;
    
    // Prevent deleting the last board
    if (boards.length <= 1) {
      alert("You can't delete the last board.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        // Delete from Supabase
        const { error } = await supabase
          .from('boards')
          .delete()
          .eq('id', boardId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Also delete all notes associated with this board
        const { error: notesError } = await supabase
          .from('notes')
          .delete()
          .eq('board_id', boardId)
          .eq('user_id', user.id);
          
        if (notesError) throw notesError;
        
        setBoards(prevBoards => 
          Array.isArray(prevBoards) 
            ? prevBoards.filter(board => board.id !== boardId) 
            : []);
        
        // If the active board is being deleted, switch to another board
        if (activeBoardId === boardId) {
          const remainingBoards = boards.filter(board => board.id !== boardId);
          setActiveBoardId(remainingBoards[0].id);
          localStorage.setItem('active-board-id', remainingBoards[0].id);
        }
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  }, [boards, activeBoardId, user]);

  // Rename a board
  const renameBoard = useCallback(async (boardId: string, newName: string) => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('boards')
        .update({ name: newName })
        .eq('id', boardId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setBoards(prevBoards => 
        Array.isArray(prevBoards)
          ? prevBoards.map(board => board.id === boardId ? { ...board, name: newName } : board)
          : []);
    } catch (error) {
      console.error('Failed to rename board:', error);
    }
  }, [user]);

  // Switch to a different board
  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    localStorage.setItem('active-board-id', boardId);
  }, []);

  // Update board state (offset and zoom)
  const updateBoardState = useCallback(async (boardId: string, newState: BoardState) => {
    if (!user) return;
    
    setBoards(prevBoards => 
      Array.isArray(prevBoards)
        ? prevBoards.map(board => board.id === boardId ? { ...board, state: newState } : board)
        : []);
    
    // Debounced update to Supabase to avoid too many updates
    const updateTimeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('boards')
          .update({ state: newState as unknown as any })
          .eq('id', boardId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Failed to update board state:', error);
      }
    }, 1000);
    
    return () => clearTimeout(updateTimeout);
  }, [user]);

  // Get the currently active board
  const getActiveBoard = useCallback(() => {
    return boards.find(board => board.id === activeBoardId);
  }, [boards, activeBoardId]);

  return {
    boards,
    activeBoardId,
    isLoading,
    addBoard,
    deleteBoard,
    renameBoard,
    switchBoard,
    updateBoardState,
    getActiveBoard
  };
}