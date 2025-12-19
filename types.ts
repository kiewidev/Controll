
export type ShapeType = 'Sphere' | 'Heart' | 'Flower' | 'Saturn' | 'Fireworks';

export interface HandData {
  point: { x: number; y: number; z: number };
  isPinching: boolean;
  gesture: ShapeType | 'None';
  confidence: number;
}

export interface AppState {
  currentShape: ShapeType;
  isStarted: boolean;
  isCameraEnabled: boolean;
  handFound: boolean;
  detectedGesture: ShapeType | 'None';
}
