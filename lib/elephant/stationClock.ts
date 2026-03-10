import type { CatalogTrack, DriftMode } from "./catalog";

const HOUR_MS = 3_600_000;

// Fast startpunkt (bare for deterministikk)
const STATION_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], seed: number) {
  const rng = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWindowRotation(mode: DriftMode, nowMs: number, pool: CatalogTrack[]) {
  const hourIndex = Math.floor((nowMs - STATION_EPOCH_MS) / HOUR_MS);

  // mode salt
  const modeSeed = mode === "day" ? 11 : mode === "night" ? 22 : 33;

  // Kandidater: alt, men hvis weights finnes og er 0 => ekskluder
  const candidates = pool.filter((t) => (t.radio?.weights?.[mode] ?? 1) > 0);

  const seed = (hourIndex + 1) * 10_000 + modeSeed;
  const order = shuffled(candidates, seed);

  return order.length ? order : pool;
}

export function getLiveTrack(mode: DriftMode, pool: CatalogTrack[], nowMs = Date.now()) {
  const rotation = getWindowRotation(mode, nowMs, pool);

  const windowStartMs = Math.floor(nowMs / HOUR_MS) * HOUR_MS;
  const elapsedSec = Math.max(0, (nowMs - windowStartMs) / 1000);

  const total = rotation.reduce((sum, t) => sum + (t.durationSec || 0), 0);
  if (!total) return { track: rotation[0], seekSec: 0 };

  let pos = elapsedSec % total;

  for (const t of rotation) {
    const d = t.durationSec || 0;
    if (pos < d) return { track: t, seekSec: pos };
    pos -= d;
  }

  return { track: rotation[rotation.length - 1], seekSec: 0 };
}
