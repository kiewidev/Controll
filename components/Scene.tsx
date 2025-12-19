
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { 
  PARTICLE_COUNT, 
  LERP_SPEED, 
  ROTATION_SPEED, 
  generateShapePositions 
} from '../constants';
import { ShapeType, HandData } from '../types';

interface SceneProps {
  currentShape: ShapeType;
  handData: HandData | null;
  mousePos: { x: number, y: number, isDown: boolean };
}

const Scene: React.FC<SceneProps> = ({ currentShape, handData, mousePos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const targetPositionsRef = useRef<Float32Array>(generateShapePositions('Sphere', PARTICLE_COUNT));

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = generateShapePositions('Sphere', PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    particlesRef.current = points;

    // Animation loop
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = points.geometry.attributes.color as THREE.BufferAttribute;
      const targetArr = targetPositionsRef.current;
      
      const interactionPoint = handData ? 
        new THREE.Vector3(handData.point.x, handData.point.y, handData.point.z) : 
        new THREE.Vector3(mousePos.x, mousePos.y, 0);
      
      const isInteracting = handData ? handData.isPinching : mousePos.isDown;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        
        // Morphing LERP
        posAttr.array[idx] += (targetArr[idx] - posAttr.array[idx]) * LERP_SPEED;
        posAttr.array[idx + 1] += (targetArr[idx + 1] - posAttr.array[idx + 1]) * LERP_SPEED;
        posAttr.array[idx + 2] += (targetArr[idx + 2] - posAttr.array[idx + 2]) * LERP_SPEED;

        // Force Fields (Attract/Repel)
        const px = posAttr.array[idx];
        const py = posAttr.array[idx + 1];
        const pz = posAttr.array[idx + 2];
        
        const dx = interactionPoint.x - px;
        const dy = interactionPoint.y - py;
        const dz = interactionPoint.z - pz;
        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);

        if (dist < 300) {
          const force = isInteracting ? 0.05 : -0.01; // Attract if pinching/clicking, else slight repel
          posAttr.array[idx] += dx * force;
          posAttr.array[idx + 1] += dy * force;
          posAttr.array[idx + 2] += dz * force;
        }

        // Color modulation based on position and time
        const hue = (dist / 1000 + Date.now() * 0.0001) % 1;
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        colorAttr.array[idx] = color.r;
        colorAttr.array[idx + 1] = color.g;
        colorAttr.array[idx + 2] = color.b;
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      points.rotation.y += ROTATION_SPEED;
      points.rotation.x += ROTATION_SPEED * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update target when shape changes
  useEffect(() => {
    targetPositionsRef.current = generateShapePositions(currentShape, PARTICLE_COUNT);
  }, [currentShape]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />;
};

export default Scene;
