// src/app/page.tsx
'use client';

import { useCallback } from 'react';

// Import custom hooks
import {
  useBrowserDetection,
  useBoard,
  useNotes,
  useEditingMode,
  useNoteDragging,
  useBoards,
  useNoteSelection
} from '../hooks';

// Import components
import {
  Board,
  Controls,
  LoadingScreen,
  BoardTabs
} from '../components';

// Import styles
import styles from '../styles/Main.module.css';

export default function Home() {
  // Initialize browser detection (needed for localStorage)
  const isBrowser = useBrowserDetection();
  
  // Initialize boards functionality
  const {
    boards,
    activeBoardId,
    isLoading: isBoardsLoading,
    addBoard,
    deleteBoard,
    renameBoard,
    switchBoard,
    updateBoardState,
    getActiveBoard
  } = useBoards(isBrowser);
  
  // Get the active board
  const activeBoard = getActiveBoard();
  
  // Initialize notes functionality
  const {
    notes,
    isLoading: isNotesLoading,
    addNote,
    updateNotePosition,
    updateNoteText,
    updateNoteColor,
    deleteNote,
    clearAllNotes,
    updateNotes,
    availableColors,
    getRandomColor
  } = useNotes(isBrowser, activeBoardId);
  
  // Initialize note selection functionality
  const {
    selectedNoteIds,
    selectionArea,
    toggleNoteSelection,
    clearSelection,
    startAreaSelection,
    updateAreaSelection,
    completeAreaSelection,
    cancelAreaSelection,
    groupSelectedNotes,
    ungroupSelectedNotes,
    getRelatedNoteIds
  } = useNoteSelection(notes, updateNotes);
  
  // Initialize board functionality
  const {
    boardOffset,
    boardZoom,
    handlePanStart,
    handlePan,
    handlePanEnd,
    handleZoom,
    moveBoardBy,
    setZoomLevel,
    resetZoom
  } = useBoard(
    isBrowser, 
    activeBoard?.state || { offset: { x: 0, y: 0 }, zoom: 1.0 },
    (newState) => activeBoard && updateBoardState(activeBoard.id, newState)
  );
  
  // Initialize editing functionality
  const {
    editingNoteId,
    editInputRef,
    startEditing,
    stopEditing
  } = useEditingMode();
  
  // Initialize note dragging functionality
  const {
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useNoteDragging(notes, updateNotePosition, boardZoom, getRelatedNoteIds);
  
  // Handle double-click to add a new note
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Double click detected!');
    
    // Only add note if double-clicking directly on the board or main element
    if (e.target === e.currentTarget) {
      // Clear any existing selection
      clearSelection();
      
      // Get the bounding rectangle of the container
      const rect = e.currentTarget.getBoundingClientRect();
      
      // Calculate position relative to container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // If the event originated on the board element, we don't need to adjust for offset
      // as it's already positioned with transform
      const finalX = e.currentTarget.className.includes('board') ? x : x - boardOffset.x;
      const finalY = e.currentTarget.className.includes('board') ? y : y - boardOffset.y;
      
      // Adjust the position based on zoom level
      const adjustedX = finalX / boardZoom;
      const adjustedY = finalY / boardZoom;
      
      console.log('Adding note at position:', { adjustedX, adjustedY });
      
      // Add the note at the calculated position
      addNote(adjustedX, adjustedY);
      
      // Prevent event from bubbling to avoid double triggering
      e.stopPropagation();
    }
  }, [addNote, boardOffset, boardZoom, clearSelection]);
  
  // Add a test note in the center of the screen with a random color
  const testAddNote = useCallback(() => {
    console.log('Testing add note...');
    addNote(window.innerWidth / 2, window.innerHeight / 2, getRandomColor());
  }, [addNote, getRandomColor]);
  
  // Test moving the board
  const testPanBoard = useCallback(() => {
    console.log('Testing panning...');
    moveBoardBy(100, 100);
  }, [moveBoardBy]);
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(boardZoom + 0.1);
  }, [boardZoom, setZoomLevel]);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(boardZoom - 0.1);
  }, [boardZoom, setZoomLevel]);
  
  // Display loading state
  if (isBoardsLoading || isNotesLoading) {
    return <LoadingScreen />;
  }
  
  // Prevent hydration issues
  if (!isBrowser) {
    return null;
  }

  return (
    <main 
      className={styles.main} 
      onMouseMove={(e) => {
        handleDrag(e);
        handlePan(e);
        
        // Update area selection if active
        if (selectionArea?.isSelecting) {
          const rect = e.currentTarget.getBoundingClientRect();
          // Calculate board-space coordinates
          const x = (e.clientX - rect.left - boardOffset.x) / boardZoom;
          const y = (e.clientY - rect.top - boardOffset.y) / boardZoom;
          
          updateAreaSelection(x, y);
        }
      }}
      onMouseUp={(e) => {
        handleDragEnd();
        handlePanEnd();
        
        // Complete area selection if active
        if (selectionArea?.isSelecting) {
          completeAreaSelection(e.shiftKey || e.ctrlKey || e.metaKey);
        }
      }}
      onMouseDown={(e) => {
        console.log('Main onMouseDown triggered');
        
        // Handle area selection or panning based on mouse button
        if (e.button === 0) {  // Left click
          // If clicked directly on the main element (not on a note or control)
          if (e.target === e.currentTarget) {
            // Start area selection instead of just clearing
            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate board-space coordinates by accounting for zoom and offset
            const x = (e.clientX - rect.left - boardOffset.x) / boardZoom;
            const y = (e.clientY - rect.top - boardOffset.y) / boardZoom;
            
            console.log('Starting area selection from main at:', { x, y });
            startAreaSelection(x, y);
          }
        } else if (e.button === 2) {  // Right click
          // Use right click for panning
          handlePanStart(e);
        }
      }}
      onDoubleClick={handleDoubleClick}
      onWheel={handleZoom}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
    >
      <BoardTabs 
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitchBoard={switchBoard}
        onAddBoard={addBoard}
        onDeleteBoard={deleteBoard}
        onRenameBoard={renameBoard}
      />
      
      <Controls
        boardOffset={boardOffset}
        boardZoom={boardZoom}
        selectedNoteCount={selectedNoteIds.length}
        onClearAllNotes={clearAllNotes}
        onAddTestNote={testAddNote}
        onPanTestBoard={testPanBoard}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={resetZoom}
        onGroupNotes={groupSelectedNotes}
        onUngroupNotes={ungroupSelectedNotes}
      />

      {/* Render the SelectionArea component directly in the main container when active */}
      {selectionArea && (
        <div 
          style={{
            position: 'absolute',
            zIndex: 9999,
            pointerEvents: 'none',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${boardOffset.x + selectionArea.startX * boardZoom}px`,
              top: `${boardOffset.y + selectionArea.startY * boardZoom}px`,
              width: `${(selectionArea.endX - selectionArea.startX) * boardZoom}px`,
              height: `${(selectionArea.endY - selectionArea.startY) * boardZoom}px`,
              backgroundColor: 'rgba(65, 105, 225, 0.2)',
              border: '1px solid royalblue',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
      
      <Board
        boardOffset={boardOffset}
        boardZoom={boardZoom}
        notes={notes}
        availableColors={availableColors}
        editingNoteId={editingNoteId}
        selectedNoteIds={selectedNoteIds}
        selectionArea={null} /* Don't render selection area in Board anymore */
        editInputRef={editInputRef}
        onDoubleClick={handleDoubleClick}
        onDragStart={handleDragStart}
        onNoteTextChange={updateNoteText}
        onNoteColorChange={updateNoteColor}
        onDeleteNote={deleteNote}
        onStartEditing={startEditing}
        onStopEditing={stopEditing}
        onWheel={handleZoom}
        onSelectNote={toggleNoteSelection}
        onStartAreaSelection={startAreaSelection}
        onUpdateAreaSelection={updateAreaSelection}
        onCompleteAreaSelection={completeAreaSelection}
        onCancelAreaSelection={cancelAreaSelection}
      />
    </main>
  );
}