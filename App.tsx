
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import HUD from './components/HUD';
import { HandTracker } from './services/handTracker';
import { audioManager } from './services/audioManager';
import { AppState, ShapeType, HandData } from './types';
import { Sparkles, X, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentShape: 'Sphere',
    isStarted: false,
    isCameraEnabled: false,
    handFound: false,
    detectedGesture: 'None'
  });
  
  const [showHelp, setShowHelp] = useState(false);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isDown: false });
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);

  const startExperience = async () => {
    audioManager.init();
    setState(prev => ({ ...prev, isStarted: true }));
    setShowHelp(true);
    
    if (videoRef.current) {
      trackerRef.current = new HandTracker(videoRef.current);
      const success = await trackerRef.current.start();
      setState(prev => ({ ...prev, isCameraEnabled: success }));
      
      if (success) {
        trackerRef.current.onHandUpdate((data) => {
          setHandData(data);
          if (data) {
            setState(prev => ({ 
              ...prev, 
              handFound: true, 
              detectedGesture: data.gesture 
            }));
            
            // Interaction sound modulation
            audioManager.updateInteraction(data.isPinching ? 1 : 0.2);
            
            // Auto-morph based on gesture
            if (data.gesture !== 'None' && data.gesture !== state.currentShape) {
              handleShapeChange(data.gesture as ShapeType);
            }
          } else {
            setState(prev => ({ ...prev, handFound: false, detectedGesture: 'None' }));
            audioManager.updateInteraction(0);
          }
        });
      }
    }
  };

  const handleShapeChange = useCallback((newShape: ShapeType) => {
    setState(prev => ({ ...prev, currentShape: newShape }));
    audioManager.playWhoosh();
  }, []);

  // Mouse fallback handling
  useEffect(() => {
    if (!state.isStarted || state.handFound) return;

    const onMove = (e: MouseEvent) => {
      setMousePos(prev => ({
        ...prev,
        x: (e.clientX / window.innerWidth - 0.5) * 1000,
        y: -(e.clientY / window.innerHeight - 0.5) * 1000
      }));
    };
    
    const onDown = () => {
      setMousePos(prev => ({ ...prev, isDown: true }));
      audioManager.updateInteraction(1);
    };
    
    const onUp = () => {
      setMousePos(prev => ({ ...prev, isDown: false }));
      audioManager.updateInteraction(0.2);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [state.isStarted, state.handFound]);

  if (!state.isStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="relative z-10 text-center flex flex-col items-center gap-8 max-w-lg px-6">
          <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
            <Sparkles className="text-blue-400" size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-white">NEBULA_MATTER</h1>
            <p className="text-white/40 font-mono text-sm leading-relaxed">
              Synthesizing particle clouds from manual gesture data. 
              Computer vision link required for full immersion.
            </p>
          </div>
          <button
            onClick={startExperience}
            className="group flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20"
          >
            ENTER EXPERIENCE
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        {/* Background ambient particles (static placeholder) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/30 blur-[150px] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Scene 
        currentShape={state.currentShape} 
        handData={handData}
        mousePos={mousePos}
      />
      
      <HUD 
        state={state} 
        onSelectShape={handleShapeChange}
        onToggleHelp={() => setShowHelp(true)}
        videoRef={videoRef}
      />

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Sparkles size={24} className="text-blue-500" />
              GESTURE_GUIDE
            </h2>
            <div className="space-y-4">
              {[
                { gesture: '0-1 FINGERS', shape: 'SPHERE', desc: 'Default state' },
                { gesture: '2 FINGERS', shape: 'FLOWER', desc: 'Rose curve symmetry' },
                { gesture: '3 FINGERS', shape: 'SATURN', desc: 'Planetary ring formation' },
                { gesture: '4 FINGERS', shape: 'HEART', desc: 'Parametric affection' },
                { gesture: '5 FINGERS', shape: 'FIREWORKS', desc: 'Entropy burst' },
                { gesture: 'PINCH / CLICK', shape: 'ATTRACT', desc: 'Pull matter toward focus' },
              ].map(item => (
                <div key={item.shape} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[10px] font-mono opacity-50">{item.gesture}</div>
                    <div className="font-black text-blue-400">{item.shape}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-60">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-colors"
            >
              START EXPLORING
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
