import React from 'react';
import styles from '../styles/SelectionArea.module.css';

interface SelectionAreaProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function SelectionArea({ startX, startY, endX, endY }: SelectionAreaProps) {
  // Calculate selection rectangle dimensions
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  // Don't render if there's no area to select
  if (width === 0 && height === 0) {
    return null;
  }
  
  return (
    <div
      className={styles.selectionArea}
      style={{
        left,
        top,
        width,
        height
      }}
    />
  );
}