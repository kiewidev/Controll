
class AudioManager {
  private ctx: AudioContext | null = null;
  private drone: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    this.drone = this.ctx.createOscillator();
    this.drone.type = 'sine';
    this.drone.frequency.setValueAtTime(55, this.ctx.currentTime); // A1
    this.drone.connect(this.filter);
    this.drone.start();
  }

  updateInteraction(intensity: number) {
    if (!this.ctx || !this.filter || !this.masterGain) return;
    
    const targetFreq = 400 + intensity * 2000;
    const targetGain = 0.1 + intensity * 0.3;
    
    this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  playWhoosh() {
    if (!this.ctx || !this.masterGain) return;
    
    const noiseLength = 0.5 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, noiseLength, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(1000, this.ctx.currentTime);
    bpf.Q.setValueAtTime(1, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    
    source.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterGain);
    
    source.start();
    source.stop(this.ctx.currentTime + 0.5);
  }
}

export const audioManager = new AudioManager();
