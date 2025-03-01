// Define core types used throughout the application

export interface Note {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string; // Hex code or named color
  boardId: string; // Board this note belongs to
  groupId?: string; // Optional group identifier for grouped notes
}

export interface BoardPosition {
  x: number;
  y: number;
}

export interface BoardState {
  offset: BoardPosition;
  zoom: number;
}

export interface DraggedNote {
  id: number;
  startX: number;
  startY: number;
}

export interface Board {
  id: string;
  name: string;
  state: BoardState;
  createdAt: number;
}

export interface BoardsState {
  boards: Board[];
  activeBoardId: string;
}