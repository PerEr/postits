import React, { useState, useRef, useEffect } from 'react';
import { Board } from '../types';
import styles from '../styles/BoardTabs.module.css';

interface BoardTabsProps {
  boards: Board[];
  activeBoardId: string;
  onSwitchBoard: (id: string) => void;
  onAddBoard: () => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard?: (id: string, newName: string) => void;
}

export function BoardTabs({
  boards,
  activeBoardId,
  onSwitchBoard,
  onAddBoard,
  onDeleteBoard,
  onRenameBoard
}: BoardTabsProps) {
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingBoardId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingBoardId]);

  const startEditing = (board: Board, e: React.MouseEvent) => {
    if (!onRenameBoard) return;
    
    e.stopPropagation(); // Prevent activating the board
    setEditingBoardId(board.id);
    setEditName(board.name);
  };

  const saveEdit = () => {
    if (editingBoardId && onRenameBoard) {
      onRenameBoard(editingBoardId, editName.trim() || `Board ${boards.length}`);
      setEditingBoardId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingBoardId(null);
    }
  };

  return (
    <>
      <div className={styles.tabsContainer}>
        {boards.map(board => (
          <button
            key={board.id}
            className={`${styles.tab} ${board.id === activeBoardId ? styles.active : ''}`}
            onClick={() => onSwitchBoard(board.id)}
            onDoubleClick={(e) => startEditing(board, e)}
          >
            {editingBoardId === board.id ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100px', background: 'transparent', border: 'none', color: 'white' }}
              />
            ) : (
              board.name
            )}
            {boards.length > 1 && (
              <button
                className={styles.closeButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent activating the board
                  onDeleteBoard(board.id);
                }}
                title="Delete board"
              >
                ×
              </button>
            )}
          </button>
        ))}
        <button
          className={styles.addButton}
          onClick={onAddBoard}
          title="Add new board"
        >
          +
        </button>
      </div>
      <div className={styles.spacer}></div>
    </>
  );
}