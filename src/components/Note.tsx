import React, { useState } from 'react';
import { Note as NoteType } from '../types';
import { ColorPicker } from './ColorPicker';
import styles from '../styles/Note.module.css';

interface NoteProps {
  note: NoteType;
  isEditing: boolean;
  isSelected: boolean;
  editInputRef: React.RefObject<HTMLTextAreaElement>;
  availableColors: string[];
  onDragStart: (e: React.MouseEvent, id: number) => void;
  onTextChange: (id: number, text: string) => void;
  onColorChange: (id: number, color: string) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onStartEditing: (id: number) => void;
  onStopEditing: () => void;
  onSelect: (id: number, isMultiSelect: boolean) => void;
}

export function Note({
  note,
  isEditing,
  isSelected,
  editInputRef,
  availableColors,
  onDragStart,
  onTextChange,
  onColorChange,
  onDelete,
  onStartEditing,
  onStopEditing,
  onSelect
}: NoteProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Calculate text color based on note background color (for contrast)
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance - darker colors need white text
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };
  
  const textColor = getTextColor(note.color);
  
  return (
    <div
      className={`${styles.note} ${isSelected ? styles.selected : ''} ${note.groupId ? styles.grouped : ''}`}
      style={{ 
        left: note.x, 
        top: note.y, 
        backgroundColor: note.color,
        borderColor: note.color === '#ffffff' ? '#cccccc' : adjustColorBrightness(note.color, -20),
        color: textColor
      }}
      onMouseDown={(e) => {
        // Only start dragging with left mouse button
        if (e.button === 0) {
          e.stopPropagation(); // Prevent board panning when interacting with notes
          
          // If user is holding Ctrl/Cmd key and clicking, select without dragging
          if (e.ctrlKey || e.metaKey) {
            onSelect(note.id, true);
          } else {
            // Otherwise, select (potentially clearing others) and allow dragging
            if (!isSelected) {
              onSelect(note.id, e.shiftKey);
            }
            onDragStart(e, note.id);
          }
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        // If this was a simple click (not part of drag), handle selection
        if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
          // onSelect(note.id, false);
        }
      }}
    >
      <div className={styles.noteHeader}>
        <div 
          className={styles.colorButton} 
          style={{ backgroundColor: note.color }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        <div className={styles.deleteButton} onClick={(e) => onDelete(note.id, e)}>✕</div>
      </div>
      
      {showColorPicker && (
        <div className={styles.colorPickerContainer}>
          <ColorPicker 
            availableColors={availableColors}
            selectedColor={note.color}
            onColorSelect={(color) => {
              onColorChange(note.id, color);
              setShowColorPicker(false);
            }}
          />
        </div>
      )}
      
      <div className={styles.noteContent}>
        {isEditing ? (
          <textarea
            ref={editInputRef}
            className={styles.noteInput}
            style={{ color: textColor }}
            value={note.text}
            onChange={(e) => onTextChange(note.id, e.target.value)}
            onBlur={onStopEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onStopEditing();
              }
            }}
          />
        ) : (
          <div onClick={() => onStartEditing(note.id)}>{note.text}</div>
        )}
      </div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number) {
  // Remove the # character if present
  color = color.replace('#', '');
  
  // Convert to decimal
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}