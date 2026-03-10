"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

export default function DotVisualizer({
  audioRef,
  mode,
  dots = 52,
  onLevel,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  mode: DriftMode;
  dots?: number;
  onLevel?: (level01: number) => void;
}) {
  const rafRef = useRef<number | null>(null);
  const [vals, setVals] = useState<number[]>(() => Array(dots).fill(0));

  const smooth = useRef<number[]>(Array(dots).fill(0));
  const peak = useRef<number[]>(Array(dots).fill(0));
  const lastLevelRef = useRef(0.12);

  const isDark = mode === "night" || mode === "weekend";

  const dotStyleBase = useMemo(() => {
    return {
      background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)",
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    };
  }, [isDark]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

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

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ac = new AudioCtx();

      const source = ac.createMediaElementSource(audioEl);

      const analyser = ac.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.86; // less smoothing = more life

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

    const freq = new Uint8Array(analyser.frequencyBinCount);

    const resume = async () => {
      if (graph.ac.state === "suspended") {
        try {
          await graph.ac.resume();
        } catch {}
      }
    };

    audioEl.addEventListener("play", resume);
    audioEl.addEventListener("playing", resume);

    // helpers
    const binCount = freq.length;
    const minBin = 2; // skip DC-ish
    const maxBin = binCount - 1;

    // ambient boost: lift floor + expand dynamics
    const FLOOR = 0.10;      // keeps “life” on quiet tracks
    const GAIN = 2.00;       // overall sensitivity
    const GAMMA = 0.95;      // <1 = boost low values

    // peak hold behavior
    const PEAK_DECAY = 0.92; // closer to 1 = longer memory
    const SMOOTH = 0.78;     // smoothing per dot

    let phase = 0;

    const tick = () => {
      analyser.getByteFrequencyData(freq);

      const out = new Array(dots).fill(0);
      let levelAcc = 0;

      // log-spread across spectrum
      for (let i = 0; i < dots; i++) {
        const t = i / (dots - 1);

        // log mapping: more resolution in lows, but still reaches highs
        const logT = Math.log10(1 + 9 * t) / Math.log10(10); // 0..1
        const idx = Math.floor(minBin + logT * (maxBin - minBin));

        let v = freq[idx] / 255; // 0..1

        // lift + gain + gamma curve
        v = clamp01((v + FLOOR) * GAIN);
        v = Math.pow(v, GAMMA);

        out[i] = v;
        levelAcc += v;
      }

      // smooth + peak hold (gives visible motion)
      const s = smooth.current;
      const p = peak.current;

      for (let i = 0; i < dots; i++) {
        s[i] = s[i] * SMOOTH + out[i] * (1 - SMOOTH);

        // peak = max(smooth, decayed peak)
        p[i] = Math.max(s[i], p[i] * PEAK_DECAY);

        // blend peak slightly into display so it “breathes”
        out[i] = clamp01(s[i] * 0.72 + p[i] * 0.28);
      }

      // add a subtle “traveling” emphasis so it feels alive even on steady pads
      phase += 0.022;
      const travel = (Math.sin(phase) * 0.5 + 0.5) * (dots - 1);
      const ti = Math.floor(travel);

      for (let i = 0; i < dots; i++) {
        const d = Math.abs(i - ti);
        const bump = Math.exp(-(d * d) / 90) * 0.10; // subtle
        out[i] = clamp01(out[i] + bump);
      }

      // global level for header dots
      const level = clamp01(levelAcc / dots);
      lastLevelRef.current = lastLevelRef.current * 0.90 + level * 0.10;
      onLevel?.(lastLevelRef.current);

      setVals(out);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioEl.removeEventListener("play", resume);
      audioEl.removeEventListener("playing", resume);
      // do not close AudioContext (dev stability)
    };
  }, [audioRef, dots, onLevel]);

  return (
    <div className="flex w-full items-center justify-between gap-1.5">
      {vals.map((v, i) => {
        // green -> pink progression across the row
        const mix = i / Math.max(1, vals.length - 1);
        const r = Math.round(141 + (221 - 141) * mix);
        const g = Math.round(187 + (3 - 187) * mix);
        const b = Math.round(37 + (141 - 37) * mix);

        // display mapping (more visible)
        const alpha = (isDark ? 0.10 : 0.08) + v * (isDark ? 0.65 : 0.55);
        const glow = (isDark ? 5 : 4) + v * 16;
        const scale = 0.75 + v * 0.75;

        return (
          <span
            key={i}
            className="h-3 w-3 rounded-full border"
            style={{
              background: dotStyleBase.background,
              borderColor: dotStyleBase.border,
              boxShadow: `0 0 ${glow}px rgba(${r},${g},${b},${alpha})`,
              transform: `scale(${scale})`,
              opacity: 0.35 + v * 0.65,
              transition: "transform 70ms linear, opacity 70ms linear",
            }}
          />
        );
      })}
    </div>
  );
}
