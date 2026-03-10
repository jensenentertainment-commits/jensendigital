"use client";

import React, { useEffect, useRef } from "react";

type DriftMode = "day" | "night" | "weekend";

type ElephantVizGraph = {
  audioEl: HTMLAudioElement;
  ac: AudioContext;
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  gain: GainNode;
};

declare global {
  interface Window {
    __elephantVizGraph?: ElephantVizGraph;
  }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;

function mixColor(
  t: number,
  a: [number, number, number, number],
  b: [number, number, number, number]
) {
  return rgba(
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
    lerp(a[3], b[3], t)
  );
}

function bump(dist: number, width: number) {
  const x = dist / Math.max(0.0001, width);
  return Math.exp(-x * x);
}

export default function WaveVisualizer({
  audioRef,
  mode,
  onLevel,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  mode: DriftMode;
  onLevel?: (level01: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const smoothLevelRef = useRef(0.12);
  const beatEnergyRef = useRef(0);
  const lastLevelRef = useRef(0);
  const kickRef = useRef(0);

  useEffect(() => {
    const audioEl = audioRef.current;
    const canvas = canvasRef.current;
    if (!audioEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const getGraph = (): ElephantVizGraph => {
      const existing = window.__elephantVizGraph;
      if (existing && existing.audioEl === audioEl) return existing;

      if (existing) {
        try {
          existing.source.disconnect();
          existing.analyser.disconnect();
          existing.gain.disconnect();
        } catch {}
        existing.ac.close().catch(() => {});
        window.__elephantVizGraph = undefined;
      }

      const AudioCtx =
        window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio API not supported");

      const ac = new AudioCtx();
      const source = ac.createMediaElementSource(audioEl);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.92;

      const gain = ac.createGain();
      gain.gain.value = 1;

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ac.destination);

      const graph: ElephantVizGraph = { audioEl, ac, source, analyser, gain };
      window.__elephantVizGraph = graph;
      return graph;
    };

    const graph = getGraph();
    const analyser = graph.analyser;
    const data = new Uint8Array(analyser.fftSize);

    const resume = async () => {
      if (graph.ac.state === "suspended") {
        try {
          await graph.ac.resume();
        } catch {}
      }
    };

    audioEl.addEventListener("play", resume);
    audioEl.addEventListener("playing", resume);

    const SEGMENTS = 60;
    const GAP = 4;
    const BASE_THICKNESS = 10;
    const THICKNESS_REACT = 20;
    const AMP_BASE = 5;
    const AMP_REACT = 10;

    const GREEN: [number, number, number, number] = [141, 187, 37, 0.78];
    const PINK: [number, number, number, number] = [221, 3, 141, 0.74];
    const MID_DARK: [number, number, number, number] = [255, 255, 255, 0.22];
    const MID_LIGHT: [number, number, number, number] = [0, 0, 0, 0.12];

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }

      const rms = Math.sqrt(sum / data.length);
      smoothLevelRef.current = smoothLevelRef.current * 0.93 + rms * 0.07;
      const level = clamp01(0.05 + smoothLevelRef.current * 1.35);
      onLevel?.(level);

      const isDark = mode === "night" || mode === "weekend";
      const midY = h / 2;

      const prev = lastLevelRef.current;
      lastLevelRef.current = level;
      const delta = level - prev;

      beatEnergyRef.current = clamp01(
        beatEnergyRef.current * 0.94 + Math.max(0, delta) * 2.6
      );

      const kick = clamp01(beatEnergyRef.current);
      kickRef.current = kickRef.current * 0.88 + kick * 0.12;

      const bassBend = kickRef.current * (6 + level * 8);

      phaseRef.current += 0.01;
      const ph = phaseRef.current;

      const thickness = BASE_THICKNESS + level * THICKNESS_REACT;
      const amp = AMP_BASE + level * AMP_REACT + Math.sin(ph * 0.7) * 1.2;

      ctx.shadowBlur = (isDark ? 18 : 14) + kickRef.current * 10;
      ctx.shadowColor = isDark
        ? "rgba(221,3,141,0.10)"
        : "rgba(141,187,37,0.10)";

      const segW = w / SEGMENTS;
      const capsuleW = Math.max(2, segW - GAP);

      const sampleAt = (t01: number) => {
        const idx = Math.floor(t01 * (data.length - 1));
        const v = (data[idx] - 128) / 128;
        const softened = Math.tanh(v * 1.4);

        const drift =
          Math.sin(ph + t01 * 6.5) * 0.9 +
          Math.sin(ph * 0.7 + t01 * 3.1) * 0.6;

        const centerDist = Math.abs(t01 - 0.5) / 0.5;
        const bendShape = 1 - centerDist * centerDist;
        const bend =
          bassBend * bendShape * Math.sin(ph * 0.9 + t01 * 2.4);

        return softened * amp + drift + bend;
      };

      const s = SEGMENTS;
      const baseSpeed = 0.45;
      const tide = Math.sin(ph * baseSpeed);
      const kickAmt = kickRef.current;
      const ping =
        clamp01(
          0.5 +
            0.5 *
              (tide + kickAmt * 0.9 * Math.sin(ph * 3.0))
        ) *
          2 -
        1;

      const chasePush = kickAmt * 1.6;

      const greenCenter =
        lerp(s * 0.18, s * 0.82, (ping + 1) / 2) + chasePush;
      const pinkCenter =
        lerp(s * 0.82, s * 0.18, (ping + 1) / 2) - chasePush;

      const width = lerp(10.5, 14.0, level) * (1.0 - kickAmt * 0.25);
      const crossCenter = (greenCenter + pinkCenter) * 0.5;
      const crossWidth = width * (0.52 - kickAmt * 0.22);

      ctx.globalAlpha = isDark ? 0.94 : 0.86;

      for (let i = 0; i < SEGMENTS; i++) {
        const x = i * segW + GAP / 2;
        const t = (i + 0.5) / SEGMENTS;

        const yCenter = midY + sampleAt(t);

        const centerDist01 = Math.abs(t - 0.5) / 0.5;
        const centerWeight = 1 - centerDist01 * centerDist01;
        const localThickness = thickness + kickRef.current * centerWeight * 10;
        const localRadius = Math.min(999, localThickness / 2);

        const y = yCenter - localThickness / 2;

        const gStr = bump(i - greenCenter, width);
        const pStr = bump(i - pinkCenter, width);
        const cross = bump(i - crossCenter, crossWidth);

        const denom = gStr + pStr + 0.00001;
        const mix01 = clamp01(pStr / denom);

        let col = mixColor(mix01, GREEN, PINK);

        if (cross > 0.02) {
          const midCol = isDark ? MID_DARK : MID_LIGHT;
          const tMid = clamp01(
            cross * (0.42 + level * 0.25 + kickAmt * 0.22)
          );
          col = mixColor(tMid, parseRGBA(col), midCol);
        }

        ctx.fillStyle = col;
        roundRect(ctx, x, y, capsuleW, localThickness, localRadius);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = isDark ? 0.13 : 0.1;
      ctx.strokeStyle = isDark
        ? "rgba(255,255,255,0.55)"
        : "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;

      for (let i = 0; i < SEGMENTS; i++) {
        const x = i * segW + GAP / 2;
        const t = (i + 0.5) / SEGMENTS;
        const yCenter = midY + sampleAt(t);

        const centerDist01 = Math.abs(t - 0.5) / 0.5;
        const centerWeight = 1 - centerDist01 * centerDist01;
        const localThickness = thickness + kickRef.current * centerWeight * 10;
        const localRadius = Math.min(999, localThickness / 2);

        const y = yCenter - localThickness / 2;

        roundRect(ctx, x, y, capsuleW, localThickness, localRadius);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioEl.removeEventListener("play", resume);
      audioEl.removeEventListener("playing", resume);
      ro.disconnect();
    };
  }, [audioRef, mode, onLevel]);

  return <canvas ref={canvasRef} className="h-12 w-full sm:h-14" aria-hidden="true" />;
}

function parseRGBA(s: string): [number, number, number, number] {
  const m = s.match(/rgba\((\d+),(\d+),(\d+),([0-9.]+)\)/);
  if (!m) return [255, 255, 255, 1];
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.max(0, Math.min(r, h / 2, w / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}