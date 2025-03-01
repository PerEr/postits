import { useState, useCallback, useEffect } from 'react';
import { Board, BoardState } from '../types';

const STORAGE_KEY = 'postit-notes-boards';
const DEFAULT_BOARD_STATE: BoardState = {
  offset: { x: 0, y: 0 },
  zoom: 1.0
};

export function useBoards(isBrowser: boolean) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper to create a new board
  const createNewBoard = useCallback((name: string): Board => {
    return {
      id: `board-${Date.now()}`,
      name,
      state: { ...DEFAULT_BOARD_STATE },
      createdAt: Date.now()
    };
  }, []);

  // Load boards from localStorage on initial render
  useEffect(() => {
    if (isBrowser) {
      try {
        const savedBoards = localStorage.getItem(STORAGE_KEY);
        
        if (savedBoards) {
          const parsedData = JSON.parse(savedBoards);
          console.log('Loading saved boards:', parsedData);
          setBoards(parsedData.boards);
          setActiveBoardId(parsedData.activeBoardId);
        } else {
          // If no boards exist, create a default one
          const defaultBoard = createNewBoard('My Board');
          setBoards([defaultBoard]);
          setActiveBoardId(defaultBoard.id);
        }
      } catch (error) {
        console.error('Failed to load boards:', error);
        // Create a default board if loading fails
        const defaultBoard = createNewBoard('My Board');
        setBoards([defaultBoard]);
        setActiveBoardId(defaultBoard.id);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isBrowser, createNewBoard]);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (isBrowser && !isLoading) {
      try {
        console.log('Saving boards to localStorage:', { boards, activeBoardId });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          boards, 
          activeBoardId 
        }));
      } catch (error) {
        console.error('Failed to save boards:', error);
      }
    }
  }, [boards, activeBoardId, isBrowser, isLoading]);

  // Add a new board
  const addBoard = useCallback(() => {
    const newBoard = createNewBoard(`Board ${boards.length + 1}`);
    
    setBoards(prevBoards => [...prevBoards, newBoard]);
    setActiveBoardId(newBoard.id);
    
    return newBoard.id;
  }, [boards.length, createNewBoard]);

  // Delete a board
  const deleteBoard = useCallback((boardId: string) => {
    // Prevent deleting the last board
    if (boards.length <= 1) {
      alert("You can't delete the last board.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this board?')) {
      setBoards(prevBoards => prevBoards.filter(board => board.id !== boardId));
      
      // If the active board is being deleted, switch to another board
      if (activeBoardId === boardId) {
        const remainingBoards = boards.filter(board => board.id !== boardId);
        setActiveBoardId(remainingBoards[0].id);
      }
    }
  }, [boards, activeBoardId]);

  // Rename a board
  const renameBoard = useCallback((boardId: string, newName: string) => {
    setBoards(prevBoards => prevBoards.map(board => 
      board.id === boardId ? { ...board, name: newName } : board
    ));
  }, []);

  // Switch to a different board
  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
  }, []);

  // Update board state (offset and zoom)
  const updateBoardState = useCallback((boardId: string, newState: BoardState) => {
    setBoards(prevBoards => prevBoards.map(board => 
      board.id === boardId ? { ...board, state: newState } : board
    ));
  }, []);

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