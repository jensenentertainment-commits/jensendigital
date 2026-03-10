"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogTrack, DriftMode } from "./catalog";
import { getAutoMode, getRadioPool } from "./radioConfig";
import { getLiveTrack } from "./stationClock";

const STORAGE_KEY = "elephant:transmission:v1";

function safeRead(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWrite(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

type NowPlaying = { kind: "track"; track: CatalogTrack };

export function useTransmission() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pool = useMemo(() => getRadioPool(), []);

  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<"standby" | "connecting" | "connected">("standby");

  const [modeOverride, setModeOverride] = useState<DriftMode | null>(null);
  const [autoMode, setAutoMode] = useState<DriftMode>(() => getAutoMode());
  const mode = modeOverride ?? autoMode;

  const [current, setCurrent] = useState<NowPlaying | null>(null);
  const [previous, setPrevious] = useState<CatalogTrack | null>(null);

  const [progress01, setProgress01] = useState(0);

  // seek after metadata is available
  const pendingSeekRef = useRef<number | null>(null);

  // throttle storage writes
  const lastPersistSecRef = useRef<number>(-1);

  // debounce resync on visibility changes
  const lastResyncMsRef = useRef<number>(0);

  // Prevent event-storms during src switches
  const transitioningRef = useRef(false);

  // Debounce hard-sync calls (ended/error can fire close together)
  const lastHardSyncMsRef = useRef(0);

  // Track when tab was hidden (for better live resync behavior)
  const hiddenAtMsRef = useRef<number | null>(null);

  // Refresh auto mode every 30s
  useEffect(() => {
    const t = setInterval(() => setAutoMode(getAutoMode()), 30_000);
    return () => clearInterval(t);
  }, []);

  const softSeek = useCallback((targetSec: number) => {
    const el = audioRef.current;
    if (!el) return;

    try {
      if (isFinite(el.duration) && el.duration > 0) {
        el.currentTime = Math.min(targetSec, Math.max(0, el.duration - 0.25));
      } else {
        el.currentTime = Math.max(0, targetSec);
      }
    } catch {}
  }, []);

  const playSrc = useCallback(async (src: string) => {
    const el = audioRef.current;
    if (!el) return;

    // Avoid pointless src resets (can cause audible tick)
    if (el.src && el.src.endsWith(src)) {
      try {
        await el.play();
      } catch {}
      return;
    }

    transitioningRef.current = true;

    try {
      el.pause();
      el.src = src;
      el.load();

      // Wait a beat for browser to be ready to play (reduces weird edge cases)
      const onCanPlay = async () => {
        el.removeEventListener("canplay", onCanPlay);

        // If no pending seek was set by caller, default to 0 (done after load)
        if (pendingSeekRef.current == null) {
          pendingSeekRef.current = 0;
        }

        try {
          await el.play();
        } catch {
          // Autoplay policy might block until user gesture.
        } finally {
          transitioningRef.current = false;
        }
      };

      el.addEventListener("canplay", onCanPlay);
    } catch {
      transitioningRef.current = false;
    }
  }, []);

  const playTrack = useCallback(
    async (track: CatalogTrack, seekSec?: number) => {
      // update previous if switching from track to track
      setCurrent((prev) => {
        if (prev?.kind === "track" && prev.track.id !== track.id) {
          setPrevious(prev.track);
        }
        return { kind: "track", track };
      });

      // set pending seek (performed on loadedmetadata)
      if (typeof seekSec === "number" && isFinite(seekSec) && seekSec >= 0) {
        pendingSeekRef.current = seekSec;
      } else {
        pendingSeekRef.current = null; // playSrc will default this to 0 after load
      }

      setProgress01(0);
      lastPersistSecRef.current = -1;

      await playSrc(track.file);
    },
    [playSrc]
  );

  const syncToLive = useCallback(
    async (opts?: { soft?: boolean; driftThreshold?: number }) => {
      const el = audioRef.current;
      if (!pool.length) return;

      const { track, seekSec } = getLiveTrack(mode, pool);
      const currentId = current?.kind === "track" ? current.track.id : null;

      // Soft mode: if we’re already on the same track, only correct drift (if big enough)
      if (opts?.soft && el && currentId === track.id) {
        const drift = Math.abs((el.currentTime || 0) - seekSec);

        // For LIVE vibe: allow some drift (tab throttling causes small discrepancies)
        const thr = opts.driftThreshold ?? 4.0;
        if (drift < thr) return;

        softSeek(seekSec);
        return;
      }

      // Hard sync (track changed or explicit)
      await playTrack(track, seekSec);
    },
    [mode, pool, current?.kind, current?.track?.id, playTrack, softSeek]
  );

  // Resync when tab becomes visible again:
  // LIVE vibe: do a soft resync, but:
  // - delay a bit (browser settles)
  // - allow more drift when you were away briefly (reduces audible “skip”)
  useEffect(() => {
    const onVis = () => {
      if (!connected) return;

      if (document.visibilityState === "hidden") {
        hiddenAtMsRef.current = Date.now();
        return;
      }

      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastResyncMsRef.current < 300) return; // debounce
      lastResyncMsRef.current = now;

      const awayMs = hiddenAtMsRef.current ? now - hiddenAtMsRef.current : 0;
      hiddenAtMsRef.current = null;

      // If you were away briefly, allow more drift to avoid micro-skips.
      // If away longer, tighten it to “snap back” to live.
      const driftThreshold = awayMs < 20_000 ? 6.0 : 3.0;

      setTimeout(() => {
        syncToLive({ soft: true, driftThreshold });
      }, 350);
    };

    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [connected, syncToLive]);

  // Audio events
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const trySeek = () => {
      if (pendingSeekRef.current == null) return;
      const target = pendingSeekRef.current;
      pendingSeekRef.current = null;
      softSeek(target);
    };

    const onLoadedMetadata = () => {
      trySeek();
    };

    const onTime = () => {
      if (!el.duration || !isFinite(el.duration) || el.duration <= 0) {
        setProgress01(0);
      } else {
        setProgress01(Math.min(1, Math.max(0, el.currentTime / el.duration)));
      }

      // Persist only UI crumbs (optional): previous + mode override (NOT track/time)
      const sec = Math.floor(el.currentTime);
      if (sec !== lastPersistSecRef.current) {
        lastPersistSecRef.current = sec;
        safeWrite({
          v: 1,
          prevId: previous?.id ?? null,
          modeOverride,
        });
      }
    };

    const hardSyncDebounced = async () => {
      const now = Date.now();
      if (now - lastHardSyncMsRef.current < 400) return;
      lastHardSyncMsRef.current = now;
      await syncToLive({ soft: false });
    };

    const onEnded = async () => {
      // Ignore ended while switching sources
      if (transitioningRef.current) return;

      // Guard: only treat as real end if we're actually at the end
      const d = el.duration;
      if (isFinite(d) && d > 0 && el.currentTime < d - 0.25) return;

      await hardSyncDebounced();
    };

    const onError = async () => {
      if (transitioningRef.current) return;

      // Try a simple reload/play first (often fixes transient buffer hiccups)
      try {
        el.load();
        await el.play();
        return;
      } catch {}

      await hardSyncDebounced();
    };

    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [modeOverride, previous?.id, softSeek, syncToLive]);

  const join = useCallback(async () => {
    if (connected) return;
    if (!pool.length) {
      console.warn("Elephant Transmission: radio pool is empty.");
      return;
    }

    setConnected(true);
    setStatus("connecting");

    // Restore only crumbs (optional)
    const saved = safeRead();
    if (saved?.modeOverride) setModeOverride(saved.modeOverride);

    // Restore "previously observed" only (optional)
    const savedPrevId = saved?.prevId as string | null | undefined;
    if (savedPrevId) {
      const savedPrev = pool.find((t) => t.id === savedPrevId) ?? null;
      if (savedPrev) setPrevious(savedPrev);
    }

    // Join live (station already running)
    await syncToLive({ soft: false });

    setStatus("connected");
  }, [connected, pool, syncToLive]);

  return {
    audioRef,
    ui: {
      connected,
      status,
      mode,
      modeOverride,
      autoMode,
      now: current?.kind === "track" ? { artist: current.track.artist, title: current.track.title } : null,
      previous: previous ? { artist: previous.artist, title: previous.title } : null,
      progress01,
    },
    actions: {
      join,
      setModeOverride,
    },
  };
}
