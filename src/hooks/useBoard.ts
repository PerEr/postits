import { useState, useCallback, useEffect } from 'react';
import { BoardPosition, BoardState } from '../types';

// Constants for zoom limits
const MIN_ZOOM = 0.25; // 25% zoom (zoomed out)
const MAX_ZOOM = 3.0;  // 300% zoom (zoomed in) 
const ZOOM_SPEED = 0.1; // How much to zoom per scroll event

export function useBoard(isBrowser: boolean, boardState: BoardState, onBoardStateChange: (newState: BoardState) => void) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<BoardPosition>({ x: 0, y: 0 });

  // Start panning the board - but only with right mouse button (button 2)
  const handlePanStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start panning on right mouse button (button 2)
    if (e.button === 2) {
      console.log('Pan start detected with right mouse button');
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      
      // Add class to body for cursor change
      document.body.classList.add('panning');
    }
  }, []);

  // Pan the board while mouse is moving
  const handlePan = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      const newState: BoardState = {
        ...boardState,
        offset: {
          x: boardState.offset.x + dx,
          y: boardState.offset.y + dy
        }
      };
      
      onBoardStateChange(newState);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart, boardState, onBoardStateChange]);

  // Stop panning
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    
    // Remove panning class from body
    document.body.classList.remove('panning');
  }, []);

  // Test function to move the board
  const moveBoardBy = useCallback((x: number, y: number) => {
    const newState: BoardState = {
      ...boardState,
      offset: {
        x: boardState.offset.x + x,
        y: boardState.offset.y + y
      }
    };
    
    onBoardStateChange(newState);
  }, [boardState, onBoardStateChange]);

  // Handle zoom with mouse wheel
  const handleZoom = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    console.log('Wheel event detected!', e.deltaY, e.deltaMode);
    
    e.preventDefault(); // Prevent default scroll behavior
    e.stopPropagation(); // Stop event propagation
    
    // Calculate zoom direction based on wheel delta
    const delta = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = delta * ZOOM_SPEED;
    
    console.log('Zoom calculation:', { delta, zoomFactor });
    
    // Get cursor position relative to the viewport
    const cursorX = e.clientX;
    const cursorY = e.clientY;
    
    // Calculate new zoom level with limits
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, boardState.zoom + zoomFactor));
    
    // Calculate zoom delta
    const zoomDelta = newZoom / boardState.zoom;
    
    // Calculate new offset to zoom toward cursor position
    const newOffsetX = cursorX - (cursorX - boardState.offset.x) * zoomDelta;
    const newOffsetY = cursorY - (cursorY - boardState.offset.y) * zoomDelta;
    
    console.log('Zooming board:', { 
      oldZoom: boardState.zoom,
      newZoom, 
      zoomDelta, 
      cursorX, 
      cursorY, 
      oldOffsetX: boardState.offset.x,
      oldOffsetY: boardState.offset.y,
      newOffsetX, 
      newOffsetY 
    });
    
    const newState: BoardState = {
      zoom: newZoom,
      offset: {
        x: newOffsetX,
        y: newOffsetY
      }
    };
    
    onBoardStateChange(newState);
    
    // Return false to ensure the event is canceled
    return false;
  }, [boardState, onBoardStateChange]);

  // Directly set zoom level (for UI controls)
  const setZoomLevel = useCallback((newZoom: number) => {
    const newState: BoardState = {
      ...boardState,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
    };
    
    onBoardStateChange(newState);
  }, [boardState, onBoardStateChange]);

  // Reset zoom to 100%
  const resetZoom = useCallback(() => {
    const newState: BoardState = {
      ...boardState,
      zoom: 1.0
    };
    
    onBoardStateChange(newState);
  }, [boardState, onBoardStateChange]);

  return {
    boardOffset: boardState.offset,
    boardZoom: boardState.zoom,
    isPanning,
    handlePanStart,
    handlePan,
    handlePanEnd,
    handleZoom,
    moveBoardBy,
    setZoomLevel,
    resetZoom
  };
}