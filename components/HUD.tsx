
import React from 'react';
import { Settings, Info, Camera, CameraOff, Hand, MousePointer2 } from 'lucide-react';
import { ShapeType, AppState } from '../types';
import { SHAPES } from '../constants';

interface HUDProps {
  state: AppState;
  onSelectShape: (shape: ShapeType) => void;
  onToggleHelp: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const HUD: React.FC<HUDProps> = ({ state, onSelectShape, onToggleHelp, videoRef }) => {
  return (
    <div className="fixed inset-0 flex flex-col pointer-events-none p-6 select-none text-white/90">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            NEBULA_CONTROL.v1
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${state.isCameraEnabled ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
            <span className="text-[10px] uppercase font-mono tracking-widest opacity-60">
              {state.isCameraEnabled ? 'Active CV Link' : 'Mouse Fallback Mode'}
            </span>
          </div>
        </div>

        <button 
          onClick={onToggleHelp}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-md"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Center Feedback */}
      <div className="flex-1 flex flex-col items-center justify-center opacity-40">
        {state.handFound ? (
          <div className="text-center">
            <div className="text-[10px] font-mono mb-2">GESTURE_LOCK</div>
            <div className="text-6xl font-black tracking-widest uppercase text-blue-400">
              {state.detectedGesture === 'None' ? 'SEARCHING...' : state.detectedGesture}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent mb-4" />
            <span className="text-xs uppercase font-mono tracking-widest">Awaiting interaction...</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        <div className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-white/5 rounded-full backdrop-blur-xl">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => onSelectShape(shape)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${
                state.currentShape === shape 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'hover:bg-white/10 text-white/40'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>

        <div className="text-[9px] opacity-30 font-mono tracking-[0.3em]">
          DRAG TO SWIRL • CLICK TO ATTRACT • GESTURES MORPH MATTER
        </div>
      </div>

      {/* Side HUD Elements */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div className="relative group">
          <video 
            ref={videoRef}
            autoPlay
            muted
            className={`w-40 h-32 object-cover rounded-xl border border-white/10 bg-black/80 transition-all ${
              state.handFound ? 'grayscale-0 opacity-100' : 'grayscale opacity-40 blur-sm'
            }`}
          />
          <div className="absolute -top-2 -right-2 bg-blue-500 p-1.5 rounded-lg shadow-xl">
            {state.isCameraEnabled ? <Camera size={12} /> : <CameraOff size={12} />}
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-4 opacity-20">
        <div className="p-2 border border-white/10 rounded-lg">
          <Hand size={16} />
        </div>
        <div className="p-2 border border-white/10 rounded-lg">
          <MousePointer2 size={16} />
        </div>
      </div>
    </div>
  );
};

export default HUD;
