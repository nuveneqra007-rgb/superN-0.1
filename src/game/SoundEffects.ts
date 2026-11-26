// =============================================================
// SoundEffects.ts — Síntesis de audio procedimental (Web Audio API)
// Sin dependencias externas ni archivos pesados de audio
// =============================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public resumeAudio() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playPunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playHeavyCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.35);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playHeavySmash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Sub-bass thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);
    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.29);

    // Impact burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.18);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.18);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + 0.22);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.23);
  }

  public playGrapple() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playThrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.18);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playSwordSwing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Silbido aerodinámico del filo cortando el aire
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(450, t + 0.14);
    filter.Q.setValueAtTime(3.5, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.14);

    // Resonancia metálica sutil
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    oscGain.gain.setValueAtTime(0.15, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playBladeHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Resonancia aguda de impacto de acero / filo
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1250, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.16);
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);

    // Ruido de corte lacerante
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.15);
  }

  public playHeavyBladeSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Sonido demoledor de tajo pesado con resonancia armónica
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(450, t);
    osc1.frequency.exponentialRampToValueAtTime(60, t + 0.28);
    gain1.gain.setValueAtTime(0.45, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.29);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, t);
    osc2.frequency.exponentialRampToValueAtTime(220, t + 0.22);
    gain2.gain.setValueAtTime(0.3, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.23);
  }

  private pitchJitter(amount: number = 0.06): number {
    return 1 + (Math.random() * 2 - 1) * amount;
  }

  private createNoiseSource(durationSec: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * durationSec));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  public playMeleeSwing(comboStep: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.07);
    const noise = this.createNoiseSource(0.09);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const baseFreq = comboStep >= 2 ? 420 : 620;
      filter.frequency.setValueAtTime(baseFreq * jitter, t);
      filter.frequency.exponentialRampToValueAtTime(190 * jitter, t + 0.08);
      filter.Q.value = 2.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(comboStep >= 2 ? 0.22 : 0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.09);
    }

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime((comboStep >= 2 ? 170 : 210) * jitter, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.09);
    oscGain.gain.setValueAtTime(0.18, t);
    oscGain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playMeleeHit(heavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.06);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = heavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime((heavy ? 130 : 175) * jitter, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + (heavy ? 0.16 : 0.1));

    gain.gain.setValueAtTime(heavy ? 0.45 : 0.34, t);
    gain.gain.exponentialRampToValueAtTime(0.008, t + (heavy ? 0.16 : 0.1));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + (heavy ? 0.17 : 0.11));
  }

  public playKnifeSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.06);
    const noise = this.createNoiseSource(0.08);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2400 * jitter, t);
      filter.frequency.exponentialRampToValueAtTime(950, t + 0.07);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.07);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.08);
    }
  }

  public playSwordComboSlash(comboStep: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.04);
    const stepMult = comboStep === 0 ? 1 : comboStep === 1 ? 1.15 : 0.85;
    const dur = comboStep >= 2 ? 0.18 : 0.12;

    const noise = this.createNoiseSource(dur);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600 * stepMult * jitter, t);
      filter.frequency.exponentialRampToValueAtTime(650 * stepMult, t + dur);
      filter.Q.value = 3.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(comboStep >= 2 ? 0.36 : 0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + dur + 0.01);
    }

    // Destello metálico de acero
    const steel = this.ctx.createOscillator();
    const steelGain = this.ctx.createGain();
    steel.type = 'sine';
    steel.frequency.setValueAtTime(1450 * stepMult * jitter, t);
    steel.frequency.exponentialRampToValueAtTime(720 * stepMult, t + dur * 0.85);
    steelGain.gain.setValueAtTime(0.09, t);
    steelGain.gain.exponentialRampToValueAtTime(0.003, t + dur * 0.85);
    steel.connect(steelGain);
    steelGain.connect(this.ctx.destination);
    steel.start(t);
    steel.stop(t + dur);
  }

  public playBluntSwing() {
    this.playMeleeSwing(2);
  }

  public playBluntHit(material: 'wood' | 'metal' = 'wood') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.06);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (material === 'metal') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(480 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(190, t + 0.16);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.16);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.12);
      gain.gain.setValueAtTime(0.38, t);
      gain.gain.exponentialRampToValueAtTime(0.006, t + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playShockHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.setValueAtTime(620, t + 0.03);
    osc.frequency.setValueAtTime(1380, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.16);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.006, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playChainsawAttack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.linearRampToValueAtTime(175, t + 0.08);
    osc.frequency.linearRampToValueAtTime(125, t + 0.2);

    gain.gain.setValueAtTime(0.26, t);
    gain.gain.exponentialRampToValueAtTime(0.008, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playGlassBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const noise = this.createNoiseSource(0.16);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.004, t + 0.16);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.17);
    }
  }

  public playWhipCrack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playFlareLaunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(1150, t + 0.18);
    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.006, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playBazookaLaunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ignición de tubo + silbido de propulsión del cohete
    const noise = this.createNoiseSource(0.32);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(1250, t + 0.16);
      filter.frequency.exponentialRampToValueAtTime(260, t + 0.32);
      filter.Q.value = 1.4;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.33);
    }

    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(140, t);
    thump.frequency.exponentialRampToValueAtTime(35, t + 0.18);
    thumpGain.gain.setValueAtTime(0.45, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.008, t + 0.18);
    thump.connect(thumpGain);
    thumpGain.connect(this.ctx.destination);
    thump.start(t);
    thump.stop(t + 0.19);
  }

  public playGunshot(type: string = 'pistol') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (type === 'bazooka') {
      this.playBazookaLaunch();
      return;
    }

    const t = this.ctx.currentTime;
    const jitter = this.pitchJitter(0.05);

    if (type === 'lazer') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.14);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.006, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      return;
    }

    if (type === 'bow') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
      return;
    }

    if (type === 'glauncher') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(210 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.14);
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.008, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      return;
    }

    if (type === 'flamethrower') {
      const noise = this.createNoiseSource(0.14);
      if (noise) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750 * jitter, t);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(t);
        noise.stop(t + 0.15);
      }
      return;
    }

    // Ruido blanco para explosión de pólvora según calibre
    const dur =
      type === 'shotgun'
        ? 0.22
        : type === 'sniper'
        ? 0.24
        : type === 'silenced'
        ? 0.06
        : type === 'rifle'
        ? 0.14
        : type === 'smg'
        ? 0.08
        : 0.12;

    const noise = this.createNoiseSource(dur + 0.02);
    if (noise) {
      const filter = this.ctx.createBiquadFilter();
      filter.type =
        type === 'sniper'
          ? 'highpass'
          : type === 'shotgun' || type === 'silenced'
          ? 'lowpass'
          : 'bandpass';
      const freq =
        type === 'shotgun'
          ? 850
          : type === 'silenced'
          ? 650
          : type === 'smg'
          ? 1850
          : type === 'rifle'
          ? 1350
          : 1500;
      filter.frequency.setValueAtTime(freq * jitter, t);

      const gain = this.ctx.createGain();
      const vol =
        type === 'shotgun'
          ? 0.58
          : type === 'silenced'
          ? 0.18
          : type === 'smg'
          ? 0.28
          : type === 'rifle'
          ? 0.42
          : 0.35;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.002, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + dur + 0.01);
    }

    // Golpe grave adicional para calibres pesados (magnum, sniper, rifle, shotgun)
    if (type === 'magnum' || type === 'sniper' || type === 'rifle' || type === 'shotgun') {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.frequency.setValueAtTime((type === 'sniper' ? 220 : 175) * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.15);
      oscGain.gain.setValueAtTime(type === 'rifle' ? 0.25 : 0.42, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  public playDryFire() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.05);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playDryfire() {
    this.playDryFire();
  }

  public playExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(80, t + 0.45);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.46);
  }

  public playRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.2);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.setValueAtTime(520, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playRoundGong(victory: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(victory ? 440 : 220, t);
    osc.frequency.exponentialRampToValueAtTime(victory ? 880 : 110, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  public playWeaponSound(soundType?: string, comboStep: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    switch (soundType) {
      case undefined:
      case 'punch':
      case 'fist':
        this.playMeleeSwing(comboStep);
        break;
      case 'knife':
        this.playKnifeSlash();
        break;
      case 'blade_heavy':
        this.playSwordComboSlash(comboStep);
        break;
      case 'blunt_wood':
      case 'blunt_metal':
        this.playBluntSwing();
        break;
      case 'shock':
        this.playShockHit();
        break;
      case 'chainsaw':
        this.playChainsawAttack();
        break;
      case 'glass':
        this.playKnifeSlash();
        break;
      case 'whip':
        this.playWhipCrack();
        break;
      case 'flare':
        this.playFlareLaunch();
        break;
      case 'explosion':
        this.playExplosion();
        break;
      case 'throwable':
        this.playThrow();
        break;
      default:
        this.playGunshot(soundType);
        break;
    }
  }

  public playGrenadeBounce() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // World mechanics SFX
  public playCrateBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Wood snap (filtered noise + low pop)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playMedkit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.08);
    osc.frequency.setValueAtTime(880, t + 0.16);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  public playHydraulicSlam() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.25);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // World ambient loops
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;

  public startWorldAmbient(type: 'warehouse' | 'desert' | 'industrial' = 'warehouse') {
    if (this.isMuted) return;
    this.stopWorldAmbient();
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.03, t);

      this.ambientOsc = this.ctx.createOscillator();
      if (type === 'desert') {
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(95, t); // Howling desert wind drone
      } else if (type === 'industrial') {
        this.ambientOsc.type = 'triangle';
        this.ambientOsc.frequency.setValueAtTime(55, t); // Industrial machine hum
      } else {
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(70, t); // Warehouse atmospheric hum
      }

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.ambientOsc.start(t);
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  public stopWorldAmbient() {
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundEngine();
