import React from 'react';
import styles from '../styles/ColorPicker.module.css';

interface ColorPickerProps {
  availableColors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ 
  availableColors, 
  selectedColor, 
  onColorSelect 
}: ColorPickerProps) {
  return (
    <div className={styles.colorPicker}>
      {availableColors.map(color => (
        <div
          key={color}
          className={`${styles.colorSwatch} ${color === selectedColor ? styles.selected : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
          title={`Change to ${color}`}
        />
      ))}
    </div>
  );
}