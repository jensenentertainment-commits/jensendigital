import type { CatalogTrack, DriftMode } from "./catalog";
import { CATALOG } from "./catalog";

export const SYSTEM_MARKERS = {
  // keep these even if files don't exist yet; useTransmission håndterer errors
  joinVoice: "/elephant/radio/system/joining-transmission.mp3",
  modeTransition: "/elephant/radio/system/mode-transition.mp3",
  systemBreath: [
    "/elephant/radio/system/breath-01.mp3",
    "/elephant/radio/system/breath-02.mp3",
    "/elephant/radio/system/breath-03.mp3",
  ],
} as const;

export function getRadioPool(): CatalogTrack[] {
  // for now: everything is in the pool
  return CATALOG;
  // senere kan du styre med weights:
  // return CATALOG.filter(t => (t.radio?.weights?.day ?? 1) > 0 || (t.radio?.weights?.night ?? 1) > 0 || (t.radio?.weights?.weekend ?? 1) > 0);
}

export function getAutoMode(now = new Date()): DriftMode {
  const day = now.getDay(); // 0=Sun
  const hour = now.getHours();

  const isWeekend = day === 5 || day === 6 || day === 0; // Fri/Sat/Sun
  if (isWeekend) return "weekend";

  return hour >= 7 && hour < 19 ? "day" : "night";
}
