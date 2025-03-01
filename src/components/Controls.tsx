import React from 'react';
import styles from '../styles/Controls.module.css';

interface ControlsProps {
  boardOffset: { x: number; y: number };
  boardZoom: number;
  selectedNoteCount: number;
  onClearAllNotes: () => void;
  onAddTestNote: () => void;
  onPanTestBoard: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onGroupNotes: () => void;
  onUngroupNotes: () => void;
}

export function Controls({
  boardOffset,
  boardZoom,
  selectedNoteCount,
  onClearAllNotes,
  onAddTestNote,
  onPanTestBoard,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onGroupNotes,
  onUngroupNotes
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.buttonGroup}>
        <button className={styles.clearButton} onClick={onClearAllNotes}>
          Clear All Notes
        </button>
        <button className={styles.addButton} onClick={onAddTestNote}>
          Add Note
        </button>
        <button className={styles.panButton} onClick={onPanTestBoard}>
          Pan Board
        </button>
      </div>
      
      {selectedNoteCount > 0 && (
        <div className={styles.selectionControls}>
          <div className={styles.selectionInfo}>
            {selectedNoteCount} note{selectedNoteCount !== 1 ? 's' : ''} selected
          </div>
          {selectedNoteCount > 1 && (
            <button 
              className={styles.groupButton} 
              onClick={onGroupNotes}
              title="Group selected notes"
            >
              Group
            </button>
          )}
          {selectedNoteCount > 0 && (
            <button 
              className={styles.ungroupButton} 
              onClick={onUngroupNotes}
              title="Ungroup selected notes"
            >
              Ungroup
            </button>
          )}
        </div>
      )}
      
      <div className={styles.zoomControls}>
        <button className={styles.zoomButton} onClick={onZoomOut} title="Zoom Out">
          -
        </button>
        <button className={styles.zoomResetButton} onClick={onResetZoom} title="Reset Zoom">
          {Math.round(boardZoom * 100)}%
        </button>
        <button className={styles.zoomButton} onClick={onZoomIn} title="Zoom In">
          +
        </button>
      </div>
      
      <div className={styles.helpText}>
        Double-click to add a note
        <br />
        Right-click and drag to pan
        <br />
        Scroll to zoom
        <br />
        Ctrl+click or drag to select notes
      </div>
      
      <div className={styles.debugInfo}>
        Position: x={boardOffset.x.toFixed(0)}, y={boardOffset.y.toFixed(0)}
        <br />
        Zoom: {(boardZoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}