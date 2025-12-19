
import { HandData, ShapeType } from '../types';

declare const Hands: any;
declare const Camera: any;

export class HandTracker {
  private hands: any;
  private camera: any;
  private videoElement: HTMLVideoElement;
  private callbacks: ((data: HandData | null) => void)[] = [];
  private gestureSmoothingBuffer: ShapeType[] = [];
  private readonly BUFFER_SIZE = 15;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults((results: any) => this.processResults(results));

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });
  }

  async start() {
    try {
      await this.camera.start();
      return true;
    } catch (e) {
      console.error("Camera access denied", e);
      return false;
    }
  }

  onHandUpdate(callback: (data: HandData | null) => void) {
    this.callbacks.push(callback);
  }

  private processResults(results: any) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.callbacks.forEach(cb => cb(null));
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    
    // Index Tip: Landmark 8
    const indexTip = landmarks[8];
    // Thumb Tip: Landmark 4
    const thumbTip = landmarks[4];
    
    // Distance for pinch
    const dx = indexTip.x - thumbTip.x;
    const dy = indexTip.y - thumbTip.y;
    const dz = indexTip.z - thumbTip.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const isPinching = dist < 0.05;

    // Gesture detection based on raised fingers
    const raisedFingers = this.countRaisedFingers(landmarks);
    let rawGesture: ShapeType | 'None' = 'None';
    
    if (raisedFingers === 2) rawGesture = 'Flower';
    else if (raisedFingers === 3) rawGesture = 'Saturn';
    else if (raisedFingers === 4) rawGesture = 'Heart';
    else if (raisedFingers === 5) rawGesture = 'Fireworks';
    else if (raisedFingers <= 1) rawGesture = 'Sphere';

    // Smoothing
    if (rawGesture !== 'None') {
      this.gestureSmoothingBuffer.push(rawGesture as ShapeType);
      if (this.gestureSmoothingBuffer.length > this.BUFFER_SIZE) {
        this.gestureSmoothingBuffer.shift();
      }
    }

    const smoothedGesture = this.getMostFrequentGesture();

    const data: HandData = {
      point: {
        x: (indexTip.x - 0.5) * 1000,
        y: -(indexTip.y - 0.5) * 1000,
        z: indexTip.z * 500
      },
      isPinching,
      gesture: smoothedGesture,
      confidence: results.multiHandLandmarks.length > 0 ? 1 : 0
    };

    this.callbacks.forEach(cb => cb(data));
  }

  private countRaisedFingers(landmarks: any) {
    // MediaPipe Hand Landmarks indices
    // 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
    // Compare Tip Y with joint below it (e.g., 8 with 6)
    let count = 0;
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;
    
    // Thumb is trickier - horizontal distance often works better
    const thumbDist = Math.abs(landmarks[4].x - landmarks[17].x);
    if (thumbDist > 0.1) count++;

    return count;
  }

  private getMostFrequentGesture(): ShapeType | 'None' {
    if (this.gestureSmoothingBuffer.length < this.BUFFER_SIZE / 2) return 'None';
    const counts: Record<string, number> = {};
    this.gestureSmoothingBuffer.forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
    });
    
    let max = 0;
    let result: ShapeType | 'None' = 'None';
    for (const g in counts) {
      if (counts[g] > max) {
        max = counts[g];
        result = g as ShapeType;
      }
    }
    return max > this.BUFFER_SIZE * 0.6 ? result : 'None';
  }
}
