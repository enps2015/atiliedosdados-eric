interface ActiveHoverNodes {
  masterGain: GainNode;
  humOsc: OscillatorNode;
  harmonicOsc: OscillatorNode;
  humFilter: BiquadFilterNode;
  noiseSrc: AudioBufferSourceNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
}

class LabAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private _muted = false;
  private hoverNodes: ActiveHoverNodes | null = null;
  private hoveredStation: number | null = null;
  private stopTimer: number | null = null;
  private lastSparkTime = 0;

  public get muted(): boolean {
    return this._muted;
  }

  public set muted(val: boolean) {
    this._muted = val;
    if (val) {
      this.stopStaticHover();
    }
  }

  private ensureContext(): AudioContext | null {
    if (this._muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      // Slight pink/warm tilt mixed with crisp white transient
      lastOut = (lastOut + 0.08 * white) / 1.08;
      data[i] = white * 0.65 + lastOut * 1.35;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public triggerHaptic(pattern: number | number[] = 10): void {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore browser haptic permission restrictions
    }
  }

  private clearStopTimer(): void {
    if (this.stopTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }

  private teardownHoverNodes(nodes: ActiveHoverNodes): void {
    try {
      nodes.humOsc.stop();
      nodes.harmonicOsc.stop();
      nodes.noiseSrc.stop();
      nodes.lfoOsc.stop();
    } catch {
      // Ignore already stopped sources
    }
    try {
      nodes.masterGain.disconnect();
      nodes.humOsc.disconnect();
      nodes.harmonicOsc.disconnect();
      nodes.humFilter.disconnect();
      nodes.noiseSrc.disconnect();
      nodes.noiseFilter.disconnect();
      nodes.noiseGain.disconnect();
      nodes.lfoOsc.disconnect();
      nodes.lfoGain.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  private playStaticSpark(ctx: AudioContext, stationId: number): void {
    const perfNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (perfNow - this.lastSparkTime < 95) return;
    this.lastSparkTime = perfNow;

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.ensureNoiseBuffer(ctx);
    src.loop = false;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600 + stationId * 240, now);
    filter.Q.setValueAtTime(3.6, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const offset = Math.random() * 1.4;
    src.start(now, offset, 0.05);
    src.stop(now + 0.052);
  }

  public startStaticHover(stationId: number): void {
    if (this._muted) return;
    const ctx = this.ensureContext();
    // Avoid queuing silent continuous oscillators before first user gesture
    if (!ctx || ctx.state !== 'running') return;

    this.clearStopTimer();
    const now = ctx.currentTime;
    const isNewStation = this.hoveredStation !== stationId;
    this.hoveredStation = stationId;

    const humFreq = 56 + stationId * 7;
    const harmonicFreq = stationId === 6 ? 240 : 122 + stationId * 14;
    const crackleCenter = 2200 + stationId * 280;

    if (this.hoverNodes) {
      this.hoverNodes.humOsc.frequency.setTargetAtTime(humFreq, now, 0.04);
      this.hoverNodes.harmonicOsc.frequency.setTargetAtTime(harmonicFreq, now, 0.04);
      this.hoverNodes.noiseFilter.frequency.setTargetAtTime(crackleCenter, now, 0.04);
      this.hoverNodes.masterGain.gain.setTargetAtTime(1.0, now, 0.035);
      if (isNewStation) {
        this.playStaticSpark(ctx, stationId);
      }
      return;
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.setTargetAtTime(1.0, now, 0.045);
    masterGain.connect(ctx.destination);

    // 1. Warm transformer / vacuum-tube 60Hz-harmonic hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(humFreq, now);

    const harmonicOsc = ctx.createOscillator();
    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(harmonicFreq, now);

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(240, now);
    humFilter.Q.setValueAtTime(1.6, now);

    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.015, now);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.007, now);

    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(masterGain);

    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(masterGain);

    // 2. Band-passed electrostatic hiss modulated by subtle LFO
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.ensureNoiseBuffer(ctx);
    noiseSrc.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(crackleCenter, now);
    noiseFilter.Q.setValueAtTime(3.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.009, now);

    const lfoOsc = ctx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(6.8, now);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.0035, now);

    lfoOsc.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    humOsc.start(now);
    harmonicOsc.start(now);
    noiseSrc.start(now, Math.random() * 1.2);
    lfoOsc.start(now);

    this.hoverNodes = {
      masterGain,
      humOsc,
      harmonicOsc,
      humFilter,
      noiseSrc,
      noiseFilter,
      noiseGain,
      lfoOsc,
      lfoGain,
    };

    this.playStaticSpark(ctx, stationId);
  }

  public stopStaticHover(): void {
    this.hoveredStation = null;
    const nodes = this.hoverNodes;
    if (!nodes) return;

    this.clearStopTimer();
    const ctx = this.ctx;
    if (ctx) {
      const now = ctx.currentTime;
      nodes.masterGain.gain.cancelScheduledValues(now);
      nodes.masterGain.gain.setTargetAtTime(0.0001, now, 0.024);
    }

    if (typeof window !== 'undefined') {
      this.stopTimer = window.setTimeout(() => {
        if (this.hoverNodes === nodes) {
          this.hoverNodes = null;
        }
        this.teardownHoverNodes(nodes);
        this.stopTimer = null;
      }, 110);
    } else {
      this.hoverNodes = null;
      this.teardownHoverNodes(nodes);
    }
  }

  public playGearSnap(stationId = 3): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const noiseBuf = this.ensureNoiseBuffer(ctx);

    // 1. Primary brass gear-tooth clack
    const tooth1 = ctx.createBufferSource();
    tooth1.buffer = noiseBuf;
    const tooth1Filter = ctx.createBiquadFilter();
    tooth1Filter.type = 'bandpass';
    tooth1Filter.frequency.setValueAtTime(1920 + stationId * 85, now);
    tooth1Filter.Q.setValueAtTime(4.2, now);
    const tooth1Gain = ctx.createGain();
    tooth1Gain.gain.setValueAtTime(0.001, now);
    tooth1Gain.gain.linearRampToValueAtTime(0.095, now + 0.003);
    tooth1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    tooth1.connect(tooth1Filter);
    tooth1Filter.connect(tooth1Gain);
    tooth1Gain.connect(ctx.destination);
    tooth1.start(now, Math.random() * 1.1, 0.038);
    tooth1.stop(now + 0.04);

    // 2. Secondary ratchet detent latch (+18ms)
    const latchTime = now + 0.018;
    const tooth2 = ctx.createBufferSource();
    tooth2.buffer = noiseBuf;
    const tooth2Filter = ctx.createBiquadFilter();
    tooth2Filter.type = 'bandpass';
    tooth2Filter.frequency.setValueAtTime(3050 + stationId * 110, latchTime);
    tooth2Filter.Q.setValueAtTime(5.2, latchTime);
    const tooth2Gain = ctx.createGain();
    tooth2Gain.gain.setValueAtTime(0.001, latchTime);
    tooth2Gain.gain.linearRampToValueAtTime(0.072, latchTime + 0.002);
    tooth2Gain.gain.exponentialRampToValueAtTime(0.0001, latchTime + 0.026);
    tooth2.connect(tooth2Filter);
    tooth2Filter.connect(tooth2Gain);
    tooth2Gain.connect(ctx.destination);
    tooth2.start(latchTime, Math.random() * 1.1, 0.032);
    tooth2.stop(latchTime + 0.034);

    // 3. Bakelite / walnut mechanical spring thud
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(270 + stationId * 12, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(84, now + 0.05);
    bodyGain.gain.setValueAtTime(0.075, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.06);

    // 4. Subtle sci-fi relay harmonic ping
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(720 + stationId * 65, latchTime);
    pingOsc.frequency.exponentialRampToValueAtTime(540 + stationId * 45, latchTime + 0.075);
    pingGain.gain.setValueAtTime(0.028, latchTime);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, latchTime + 0.08);
    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);
    pingOsc.start(latchTime);
    pingOsc.stop(latchTime + 0.085);
  }

  public playWoodClick(pitch = 320): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playBrassTick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playSuccessChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const start = now + i * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }
}

export const labAudio = new LabAudioEngine();
