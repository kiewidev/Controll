
import * as THREE from 'three';
import { ShapeType } from './types';

export const PARTICLE_COUNT = 15000;
export const LERP_SPEED = 0.05;
export const ROTATION_SPEED = 0.002;

export const SHAPES: ShapeType[] = ['Sphere', 'Heart', 'Flower', 'Saturn', 'Fireworks'];

export const generateShapePositions = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const t = i / count;
    
    switch (shape) {
      case 'Sphere': {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const r = 200;
        x = r * Math.cos(theta) * Math.sin(phi);
        y = r * Math.sin(theta) * Math.sin(phi);
        z = r * Math.cos(phi);
        break;
      }
      case 'Heart': {
        const angle = Math.random() * Math.PI * 2;
        const r = 12;
        x = 16 * Math.pow(Math.sin(angle), 3);
        y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
        z = (Math.random() - 0.5) * 5;
        // Scale up
        x *= 15; y *= 15; z *= 15;
        break;
      }
      case 'Flower': {
        const angle = Math.random() * Math.PI * 2;
        const k = 5; // Number of petals
        const r = 200 * Math.cos(k * angle);
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        z = (Math.random() - 0.5) * 40;
        break;
      }
      case 'Saturn': {
        if (i < count * 0.4) {
          // Central Sphere
          const phi = Math.acos(-1 + (2 * i) / (count * 0.4));
          const theta = Math.sqrt(count * 0.4 * Math.PI) * phi;
          const r = 100;
          x = r * Math.cos(theta) * Math.sin(phi);
          y = r * Math.sin(theta) * Math.sin(phi);
          z = r * Math.cos(phi);
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          const r = 180 + Math.random() * 80;
          x = r * Math.cos(angle);
          y = (Math.random() - 0.5) * 10;
          z = r * Math.sin(angle);
          // Tilt the ring
          const tempY = y * Math.cos(0.5) - z * Math.sin(0.5);
          const tempZ = y * Math.sin(0.5) + z * Math.cos(0.5);
          y = tempY;
          z = tempZ;
        }
        break;
      }
      case 'Fireworks': {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const r = Math.random() * 400;
        x = r * Math.cos(phi) * Math.sin(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(theta);
        break;
      }
    }
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  
  return positions;
};
