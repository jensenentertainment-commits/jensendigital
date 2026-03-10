// ===============================
// Types
// ===============================

export type ArtistKey =
  | "jimothy-hibiscus"
  | "abutilon"
  | "roman-zanfino"
  | "er-rd-u17";

export type DistributionChannel = "Spotify" | "On-site";

export type Release = {
  id: string;
  artist: ArtistKey;
  title: string;
  type: "Single" | "EP" | "Album";
  releaseDate: string; // yyyy-mm-dd
  status: "Scheduled" | "Delivered" | "Draft";
  channel: DistributionChannel;
  cover?: string; // /elephant/covers/xxx.jpg
};

export type VaultTrack = {
  id: string;
  artist: ArtistKey;
  title: string;
  file: string; // /elephant/vault/xxx.mp3
  note?: string;
};

export type ArtistMeta = {
  name: string;
  blurb: string;
  tone: string;
  channel: DistributionChannel;
  note?: string;
};

// ===============================
// Artists
// ===============================

export const artists: Record<ArtistKey, ArtistMeta> = {
  "jimothy-hibiscus": {
    name: "Jimothy Hibiscus",
    blurb: "Langform / lavmælt drift. Minor avvik forekommer.",
    tone: "Ambient / cycles / dokumentarisk ro",
    channel: "Spotify",
  },

  abutilon: {
    name: "Abutilon",
    blurb: "Presis, varig, litt for ren til å forklares.",
    tone: "Ambient / residual / presence",
    channel: "Spotify",
  },

  "roman-zanfino": {
    name: "Roman Zanfino",
    blurb: "Arkitektonisk progresjon. Struktur uten klimaks.",
    tone: "Progressive / form / gradvis utvikling",
    channel: "On-site",
    note: "Eksklusiv publisering via Elephant Records.",
  },

  "er-rd-u17": {
    name: "ER-RD-U17",
    blurb: "Dokumenterte systemer i drift. Ingen komposisjon.",
    tone: "Infrastructure / documentation / mechanical",
    channel: "On-site",
    note: "Ikke distribusjon. Kun intern visning.",
  },
};

// ===============================
// Public & On-site Releases
// ===============================

export const releases: Release[] = [
  // Spotify-distribuerte
  {
    id: "night-cycles",
    artist: "jimothy-hibiscus",
    title: "Night Cycles",
    type: "Album",
    releaseDate: "2026-02-27",
    status: "Delivered",
    channel: "Spotify",
  },
  {
    id: "morning-cycles",
    artist: "jimothy-hibiscus",
    title: "Morning Cycles",
    type: "Album",
    releaseDate: "2026-04-08",
    status: "Scheduled",
    channel: "Spotify",
  },
  {
    id: "life-cycles",
    artist: "jimothy-hibiscus",
    title: "Life Cycles",
    type: "Album",
    releaseDate: "2026-05-25",
    status: "Scheduled",
    channel: "Spotify",
  },
  {
    id: "abutilon-residual",
    artist: "abutilon",
    title: "Abutilon Residual",
    type: "Album",
    releaseDate: "2026-06-06",
    status: "Draft",
    channel: "Spotify",
  },
  {
    id: "presence",
    artist: "abutilon",
    title: "Presence",
    type: "Album",
    releaseDate: "2026-09-04",
    status: "Draft",
    channel: "Spotify",
  },

  // On-site eksklusive
  {
    id: "zanfino-structure-i",
    artist: "roman-zanfino",
    title: "Structure I",
    type: "Album",
    releaseDate: "2026-11-14",
    status: "Draft",
    channel: "On-site",
  },
  {
    id: "u17-log-01",
    artist: "er-rd-u17",
    title: "Operational Log 01",
    type: "EP",
    releaseDate: "2026-12-01",
    status: "Draft",
    channel: "On-site",
  },
];

// ===============================
// Internal Vault
// ===============================

export const vault: VaultTrack[] = [
  {
    id: "jh-internal-01",
    artist: "jimothy-hibiscus",
    title: "Internal Mix 01",
    file: "/elephant/vault/jh-internal-01.mp3",
    note: "Arbeidsversjon. Ikke del.",
  },
  {
    id: "abu-internal-01",
    artist: "abutilon",
    title: "Roomtone (Unlisted)",
    file: "/elephant/vault/abu-internal-01.mp3",
    note: "Kun intern visning.",
  },
  {
    id: "rz-sequence-a",
    artist: "roman-zanfino",
    title: "Sequence Draft A",
    file: "/elephant/vault/rz-sequence-a.mp3",
    note: "Arkitektonisk testsekvens.",
  },
  {
    id: "u17-cycle-03",
    artist: "er-rd-u17",
    title: "Ventilation Cycle 03",
    file: "/elephant/vault/u17-cycle-03.mp3",
    note: "Dokumentasjon av kontinuerlig drift.",
  },
];
