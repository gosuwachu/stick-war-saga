let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, ramp?: number): void {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (ramp !== undefined) osc.frequency.linearRampToValueAtTime(ramp, c.currentTime + dur);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + dur);
}

function playNoise(dur: number, vol = 0.08): void {
  const c = getCtx();
  const bufferSize = c.sampleRate * dur;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, c.currentTime);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(c.currentTime);
  src.stop(c.currentTime + dur);
}

export function playAttack(type: string): void {
  switch (type) {
    case 'Miner':    playTone(100, 0.08, 'sawtooth', 0.08, 60); break;
    case 'Swordsman': playTone(220, 0.1, 'triangle', 0.1, 120); break;
    case 'Archer':   playTone(700, 0.12, 'sine', 0.08, 300); break;
    case 'Spearman': playTone(300, 0.1, 'square', 0.08, 150); break;
    case 'Knight':   playTone(160, 0.12, 'sawtooth', 0.12, 80); break;
    case 'Mage':     playNoise(0.15, 0.12); playTone(2000, 0.08, 'sine', 0.06, 3000); break;
    case 'Giant':    playTone(70, 0.2, 'sawtooth', 0.15, 35); break;
    case 'Healer':   playTone(1000, 0.15, 'sine', 0.08, 1300); break;
  }
}

export function playDeath(): void {
  playTone(400, 0.25, 'triangle', 0.1, 80);
  playNoise(0.2, 0.05);
}

export function playHeal(): void {
  playTone(800, 0.12, 'sine', 0.08, 1200);
}
