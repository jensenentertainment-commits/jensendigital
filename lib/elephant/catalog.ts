export type DriftMode = "day" | "night" | "weekend";

export type CatalogTrack = {
  id: string;
  artist: string;
  title: string;
  file: string; // /elephant/radio/tracks/<id>.mp3
  durationSec: number;
  energy?: 1 | 2 | 3 | 4 | 5;
  radio?: {
    weights?: Partial<Record<DriftMode, number>>;
  };
};

const base = "/elephant/radio/tracks";

export const CATALOG: CatalogTrack[] = [
  // --- existing (17) ---
  {
    id: "abu-plane",
    artist: "Abutilon",
    title: "Plane",
    file: `${base}/abu-plane.mp3`,
    durationSec: 6 * 60 + 34,
    energy: 3,
  },
  {
    id: "abu-pressure",
    artist: "Abutilon",
    title: "Pressure",
    file: `${base}/abu-pressure.mp3`,
    durationSec: 6 * 60 + 8,
    energy: 3,
  },
  {
    id: "christoph-cortado-5am",
    artist: "Christoph Cortado",
    title: "5 A.M.",
    file: `${base}/christoph-cortado-5am.mp3`,
    durationSec: 4 * 60 + 34,
    energy: 2,
  },
  {
    id: "edwin-zondervan-euphoric-horizon",
    artist: "Edwin Zondervan",
    title: "Euphoric Horizon",
    file: `${base}/edwin-zondervan-euphoric-horizon.mp3`,
    durationSec: 5 * 60 + 32,
    energy: 4,
  },
  {
    id: "elias-varde-nordic-embers",
    artist: "Elias Varde",
    title: "Nordic Embers",
    file: `${base}/elias-varde-nordic-embers.mp3`,
    durationSec: 5 * 60 + 4,
    energy: 3,
  },
  {
    id: "jh-still-field",
    artist: "Jimothy Hibiscus",
    title: "Still Field",
    file: `${base}/jh-still-field.mp3`,
    durationSec: 6 * 60 + 27,
    energy: 2,
  },
  {
    id: "jh-weightless-window",
    artist: "Jimothy Hibiscus",
    title: "Weightless Window",
    file: `${base}/jh-weightless-window.mp3`,
    durationSec: 3 * 60 + 13,
    energy: 1,
  },
  {
    id: "kk-pipes-pistons",
    artist: "Karlheinz Kuntze",
    title: "Pipes & Pistons",
    file: `${base}/kk-pipes-pistons.mp3`,
    durationSec: 5 * 60 + 27,
    energy: 4,
  },
  {
    id: "kk-pressure-systems",
    artist: "Karlheinz Kuntze",
    title: "Pressure Systems",
    file: `${base}/kk-pressure-systems.mp3`,
    durationSec: 5 * 60 + 59,
    energy: 4,
  },
  {
    id: "rz-abu-architects-of-air",
    artist: "Roman Zanfino & Abutilon",
    title: "Architects of Air",
    file: `${base}/rz-abu-architects-of-air.mp3`,
    durationSec: 4 * 60 + 30,
    energy: 3,
  },
  {
    id: "rz-abu-jh-converging-lines",
    artist: "Roman Zanfino x Abutilon x Jimothy Hibiscus",
    title: "Converging Lines",
    file: `${base}/rz-abu-jh-converging-lines.mp3`,
    durationSec: 5 * 60 + 56,
    energy: 3,
  },
  {
    id: "rz-delineation",
    artist: "Roman Zanfino",
    title: "Delineation",
    file: `${base}/rz-delineation.mp3`,
    durationSec: 6 * 60 + 44,
    energy: 3,
  },
  {
    id: "rz-jh-structural-mass",
    artist: "Roman Zanfino & Jimothy Hibiscus",
    title: "Structural Mass",
    file: `${base}/rz-jh-structural-mass.mp3`,
    durationSec: 6 * 60 + 12,
    energy: 3,
  },
  {
    id: "rz-meridian-drift-edit",
    artist: "Roman Zanfino",
    title: "Meridian Drift (Edit)",
    file: `${base}/rz-meridian-drift-edit.mp3`,
    durationSec: 4 * 60 + 54,
    energy: 4,
  },
  {
    id: "rz-midnight-parallel",
    artist: "Roman Zanfino",
    title: "Midnight Parallel",
    file: `${base}/rz-midnight-parallel.mp3`,
    durationSec: 5 * 60 + 15,
    energy: 4,
  },
  {
    id: "rz-signal",
    artist: "Roman Zanfino",
    title: "Signal",
    file: `${base}/rz-signal.mp3`,
    durationSec: 4 * 60 + 52,
    energy: 4,
  },
  {
    id: "ulanbator-hypnosis",
    artist: "Ulanbator",
    title: "Hypnosis",
    file: `${base}/ulanbator-hypnosis.mp3`,
    durationSec: 6 * 60 + 4,
    energy: 3,
  },

  // --- new (8) ---
  {
    id: "abu-jh-after-the-night-is-over",
    artist: "Abutilon & Jimothy Hibiscus",
    title: "After the Night Is Over",
    file: `${base}/abu-jh-after-the-night-is-over.mp3`,
    durationSec: 6 * 60 + 15,
    energy: 2,
  },
  {
    id: "cc-engine",
    artist: "Christoph Cortado",
    title: "Engine",
    file: `${base}/cc-engine.mp3`,
    durationSec: 6 * 60 + 20,
    energy: 3,
  },
  {
    id: "ez-fractured",
    artist: "Edwin Zondervan",
    title: "Fractured",
    file: `${base}/ez-fractured.mp3`,
    durationSec: 5 * 60 + 45,
    energy: 4,
  },
  {
    id: "ez-tides",
    artist: "Edwin Zondervan",
    title: "Tides",
    file: `${base}/ez-tides.mp3`,
    durationSec: 5 * 60 + 18,
    energy: 3,
  },
  {
    id: "jh-titleless",
    artist: "Jimothy Hibiscus",
    title: "Titleless",
    file: `${base}/jh-titleless.mp3`,
    durationSec: 3 * 60 + 31,
    energy: 1,
  },
  {
    id: "rz-subterranean",
    artist: "Roman Zanfino",
    title: "Subterranean",
    file: `${base}/rz-subterranean.mp3`,
    durationSec: 6 * 60 + 18,
    energy: 4,
  },
  {
    id: "sublevel-drift",
    artist: "Sublevel",
    title: "Drift",
    file: `${base}/sublevel-drift.mp3`,
    durationSec: 4 * 60 + 47,
    energy: 3,
  },
  {
    id: "the-polin-cowell-experience-the-cow-plow",
    artist: "The Polin Cowell Experience",
    title: "The Cow Plow",
    file: `${base}/the-polin-cowell-experience-the-cow-plow.mp3`,
    durationSec: 5 * 60 + 3,
    energy: 5,
  },
];

export function getCatalog() {
  return CATALOG;
}
