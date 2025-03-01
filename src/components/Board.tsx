import React from 'react';
import { Note as NoteType } from '../types';
import { Note } from './Note';
import { SelectionArea } from './SelectionArea';
import styles from '../styles/Board.module.css';

interface BoardProps {
  boardOffset: { x: number; y: number };
  boardZoom: number;
  notes: NoteType[];
  availableColors: string[];
  editingNoteId: number | null;
  selectedNoteIds: number[];
  selectionArea: { startX: number; startY: number; endX: number; endY: number; isSelecting: boolean } | null;
  editInputRef: React.RefObject<HTMLTextAreaElement>;
  onDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.MouseEvent, id: number) => void;
  onNoteTextChange: (id: number, text: string) => void;
  onNoteColorChange: (id: number, color: string) => void;
  onDeleteNote: (id: number, e: React.MouseEvent) => void;
  onStartEditing: (id: number) => void;
  onStopEditing: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onSelectNote: (id: number, isMultiSelect: boolean) => void;
  onStartAreaSelection: (x: number, y: number) => void;
  onUpdateAreaSelection: (x: number, y: number) => void;
  onCompleteAreaSelection: (isMultiSelect: boolean) => void;
  onCancelAreaSelection: () => void;
}

export function Board({
  boardOffset,
  boardZoom,
  notes,
  availableColors,
  editingNoteId,
  selectedNoteIds,
  selectionArea,
  editInputRef,
  onDoubleClick,
  onDragStart,
  onNoteTextChange,
  onNoteColorChange,
  onDeleteNote,
  onStartEditing,
  onStopEditing,
  onWheel,
  onSelectNote,
  onStartAreaSelection,
  onUpdateAreaSelection,
  onCompleteAreaSelection,
  onCancelAreaSelection
}: BoardProps) {
  // Handler for mouse down on the board (not on notes)
  const handleBoardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Board onMouseDown triggered');
    // Only start area selection with left mouse button
    if (e.button === 0) {
      console.log('Area selection start detected');
      // Get board-relative coordinates
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate position in board space - adjust for zoom and offset
      const x = (e.clientX - rect.left) / boardZoom;
      const y = (e.clientY - rect.top) / boardZoom;
      
      console.log('Starting area selection at board coordinates:', { x, y });
      onStartAreaSelection(x, y);
    }
  };
  
  // Handler for mouse move during area selection
  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Board onMouseMove triggered');
    if (selectionArea?.isSelecting) {
      // Get board-relative coordinates
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / boardZoom;
      const y = (e.clientY - rect.top) / boardZoom;
      
      onUpdateAreaSelection(x, y);
    }
  };
  
  // Handler for mouse up to complete selection
  const handleBoardMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Board onMouseUp triggered');
    if (selectionArea?.isSelecting) {
      onCompleteAreaSelection(e.shiftKey || e.ctrlKey || e.metaKey);
    }
  };
  
  return (
    <div 
      className={styles.board}
      style={{ 
        transform: `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardZoom})`,
        transformOrigin: '0 0'
      }}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleBoardMouseMove}
      onMouseUp={handleBoardMouseUp}
    >
      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          isEditing={editingNoteId === note.id}
          isSelected={selectedNoteIds.includes(note.id)}
          editInputRef={editInputRef}
          availableColors={availableColors}
          onDragStart={onDragStart}
          onTextChange={onNoteTextChange}
          onColorChange={onNoteColorChange}
          onDelete={onDeleteNote}
          onStartEditing={onStartEditing}
          onStopEditing={onStopEditing}
          onSelect={onSelectNote}
        />
      ))}
      
      {/* Selection area is now rendered directly in the main container */}
    </div>
  );
}