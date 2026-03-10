// app/phasefield/model.ts
export type ColorState = {
  tDay: number;        // 0..1 (UTC)
  night: number;       // 0..1 (1 = natt)
  hueBase: number;     // 0..360 (grunn-hue)
  sat: number;         // 0..100
  lumTop: number;      // bg top lightness
  lumBot: number;      // bg bottom lightness
  micro: number;       // 0..1 (minutt-drift)
  climate: number;     // -1..1 (uker)
  climateHue: number;  // hue offset
  event: number;       // 0..1 (sjeldent “fargeevent” intensitet)
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function fract(x: number) {
  return x - Math.floor(x);
}

export function hash01(a: number, b: number) {
  const x = Math.sin(a * 999.123 + b * 313.771) * 10000;
  return fract(x);
}

export function dayProgressUTC(d = new Date()) {
  const ms =
    d.getUTCHours() * 3600_000 +
    d.getUTCMinutes() * 60_000 +
    d.getUTCSeconds() * 1000 +
    d.getUTCMilliseconds();
  return ms / 86_400_000;
}

// langsom klima-syklus: ca 17 dager
function climatePhase(now = Date.now()) {
  const periodDays = 17;
  const t = now / (1000 * 60 * 60 * 24 * periodDays);
  return Math.sin(t * Math.PI * 2); // -1..1
}

// mikrodrift: ca 37 min “pust”
function microPhase(now = Date.now()) {
  const periodMin = 37;
  const t = now / (1000 * 60 * periodMin);
  return fract(t); // 0..1
}

// sjelden event: 1–2 ganger per døgn-ish, varer 20–40 sek
function colorEvent(tDay: number, dayKeyNumber: number, now = Date.now()) {
  // to mulige “vinduer” i døgnet, deterministisk pr dag
  const a = hash01(dayKeyNumber + 1, 11.7); // 0..1
  const b = hash01(dayKeyNumber + 2, 29.1); // 0..1

  const e1 = 0.15 + 0.70 * a; // tidspunkt
  const e2 = 0.15 + 0.70 * b;

  // varighet i døgndel (20–40 sek)
  const durSec = 20 + 20 * hash01(dayKeyNumber + 3, 5.3);
  const dur = durSec / 86_400;

  const pulse = (center: number) => {
    const d = Math.abs(tDay - center);
    const x = 1 - d / dur;
    return clamp(x, 0, 1);
  };

  // litt mykere topp
  const p1 = pulse(e1);
  const p2 = pulse(e2);
  const p = Math.max(p1, p2);
  return p * p * (3 - 2 * p); // smooth-ish 0..1
}
export type FlareState = {
  active: boolean;
  k: number;        // 0..1 intensitet (inn/ut)
  seed: number;     // 0..1 formvariant
  durSec: number;   // varighet
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function buildFlareState(dayKeyNumber: number, now = Date.now()): FlareState {
  // sjekk hvert minutt “vær-blokk”
  const minuteBlock = Math.floor(now / 60_000);

  // flarerate: hver 2–6 time-ish, men deterministisk pr blokk
  // Vi bruker en “trigger” som sjelden slår inn.
  const r = hash01(dayKeyNumber * 0.01, minuteBlock * 0.73);

  // ca ~1/240 minutter = 1 gang per 4 timer i snitt
  const hit = r > 0.9938;

  // Varighet 4–9 sek
  const durSec = 4 + 5 * hash01(dayKeyNumber * 0.07, minuteBlock * 3.11);

  // hvis hit: flare starter ved starten av denne minuttblokken
  const t0 = minuteBlock * 60_000;
  const t = (now - t0) / 1000; // sek siden blokkstart

  if (!hit || t < 0 || t > durSec) {
    return { active: false, k: 0, seed: r, durSec };
  }

  // “pust” inn/ut: rask opp, rolig ned
  const x = t / durSec; // 0..1
  const inPart = smoothstep(0, 0.18, x);
  const outPart = 1 - smoothstep(0.35, 1.0, x);
  const k = Math.max(0, Math.min(1, inPart * outPart));

  return { active: true, k, seed: r, durSec };
}

export function buildColorState(dayKeyNumber: number, now = Date.now()): ColorState {
  const tDay = dayProgressUTC(new Date(now));

  // nattkurve: 1 = natt
  const night = clamp(0.5 + 0.5 * Math.cos((tDay + 0.05) * Math.PI * 2), 0, 1);

  // klima og mikro
  const climate = climatePhase(now);          // -1..1
  const micro = microPhase(now);              // 0..1
  const microWobble = Math.sin((micro + 0.13) * Math.PI * 2); // -1..1

  // grunn-hue: kombiner (døgn + klima + mikro)
  const base = 150 + 120 * Math.sin((tDay * 2.0 + 0.13) * Math.PI * 2);
  const climateHue = climate * 80; // opptil ±42°
  const microHue = microWobble * 18; // ±6°
  let hueBase = (base + climateHue + microHue + 3600) % 360;

  // metning: mer ved “dag”, men mikro varierer litt
  const sat = clamp(72 + 22 * (1 - night) + 8 * microWobble, 58, 94);

  // bakgrunn lyshet: natt = mørkere
  const lumTop = clamp(8 + 10 * (1 - night) + 2 * microWobble, 6, 22);
  const lumBot = clamp(5 + 12 * (1 - night) + 2 * microWobble, 4, 22);

  // sjelden event
  const event = colorEvent(tDay, dayKeyNumber, now);

  // event påvirker hue og sat litt (ikke disco)
  hueBase = (hueBase + event * 55) % 360;

  return { tDay, night, hueBase, sat, lumTop, lumBot, micro, climate, climateHue, event };
  
  
}
