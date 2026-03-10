"use client";

/**
 * app/lumeris/Lumeris.tsx
 * Lumeris — Digital Ambience (persistent field + self-generated warm audio)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { PhaseAudioEngine } from "./audio/engine";
import { buildColorState, buildFlareState, dayProgressUTC, hash01 } from "./audio/model";

// --- stable epoch across Fast Refresh (per tab) ---
const G = globalThis as any;
if (!G.__LUMERIS_EPOCH_MS) {
  G.__LUMERIS_EPOCH_MS = Date.now();
  G.__LUMERIS_EPOCH_PERF = performance.now();
}
function stableNowMs() {
  const baseEpoch = (globalThis as any).__LUMERIS_EPOCH_MS as number;
  const basePerf = (globalThis as any).__LUMERIS_EPOCH_PERF as number;
  return baseEpoch + (performance.now() - basePerf);
}

// utils
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const fract = (x: number) => x - Math.floor(x);
const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;
const hsla = (h: number, s: number, l: number, a: number) =>
  `hsla(${h} ${s}% ${l}% / ${a})`;

function dayKeyNumberUTC(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return y * 10_000 + m * 100 + day;
}

type Bands = { bass: number; mid: number; high: number };

function smoothBands(cur: Bands, tgt: Bands, dt: number) {
  const kAttack = 6.0;
  const kRelease = 2.0;
  const s = (c: number, t: number) => {
    const rate = t > c ? kAttack : kRelease;
    const a = 1 - Math.exp(-rate * dt);
    return c + (t - c) * a;
  };
  return {
    bass: s(cur.bass, tgt.bass),
    mid: s(cur.mid, tgt.mid),
    high: s(cur.high, tgt.high),
  };
}

export default function Lumeris() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateARef = useRef<HTMLCanvasElement | null>(null);
  const stateBRef = useRef<HTMLCanvasElement | null>(null);
  const noiseRef = useRef<HTMLCanvasElement | null>(null);

  const audioRef = useRef<PhaseAudioEngine | null>(null);
  const audioEnabledRef = useRef(false);

  const audioFreezeRef = useRef(false);
  const audioResumeAtMsRef = useRef<number | null>(null);
  const lastAudioStateRef = useRef({
    energy: 0.2,
    density: 0.5,
    turbulence: 0.2,
    hue01: 0.5,
  });

  const bandsCurRef = useRef<Bands>({ bass: 0, mid: 0, high: 0 });

  const storageKey = useMemo(() => "lumeris|state|v1-warmfield", []);

  const [canStartAudio, setCanStartAudio] = useState(true);
  const [audioOnUI, setAudioOnUI] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (!audioRef.current) audioRef.current = new PhaseAudioEngine();

    const stateA =
  stateARef.current || (stateARef.current = document.createElement("canvas"));
const stateB =
  stateBRef.current || (stateBRef.current = document.createElement("canvas"));

const a = stateA.getContext("2d")!;
const b = stateB.getContext("2d")!;

const noise =
  noiseRef.current || (noiseRef.current = document.createElement("canvas"));
const nctx = noise.getContext("2d")!;

const aCtx = a;
const bCtx = b;
const noiseCtx = nctx;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    let iw = 600;
    let ih = 380;

    let lastSnapMs = 0;
    const SNAP_EVERY_MS = 20_000;

    let lastFrameMs = stableNowMs();

    function seedNoiseTile(dayKey: number) {
      noise.width = 160;
      noise.height = 160;
      const w = noise.width;
      const h = noise.height;

      const img = noiseCtx.createImageData(w, h);
      const d = img.data;

      const s = dayKey * 0.001 + hash01(dayKey + 7, 11.7) * 100;
      for (let i = 0; i < w * h; i++) {
        const r = (hash01(i * 1.13 + s, i * 0.77 + s * 2.1) * 2 - 1) * 0.85;
        const g = Math.floor(128 + r * 36);
        d[i * 4 + 0] = g;
        d[i * 4 + 1] = g;
        d[i * 4 + 2] = g;
        d[i * 4 + 3] = 255;
      }
      noiseCtx.putImageData(img, 0, 0);

noiseCtx.save();
noiseCtx.globalAlpha = 0.35;
noiseCtx.filter = "blur(0.9px)";
noiseCtx.drawImage(noise, 0, 0);
noiseCtx.filter = "none";
noiseCtx.globalAlpha = 1;
noiseCtx.restore();
    }

    function seedStateFromSnapshotOrFog(dayKey: number) {
      aCtx.save();
aCtx.globalCompositeOperation = "source-over";
aCtx.fillStyle = "black";
aCtx.fillRect(0, 0, iw, ih);
aCtx.restore();

      const snap = localStorage.getItem(storageKey);
      if (snap) {
        const img = new Image();
        img.onload = () => {
          aCtx.save();
aCtx.globalAlpha = 0.95;
aCtx.filter = "blur(1.2px)";
aCtx.drawImage(img, 0, 0, iw, ih);
aCtx.filter = "none";

aCtx.globalAlpha = 0.22;
aCtx.filter = "blur(1.8px)";
aCtx.drawImage(stateA, 0, 0);
aCtx.restore();
        };
        img.src = snap;
        return;
      }

      seedNoiseTile(dayKey);

      bCtx.save();
      bCtx.globalCompositeOperation = "screen";
      bCtx.globalAlpha = 0.09;
      bCtx.drawImage(noise, -30, -20, iw + 60, ih + 40);
      bCtx.globalAlpha = 0.06;
      bCtx.drawImage(noise, 20, 10, iw, ih);
      bCtx.globalAlpha = 0.28;
      bCtx.filter = "blur(10px)";
      bCtx.drawImage(stateA, 0, 0);
      bCtx.filter = "none";
      bCtx.restore();
    }

    function maybeSnapshot(nowMs: number) {
      if (nowMs - lastSnapMs < SNAP_EVERY_MS) return;
      lastSnapMs = nowMs;

      const sw = 260;
      const sh = 166;
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = sw;
      snapCanvas.height = sh;
      const sctx = snapCanvas.getContext("2d");
      if (!sctx) return;

      sctx.fillStyle = "black";
      sctx.fillRect(0, 0, sw, sh);
      sctx.globalAlpha = 1;
      sctx.filter = "blur(0.7px)";
      sctx.drawImage(stateA, 0, 0, sw, sh);
      sctx.filter = "none";

      try {
        localStorage.setItem(storageKey, snapCanvas.toDataURL("image/png", 0.85));
      } catch {
        // ignore quota
      }
    }

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      W = window.innerWidth;
      H = window.innerHeight;

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.max(
        0.95,
        Math.min(1.5, Math.sqrt((W * H) / (1400 * 900)))
      );
      iw = Math.floor(600 * scale);
      ih = Math.floor(380 * scale);

      stateA.width = iw;
      stateA.height = ih;
      stateB.width = iw;
      stateB.height = ih;

      const dayKey = dayKeyNumberUTC(new Date(stableNowMs()));
      seedStateFromSnapshotOrFog(dayKey);
    };

    resize();
    window.addEventListener("resize", resize);

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        audioFreezeRef.current = true;
        audioResumeAtMsRef.current = null;
      } else {
        audioFreezeRef.current = false;
        audioResumeAtMsRef.current = stableNowMs();
        lastFrameMs = stableNowMs();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      const nowMs = stableNowMs();
      const t = nowMs / 1000;

      const dt = Math.max(0.001, Math.min(0.05, (nowMs - lastFrameMs) / 1000));
      lastFrameMs = nowMs;

      const d = new Date(nowMs);
      const dayKey = dayKeyNumberUTC(d);

      const color = buildColorState(dayKey, nowMs);
      const flare = buildFlareState(dayKey, nowMs);

      if ((draw as any).__dayKey !== dayKey) {
        (draw as any).__dayKey = dayKey;
        seedNoiseTile(dayKey);
      }

      {
        const topHue = (color.hueBase + 8) % 360;
        const botHue = (color.hueBase - 10 + color.climateHue * 0.18 + 360) % 360;

        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, hsl(topHue, Math.max(16, color.sat * 0.34), color.lumTop));
        bg.addColorStop(1, hsl(botHue, Math.max(14, color.sat * 0.30), color.lumBot));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      const night = clamp01(color.night);
      const day = 1 - night;

      const humidity = 0.5 + 0.5 * color.climate;
      const inertia = (0.986 - 0.004 * night) - 0.002 * humidity;
      const blurPx = (1.15 + 0.55 * day) + 0.35 * humidity;
      const diffuseMix = 0.28 + 0.11 * day + 0.05 * humidity;

      const decayMul = Math.floor(253 - 2.3 * night);

      const tDay = dayProgressUTC(new Date(nowMs));
      const driftAng =
        tDay * Math.PI * 2 +
        0.32 * Math.sin(t * 0.017) +
        0.21 * Math.sin((color.micro + 0.13) * Math.PI * 2) +
        0.14 * Math.sin(t * 0.009 + dayKey * 0.0007);
      const drift = { x: Math.cos(driftAng), y: Math.sin(driftAng) };

      const adv = 0.42 + 0.70 * day;
      const dx = drift.x * adv;
      const dy = drift.y * adv;

      const life = 0.010 + 0.010 * day;
      const ox = (fract(t * 0.008 + dayKey * 0.00013) - 0.5) * 90;
      const oy = (fract(t * 0.006 + dayKey * 0.00017) - 0.5) * 90;

      const flareK = flare.active ? flare.k : 0;
      const tgtBands: Bands = {
        bass: clamp01(0.05 + 0.25 * (0.7 * night + 0.3 * flareK)),
        mid: clamp01(
          0.04 +
            0.20 *
              (0.65 * day + (0.35 * Math.sin(t * 0.03 + 1.1) * 0.5 + 0.5))
        ),
        high: clamp01(0.02 + 0.18 * (0.6 * color.event + 0.4 * flareK)),
      };
      bandsCurRef.current = smoothBands(bandsCurRef.current, tgtBands, dt);
      const bands = bandsCurRef.current;

      b.save();
      b.globalCompositeOperation = "source-over";
      b.globalAlpha = 1;
      b.filter = "none";
      b.clearRect(0, 0, iw, ih);

      b.globalAlpha = inertia;
      b.drawImage(stateA, dx, dy);

      b.globalAlpha = diffuseMix;
      b.filter = `blur(${blurPx}px)`;
      b.drawImage(stateB, 0, 0);
      b.filter = "none";

      b.globalCompositeOperation = "multiply";
      b.globalAlpha = 1;
      b.fillStyle = `rgb(${decayMul},${decayMul},${decayMul})`;
      b.fillRect(0, 0, iw, ih);

      b.globalCompositeOperation = "screen";
      b.globalAlpha = life;
      b.drawImage(noise, ox, oy, iw * 1.1, ih * 1.1);

      if (bands.bass > 0.001) {
        const p = bands.bass;
        const cx = (0.5 + 0.28 * Math.sin(t * 0.23 + dayKey * 0.01)) * iw;
        const cy = (0.5 + 0.28 * Math.cos(t * 0.19 + dayKey * 0.013)) * ih;
        const rr = Math.min(iw, ih) * (0.22 + 0.20 * p);

        const g = b.createRadialGradient(cx, cy, 0, cx, cy, rr);
        const hue = (color.hueBase + 12) % 360;
        g.addColorStop(
          0,
          `hsla(${hue} ${Math.max(18, color.sat * 0.35)}% 62% / ${0.10 * p})`
        );
        g.addColorStop(1, `hsla(${hue} 10% 60% / 0)`);

        b.globalAlpha = 0.60;
        b.fillStyle = g;
        b.fillRect(0, 0, iw, ih);
      }

      if (bands.mid > 0.001) {
        const m = bands.mid;
        b.globalAlpha = 0.08 * m;
        b.drawImage(stateB, drift.x * (1.7 * m), drift.y * (1.7 * m));
      }

      if (bands.high > 0.001) {
        const h = bands.high;
        b.globalAlpha = 0.010 + 0.030 * h;
        b.drawImage(noise, -ox * 0.6, -oy * 0.6, iw * 1.1, ih * 1.1);
      }

      if (flare.active) {
        const sx =
          (hash01(dayKeyNumberUTC(d) + 1, flare.seed * 19.7) * 0.8 + 0.1) * iw;
        const sy =
          (hash01(dayKeyNumberUTC(d) + 2, flare.seed * 7.1) * 0.8 + 0.1) * ih;
        const rr = Math.min(iw, ih) * (0.20 + 0.18 * flare.seed);

        const g = b.createRadialGradient(sx, sy, 0, sx, sy, rr);
        const hue = (color.hueBase + 28 + 20 * color.event) % 360;
        g.addColorStop(
          0,
          `hsla(${hue} ${Math.max(18, color.sat * 0.38)}% 64% / ${
            0.14 * flare.k
          })`
        );
        g.addColorStop(1, `hsla(${hue} 10% 60% / 0)`);

        b.globalAlpha = 0.55;
        b.fillStyle = g;
        b.fillRect(0, 0, iw, ih);

        if (
          !audioFreezeRef.current &&
          audioEnabledRef.current &&
          audioRef.current?.isRunning()
        ) {
          audioRef.current.triggerFlare(0.55 + 0.45 * flare.k);
        }
      }

      b.restore();

      a.clearRect(0, 0, iw, ih);
      a.drawImage(stateB, 0, 0);

      const field = stateA;

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.62;
      ctx.filter = "blur(10px)";
      ctx.drawImage(field, 0, 0, W, H);
      ctx.filter = "none";
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.56;
      ctx.filter = "blur(14px)";
      ctx.drawImage(field, 0, 0, W, H);
      ctx.filter = "none";
      ctx.restore();

      {
        const hue = (color.hueBase + color.event * 22) % 360;
        const cool = (hue + 20) % 360;
        const warm = (hue - 20 + 360) % 360;

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        ctx.globalAlpha = 0.26;
        ctx.fillStyle = hsla(cool, Math.max(16, color.sat * 0.30), 64, 0.18);
        ctx.fillRect(0, 0, W, H);

        ctx.globalAlpha = 0.22;
        ctx.fillStyle = hsla(warm, Math.max(16, color.sat * 0.26), 60, 0.16);
        ctx.fillRect(0, 0, W, H);

        if (flare.active) {
          ctx.globalAlpha = 0.08 * flare.k;
          ctx.fillStyle = hsla((warm + 10) % 360, 14, 58, 0.18);
          ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();
      }

      {
        const gCount = 520;
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.028;
        for (let i = 0; i < gCount; i++) {
          const r1 = hash01((dayKey + i) * 0.13, Math.floor(t * 6) * 0.07);
          const r2 = hash01((dayKey + i) * 0.27, Math.floor(t * 6) * 0.11);
          const x = r1 * W;
          const y = r2 * H;
          ctx.fillStyle =
            r1 > 0.5 ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
          ctx.fillRect(x, y, 1, 1);
        }
        ctx.restore();
      }

      {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        const cx = W * (0.52 + 0.02 * Math.sin(t * 0.03));
        const cy = H * (0.50 + 0.02 * Math.cos(t * 0.03));
        const v = ctx.createRadialGradient(
          cx,
          cy,
          Math.min(W, H) * 0.28,
          W * 0.5,
          H * 0.5,
          Math.min(W, H) * 1.08
        );
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, "rgba(0,0,0,0.42)");
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      if (audioEnabledRef.current && audioRef.current?.isRunning()) {
        const target = {
          energy: clamp01(0.12 + 0.45 * day + 0.18 * color.event + 0.10 * bands.mid),
          density: clamp01(0.25 + 0.55 * night + 0.20 * bands.bass),
          turbulence: clamp01(0.12 + 0.55 * bands.high + 0.25 * flareK),
          hue01: ((color.hueBase % 360) + 360) / 360,
        };

        if (audioFreezeRef.current) {
          audioRef.current.update(lastAudioStateRef.current);
        } else {
          const resumeAt = audioResumeAtMsRef.current;
          let k = 1;

          if (resumeAt != null) {
            const elapsed = (stableNowMs() - resumeAt) / 1000;
            k = clamp01(elapsed / 1.8);
            if (k >= 1) audioResumeAtMsRef.current = null;
          }

          const prev = lastAudioStateRef.current;
          const blended = {
            energy: prev.energy + (target.energy - prev.energy) * k,
            density: prev.density + (target.density - prev.density) * k,
            turbulence: prev.turbulence + (target.turbulence - prev.turbulence) * k,
            hue01: prev.hue01 + (target.hue01 - prev.hue01) * k,
          };

          lastAudioStateRef.current = blended;
          audioRef.current.update(blended);
        }
      }

      maybeSnapshot(nowMs);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
    };
  }, [storageKey]);

  async function startAudio() {
    const engine = audioRef.current;
    if (!engine) return;

    try {
      engine.createContext();
      await engine.start();
      audioEnabledRef.current = true;
      setAudioOnUI(true);
      setCanStartAudio(false);

      audioFreezeRef.current = false;
      audioResumeAtMsRef.current = stableNowMs();
    } catch {
      audioEnabledRef.current = false;
      setAudioOnUI(false);
      setCanStartAudio(true);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "#000",
        }}
      />

      {canStartAudio && (
        <button
          onClick={startAudio}
          style={{
            position: "absolute",
            inset: 0,
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            background:
              "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.12), rgba(0,0,0,0.65))",
            color: "rgba(255,255,255,0.92)",
            display: "grid",
            placeItems: "center",
          }}
          aria-label="Enter Lumeris"
          title="Enter Lumeris"
        >
          <div
            style={{
              textAlign: "center",
              padding: "18px 22px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.28)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
              maxWidth: 520,
            }}
          >
            <div style={{ fontSize: 13, letterSpacing: 1.2, opacity: 0.78 }}>
              LUMERIS
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                lineHeight: 1.3,
                letterSpacing: 0.2,
              }}
            >
              Enter the room
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72 }}>
              (starts the self-generated ambience)
            </div>
          </div>
        </button>
      )}

      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            background: audioOnUI
              ? "rgba(255,255,255,0.75)"
              : "rgba(255,255,255,0.18)",
            boxShadow: audioOnUI ? "0 0 18px rgba(255,255,255,0.18)" : "none",
          }}
        />
        <span>{audioOnUI ? "ambience" : "silent"}</span>
      </div>
    </div>
  );
}