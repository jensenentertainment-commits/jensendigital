// app/phasefield/audio/engine.ts
console.log(
  "[PhaseAudioEngine] ENGINE = WARM-FIELD v6 (DARK/WARM, CONTINUOUS, NO PLUCKS)"
);

export type PhaseAudioState = {
  energy: number; // 0..1
  density: number; // 0..1
  turbulence: number; // 0..1
  hue01: number; // 0..1
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (cur: number, tgt: number, rate: number, dt: number) => {
  const t = 1 - Math.exp(-rate * dt);
  return lerp(cur, tgt, t);
};

function makeNoiseBuffer(ctx: AudioContext, seconds = 2) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);

  // Much lower amplitude: let gain stages do the work (reduces hiss harshness)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.12;

  return b;
}

function softCurve(amount = 0.18, n = 1024) {
  const k = 4 + amount * 28;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

type Formant = { bp: BiquadFilterNode; g: GainNode };

export class PhaseAudioEngine {
  private ctx: AudioContext | null = null;
  private running = false;
  private lastT = 0;

  private noiseBuf!: AudioBuffer;

  // master chain
  private master!: GainNode;
  private shaper!: WaveShaperNode;
  private comp!: DynamicsCompressorNode;

  // wet bus
  private wet!: GainNode;

  // space (dual delays)
  private d1!: DelayNode;
  private d1Fb!: GainNode;
  private d1LP!: BiquadFilterNode;

  private d2!: DelayNode;
  private d2Fb!: GainNode;
  private d2LP!: BiquadFilterNode;

  // colored noise bus (dark/warm)
  private noiseBus!: GainNode;
  private noiseHP!: BiquadFilterNode;
  private noiseLP!: BiquadFilterNode;

  // bed (air) — noise loop, but dark
  private bedSrc!: AudioBufferSourceNode;
  private bedHP!: BiquadFilterNode;
  private bedLP!: BiquadFilterNode;
  private bedGain!: GainNode;

  // routing refs
  private bedDry!: GainNode;
  private bedToChoir!: GainNode;
  private bedToWet!: GainNode;

  // choir
  private choirIn!: GainNode;
  private choir: Formant[] = [];

  // choir exciter (body, continuous)
  private choirExciteSrc!: AudioBufferSourceNode;
  private choirExciteHP!: BiquadFilterNode;
  private choirExciteLP!: BiquadFilterNode;
  private choirExciteGain!: GainNode;

  // shimmer (particle dust, continuous)
  private shimmerSrc!: AudioBufferSourceNode;
  private shimmerBP!: BiquadFilterNode;
  private shimmerLP!: BiquadFilterNode;
  private shimmerGain!: GainNode;
  private shimmerBase!: ConstantSourceNode;
  private shimmerLFO!: OscillatorNode;
  private shimmerLFOGain!: GainNode;

  // warm hum bed (tonal body, not "music")
  private humOsc!: OscillatorNode;
  private humLP!: BiquadFilterNode;
  private humGain!: GainNode;
  private humBase!: ConstantSourceNode;
  private humLFO!: OscillatorNode;
  private humLFOGain!: GainNode;

  // time
  private drift = 0;
  private flutter = 0;
  private swell = 0;

  private cur = {
    bed: 0.0,
    choir: 0.0,
    center: 900,
    bright: 0.5,
    fqMul: 1.0,
    q: 14,

    shimmer: 0.0,
    wet: 0.18,
    d1: 0.28,
    d1Fb: 0.33,
    d2: 0.47,
    d2Fb: 0.26,
  };

  createContext() {
    if (this.ctx) return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as any;
    this.ctx = new Ctx();

    document.addEventListener("visibilitychange", () => {
  if (!this.ctx) return;

  if (document.visibilityState === "visible") {
    // best effort resume
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    // viktig: hindre dt-hopp første frame etter tilbakekomst
    this.lastT = this.ctx.currentTime;
  }
});
  }

  async start() {
    if (!this.ctx || this.running) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();

    const ctx = this.ctx;
    this.noiseBuf = makeNoiseBuffer(ctx, 2);

    // MASTER chain
    this.master = ctx.createGain();
    this.master.gain.value = 0.0;

    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = softCurve(0.16);
    this.shaper.oversample = "2x";

    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -28;
    this.comp.knee.value = 24;
    this.comp.ratio.value = 3.0;
    this.comp.attack.value = 0.01;
    this.comp.release.value = 0.22;

    this.master.connect(this.shaper);
    this.shaper.connect(this.comp);
    this.comp.connect(ctx.destination);

    // WET bus
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.0;
    this.wet.connect(this.master);

    // delays (reverb-ish)
    this.d1 = ctx.createDelay(1.0);
    this.d1Fb = ctx.createGain();
    this.d1LP = ctx.createBiquadFilter();
    this.d1LP.type = "lowpass";
    this.d1LP.frequency.value = 1800;

    this.d2 = ctx.createDelay(1.0);
    this.d2Fb = ctx.createGain();
    this.d2LP = ctx.createBiquadFilter();
    this.d2LP.type = "lowpass";
    this.d2LP.frequency.value = 1400;

    this.d1.delayTime.value = this.cur.d1;
    this.d1Fb.gain.value = this.cur.d1Fb;

    this.d2.delayTime.value = this.cur.d2;
    this.d2Fb.gain.value = this.cur.d2Fb;

    // feedback loops
    this.d1.connect(this.d1LP);
    this.d1LP.connect(this.d1Fb);
    this.d1Fb.connect(this.d1);

    this.d2.connect(this.d2LP);
    this.d2LP.connect(this.d2Fb);
    this.d2Fb.connect(this.d2);

    // cross feed (kept subtle)
    const x12 = ctx.createGain();
    x12.gain.value = 0.18;
    const x21 = ctx.createGain();
    x21.gain.value = 0.16;
    this.d1LP.connect(x12);
    x12.connect(this.d2);
    this.d2LP.connect(x21);
    x21.connect(this.d1);

    // wet outs
    this.d1LP.connect(this.wet);
    this.d2LP.connect(this.wet);

    // COLORED NOISE BUS (dark/warm)
    this.noiseBus = ctx.createGain();
    this.noiseBus.gain.value = 1.0;

    this.noiseHP = ctx.createBiquadFilter();
    this.noiseHP.type = "highpass";
    this.noiseHP.frequency.value = 70;

    this.noiseLP = ctx.createBiquadFilter();
    this.noiseLP.type = "lowpass";
    this.noiseLP.frequency.value = 2400;

    this.noiseBus.connect(this.noiseHP);
    this.noiseHP.connect(this.noiseLP);

    // CHOIR input
    this.choirIn = ctx.createGain();
    this.choirIn.gain.value = 0.0;

    // --- BED AIR (noise loop; dark) ---
    this.bedSrc = ctx.createBufferSource();
    this.bedSrc.buffer = this.noiseBuf;
    this.bedSrc.loop = true;

    this.bedHP = ctx.createBiquadFilter();
    this.bedHP.type = "highpass";
    this.bedHP.frequency.value = 220;

    this.bedLP = ctx.createBiquadFilter();
    this.bedLP.type = "lowpass";
    this.bedLP.frequency.value = 2400;

    this.bedGain = ctx.createGain();
    this.bedGain.gain.value = 0;

    // route via colored noise
    this.bedSrc.connect(this.noiseBus);
    this.noiseLP.connect(this.bedHP);

    this.bedHP.connect(this.bedLP);
    this.bedLP.connect(this.bedGain);

    // routing controls
    this.bedDry = ctx.createGain();
    this.bedDry.gain.value = 0.0;
    this.bedGain.connect(this.bedDry);
    this.bedDry.connect(this.master);

    this.bedToChoir = ctx.createGain();
    this.bedToChoir.gain.value = 0.0;
    this.bedGain.connect(this.bedToChoir);
    this.bedToChoir.connect(this.choirIn);

    this.bedToWet = ctx.createGain();
    this.bedToWet.gain.value = 0.0;
    this.bedGain.connect(this.bedToWet);
    this.bedToWet.connect(this.d1);
    this.bedToWet.connect(this.d2);

    this.bedSrc.start();

    // --- WARM HUM BED (body; not "music") ---
    this.humOsc = ctx.createOscillator();
    this.humOsc.type = "triangle";
    this.humOsc.frequency.value = 46;

    this.humLP = ctx.createBiquadFilter();
    this.humLP.type = "lowpass";
    this.humLP.frequency.value = 240;

    this.humGain = ctx.createGain();
    this.humGain.gain.value = 0.0;

    this.humBase = ctx.createConstantSource();
    this.humBase.offset.value = 0.0;

    this.humLFO = ctx.createOscillator();
    this.humLFO.type = "sine";
    this.humLFO.frequency.value = 0.018; // ~55s cycle

    this.humLFOGain = ctx.createGain();
    this.humLFOGain.gain.value = 0.0;

    this.humOsc.connect(this.humLP);
    this.humLP.connect(this.humGain);

    // Mostly wet + a touch dry
    const humWet = ctx.createGain();
    humWet.gain.value = 0.86;
    const humDry = ctx.createGain();
    humDry.gain.value = 0.14;

    this.humGain.connect(humWet);
    humWet.connect(this.d1);
    humWet.connect(this.d2);

    this.humGain.connect(humDry);
    humDry.connect(this.master);

    // gain = base + LFO (both continuous)
    this.humBase.connect(this.humGain.gain);
    this.humLFO.connect(this.humLFOGain);
    this.humLFOGain.connect(this.humGain.gain);

    this.humBase.start();
    this.humLFO.start();
    this.humOsc.start();

    // --- CONTINUOUS CHOIR EXCITER (body, not plucks) ---
    this.choirExciteSrc = ctx.createBufferSource();
    this.choirExciteSrc.buffer = this.noiseBuf;
    this.choirExciteSrc.loop = true;

    this.choirExciteHP = ctx.createBiquadFilter();
    this.choirExciteHP.type = "highpass";
    this.choirExciteHP.frequency.value = 120;

    this.choirExciteLP = ctx.createBiquadFilter();
    this.choirExciteLP.type = "lowpass";
    this.choirExciteLP.frequency.value = 1500;

    this.choirExciteGain = ctx.createGain();
    this.choirExciteGain.gain.value = 0.0;

    // route via colored noise
    this.choirExciteSrc.connect(this.noiseBus);
    this.noiseLP.connect(this.choirExciteHP);

    this.choirExciteHP.connect(this.choirExciteLP);
    this.choirExciteLP.connect(this.choirExciteGain);

    // into choir + a little space
    this.choirExciteGain.connect(this.choirIn);

    const exciteSend = ctx.createGain();
    exciteSend.gain.value = 0.14;
    this.choirExciteGain.connect(exciteSend);
    exciteSend.connect(this.d1);
    exciteSend.connect(this.d2);

    this.choirExciteSrc.start();

    // --- CONTINUOUS SHIMMER (particle dust; dark) ---
    this.shimmerSrc = ctx.createBufferSource();
    this.shimmerSrc.buffer = this.noiseBuf;
    this.shimmerSrc.loop = true;

    this.shimmerBP = ctx.createBiquadFilter();
    this.shimmerBP.type = "bandpass";
    this.shimmerBP.frequency.value = 1100;
    this.shimmerBP.Q.value = 1.15;

    this.shimmerLP = ctx.createBiquadFilter();
    this.shimmerLP.type = "lowpass";
    this.shimmerLP.frequency.value = 3200;

    this.shimmerGain = ctx.createGain();
    this.shimmerGain.gain.value = 0.0;

    // route via colored noise
    this.shimmerSrc.connect(this.noiseBus);
    this.noiseLP.connect(this.shimmerBP);

    this.shimmerBP.connect(this.shimmerLP);
    this.shimmerLP.connect(this.shimmerGain);

    // amplitude: base + slow LFO (no clicks)
    this.shimmerBase = ctx.createConstantSource();
    this.shimmerBase.offset.value = 0.0;

    this.shimmerLFO = ctx.createOscillator();
    this.shimmerLFO.type = "sine";
    this.shimmerLFO.frequency.value = 0.035;

    this.shimmerLFOGain = ctx.createGain();
    this.shimmerLFOGain.gain.value = 0.0;

    this.shimmerLFO.connect(this.shimmerLFOGain);
    this.shimmerBase.connect(this.shimmerGain.gain);
    this.shimmerLFOGain.connect(this.shimmerGain.gain);

    // route shimmer: mostly wet + a touch into choir + tiny dry
    const shWet = ctx.createGain();
    shWet.gain.value = 0.78;
    const shChoir = ctx.createGain();
    shChoir.gain.value = 0.22;
    const shDry = ctx.createGain();
    shDry.gain.value = 0.12;

    this.shimmerGain.connect(shWet);
    shWet.connect(this.d1);
    shWet.connect(this.d2);

    this.shimmerGain.connect(shChoir);
    shChoir.connect(this.choirIn);

    this.shimmerGain.connect(shDry);
    shDry.connect(this.master);

    this.shimmerBase.start();
    this.shimmerLFO.start();
    this.shimmerSrc.start();

    // formant bank (choir)
    const baseFormants = [520, 820, 1180, 1750, 2550];
    this.choir = [];

    for (let i = 0; i < baseFormants.length; i++) {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = baseFormants[i];
      bp.Q.value = 14;

      const g = ctx.createGain();
      g.gain.value = 0.0;

      this.choirIn.connect(bp);
      bp.connect(g);
      g.connect(this.master);

      const send = ctx.createGain();
      send.gain.value = 0.20;
      g.connect(send);
      send.connect(this.d1);
      send.connect(this.d2);

      this.choir.push({ bp, g });
    }

    // fade in
    this.master.gain.setTargetAtTime(0.085, ctx.currentTime, 0.30);

    this.lastT = ctx.currentTime;
    this.running = true;
  }

  update(s: PhaseAudioState) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;

    const now = ctx.currentTime;
    let dt = Math.max(0.001, now - this.lastT);
dt = Math.min(dt, 0.05); // <= viktig: hindrer store hopp ved tab-switch
if (document.visibilityState === "visible" && this.ctx.state === "suspended") {
  this.ctx.resume().catch(() => {});
}
    this.lastT = now;

    const energy = clamp01(s.energy);
    const density = clamp01(s.density);
    const turb = clamp01(s.turbulence);
    const hue = clamp01(s.hue01);

    // timebases (very slow, never "eventy")
    this.drift += dt * (0.014 + 0.022 * (1 - density));
    this.flutter += dt * (0.55 + 1.7 * turb + 0.8 * energy);
    this.swell += dt * (0.024 + 0.05 * (0.3 + 0.7 * density));

    const driftSin = 0.5 + 0.5 * Math.sin(this.drift * Math.PI * 2);
    const swellSin = 0.5 + 0.5 * Math.sin(this.swell * Math.PI * 2);

    // spectral targets (warm)
    const targetCenter =
      520 + 2400 * (0.52 * hue + 0.30 * (1 - density) + 0.18 * driftSin);
    const targetBright = clamp01(0.18 + 0.42 * energy + 0.28 * (1 - density));

    // levels (continuous)
    const targetBed = 0.00018 + 0.0026 * (0.70 * density + 0.30 * turb);
    const targetChoir =
  0.012 +
  0.14 * (0.65 * density + 0.20 * energy + 0.15 * driftSin) *
  (0.45 + 0.55 * swellSin);

    const targetShimmer =
  0.0015 +
  0.016 * (0.45 * turb + 0.35 * energy + 0.20 * (1 - density)) *
  (0.55 + 0.45 * swellSin);

    const targetFqMul =
      0.92 +
      0.20 *
        (0.6 * driftSin +
          0.4 * (0.5 + 0.5 * Math.sin(this.flutter * 0.32)));

    const targetQ = 10 + 24 * (0.60 * (1 - density) + 0.40 * turb);

    // smooth params
    this.cur.center = smooth(this.cur.center, targetCenter, 1.0, dt);
    this.cur.bright = smooth(this.cur.bright, targetBright, 1.2, dt);

    this.cur.bed = smooth(this.cur.bed, targetBed, 1.8, dt);
    this.cur.choir = smooth(this.cur.choir, targetChoir, 1.5, dt);
    this.cur.shimmer = smooth(this.cur.shimmer, targetShimmer, 1.3, dt);

    this.cur.fqMul = smooth(this.cur.fqMul, targetFqMul, 0.9, dt);
    this.cur.q = smooth(this.cur.q, targetQ, 1.1, dt);

    // space (dark/warm)
    const targetWet =
      0.10 +
      0.40 * (0.50 * density + 0.35 * turb + 0.15 * (1 - density));
    const targetD1 = 0.22 + 0.26 * (0.55 * driftSin + 0.45 * turb);
    const targetD2 = 0.36 + 0.40 * (0.55 * density + 0.45 * driftSin);
    const targetD1Fb = 0.20 + 0.52 * (0.55 * density + 0.45 * turb);
    const targetD2Fb = 0.16 + 0.46 * (0.55 * density + 0.45 * turb);

    this.cur.wet = smooth(this.cur.wet, targetWet, 1.1, dt);
    this.cur.d1 = smooth(this.cur.d1, targetD1, 1.0, dt);
    this.cur.d2 = smooth(this.cur.d2, targetD2, 1.0, dt);
    this.cur.d1Fb = smooth(this.cur.d1Fb, targetD1Fb, 1.1, dt);
    this.cur.d2Fb = smooth(this.cur.d2Fb, targetD2Fb, 1.1, dt);

    this.wet.gain.setTargetAtTime(this.cur.wet, now, 0.30);
    this.d1.delayTime.setTargetAtTime(this.cur.d1, now, 0.30);
    this.d2.delayTime.setTargetAtTime(this.cur.d2, now, 0.30);
    this.d1Fb.gain.setTargetAtTime(this.cur.d1Fb, now, 0.30);
    this.d2Fb.gain.setTargetAtTime(this.cur.d2Fb, now, 0.30);

    this.d1LP.frequency.setTargetAtTime(750 + 2300 * this.cur.bright, now, 0.45);
    this.d2LP.frequency.setTargetAtTime(560 + 2000 * this.cur.bright, now, 0.45);

    // bed EQ + level (dark)
    this.bedHP.frequency.setTargetAtTime(180 + 320 * (1 - density), now, 0.35);
    this.bedLP.frequency.setTargetAtTime(1800 + 2800 * this.cur.bright, now, 0.45);
    this.bedGain.gain.setTargetAtTime(this.cur.bed, now, 0.25);

    // almost no raw hiss
    this.bedDry.gain.setTargetAtTime(this.cur.bed * 0.035, now, 0.35);
    this.bedToChoir.gain.setTargetAtTime(this.cur.bed * 2.4, now, 0.35);
    this.bedToWet.gain.setTargetAtTime(this.cur.bed * 1.0, now, 0.35);

    // choir exciter control (continuous)
    const exciteTarget =
      0.0035 + 0.018 * (0.62 * density + 0.22 * energy + 0.16 * turb);
    this.choirExciteGain.gain.setTargetAtTime(exciteTarget, now, 0.55);
    this.choirExciteLP.frequency.setTargetAtTime(800 + 1600 * this.cur.bright, now, 0.75);
    this.choirExciteHP.frequency.setTargetAtTime(110 + 220 * (1 - density), now, 0.75);

    // shimmer behavior (dust, not sizzle)
    this.shimmerBase.offset.setTargetAtTime(this.cur.shimmer, now, 0.70);

    const lfoDepth = 0.50 * this.cur.shimmer * (0.30 + 0.70 * turb);
    this.shimmerLFOGain.gain.setTargetAtTime(lfoDepth, now, 0.70);

    const lfoHz = 0.015 + 0.075 * (0.35 * turb + 0.65 * energy);
    this.shimmerLFO.frequency.setTargetAtTime(lfoHz, now, 1.0);

    const shF = 520 + 3400 * (0.40 * hue + 0.35 * this.cur.bright + 0.25 * driftSin);
    this.shimmerBP.frequency.setTargetAtTime(shF, now, 0.75);
    this.shimmerBP.Q.setTargetAtTime(0.85 + 2.0 * (0.45 * turb + 0.55 * (1 - density)), now, 1.0);
    this.shimmerLP.frequency.setTargetAtTime(2200 + 3200 * this.cur.bright, now, 1.0);

    // HUM: body follows density (more body) and energy (slight lift)
    const humLevel =
  0.0012 +
  0.010 * (0.72 * density + 0.28 * energy) * (0.55 + 0.45 * swellSin);
    this.humBase.offset.setTargetAtTime(humLevel, now, 1.0);

    const humLfoDepth = humLevel * (0.18 + 0.48 * turb);
    this.humLFOGain.gain.setTargetAtTime(humLfoDepth, now, 1.1);

    const humHz = 36 + 26 * (0.55 * hue + 0.45 * driftSin);
    this.humOsc.frequency.setTargetAtTime(humHz, now, 1.3);
    this.humLP.frequency.setTargetAtTime(160 + 260 * this.cur.bright, now, 1.1);

    // choir
    this.choirIn.gain.setTargetAtTime(0.80, now, 0.85);

    const base = this.cur.center;
    const mul = this.cur.fqMul;

    const formantHz = [
      base * 0.55,
      base * 0.82,
      base * 1.05,
      base * 1.42,
      base * 1.95,
    ].map((v) => v * mul);

    for (let i = 0; i < this.choir.length; i++) {
      const f = this.choir[i];
      const hz = Math.min(4800, Math.max(180, formantHz[i] ?? base));
      f.bp.frequency.setTargetAtTime(hz, now, 0.55);
      f.bp.Q.setTargetAtTime(this.cur.q, now, 0.65);

      const k = [0.95, 1.05, 0.98, 0.78, 0.62][i] ?? 1.0;
      f.g.gain.setTargetAtTime(this.cur.choir * k, now, 0.45);
    }
  }

  triggerFlare(strength01 = 1) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const s = clamp01(strength01);
    const now = ctx.currentTime;

    // flare = more space + a touch more shimmer + slight choir lift (still continuous)
    this.wet.gain.cancelScheduledValues(now);
    this.wet.gain.setValueAtTime(this.wet.gain.value, now);
    this.wet.gain.linearRampToValueAtTime(
      Math.min(0.62, this.cur.wet + 0.16 + 0.12 * s),
      now + 0.07
    );
    this.wet.gain.exponentialRampToValueAtTime(Math.max(0.10, this.cur.wet), now + 1.35);

    this.shimmerBase.offset.cancelScheduledValues(now);
    this.shimmerBase.offset.setValueAtTime(this.shimmerBase.offset.value, now);
    this.shimmerBase.offset.linearRampToValueAtTime(
      this.cur.shimmer * (1.30 + 0.60 * s),
      now + 0.12
    );
    this.shimmerBase.offset.exponentialRampToValueAtTime(Math.max(0.0005, this.cur.shimmer), now + 1.25);

    for (const f of this.choir) {
      f.g.gain.cancelScheduledValues(now);
      f.g.gain.setValueAtTime(f.g.gain.value, now);
      f.g.gain.linearRampToValueAtTime(f.g.gain.value * (1.12 + 0.50 * s), now + 0.10);
      f.g.gain.exponentialRampToValueAtTime(Math.max(0.0002, f.g.gain.value * 0.88), now + 1.15);
    }
  }

  async stop() {
    if (!this.ctx || !this.running) return;

    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0.0, now, 0.25);

    setTimeout(async () => {
      try { this.bedSrc?.stop(); } catch {}
      try { this.choirExciteSrc?.stop(); } catch {}
      try { this.shimmerSrc?.stop(); } catch {}
      try { this.shimmerLFO?.stop(); } catch {}
      try { this.shimmerBase?.stop(); } catch {}
      try { this.humOsc?.stop(); } catch {}
      try { this.humLFO?.stop(); } catch {}
      try { this.humBase?.stop(); } catch {}
      try { await this.ctx?.close(); } catch {}

      this.ctx = null;
      this.running = false;
    }, 700);
  }

  isRunning() {
    return this.running;
  }
}