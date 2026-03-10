export type ChatMsg = {
  id: string;
  ts: number; // epoch ms
  channel: string;
  from: string; // avdeling/rolle
  text: string;
  kind?: "system" | "note";
};

export const CHANNELS = [
  { key: "ORG-∆7", label: "ORG-∆7", hint: "Intern koordinering" },
  { key: "IF/OPS", label: "IF/OPS", hint: "Interforum drift" },
  { key: "VA/VIS", label: "VA/VIS", hint: "Visuell leveranse" },
  { key: "ARCH", label: "ARCH", hint: "Arkiv / referanser" },
  { key: "VURD", label: "VURD", hint: "Vurdering (uformell)" },
] as const;

const FROM = ["KOORD", "DRIFT", "MEDIA", "VURD", "ARKIV", "SYSTEM", "VA/VIS"] as const;

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function seedArchive(days = 7, count = 160): ChatMsg[] {
  // lager “ekte” historikk med ujevne tidssteg
  const now = Date.now();
  let ts = now - days * 24 * 60 * 60 * 1000;

  const baseTexts = [
    "Ikke legg dette i ekstern mappe",
    "Den ligger i feil struktur",
    "Gamle referanser beholdes",
    "Synkronisering forsinket",
    "Visual mottatt",
    "For tydelig nå",
    "Reduser kontrast",
    "Dette er allerede avklart med Interforum",
    "Hvem godkjente versjon 5",
    "Vedlegg mangler",
    "La den ligge",
    "Den blir stående",
    "Foreløpig observeres",
    "Ingen herfra",
    "Kanal oppdatert",
    "Tilgangsnivå endret",
    "Logg komprimert",
    "Arkivnode tilgjengelig",
  ] as const;

  const msgs: ChatMsg[] = [];
  for (let i = 0; i < count; i++) {
    // ujevne sprang: 5 sek–2t (gir realistisk tempo)
    ts += 5000 + Math.random() * (2 * 60 * 60 * 1000);

    const channel = chance(0.45) ? "ORG-∆7" : pick(CHANNELS).key;
    const from = chance(0.18) ? "SYSTEM" : pick(FROM);
    const kind = from === "SYSTEM" ? "system" : undefined;

    msgs.push({
      id: uid(),
      ts,
      channel,
      from,
      text: pick(baseTexts),
      kind,
    });
  }

  return msgs
    .filter((m) => m.ts < now)
    .sort((a, b) => a.ts - b.ts);
}

export function makeLivePool(): Record<string, string[]> {
  return {
    "ORG-∆7": [
      "Er referansen flyttet igjen",
      "Den var der av en grunn",
      "Hvem åpnet denne igjen",
      "Ikke kommenter dette i åpen kanal",
      "La den ligge",
      "Den blir stående",
      "Det er allerede avklart",
      "Vi tar det senere",
      "Ikke nå",
      "Dette er ikke en sak",
    ],
    "IF/OPS": [
      "Ikke skriv Interforum i emnefelt",
      "Dette er allerede avklart med Interforum",
      "Hold det på driftssiden",
      "Det skal ikke ut",
      "Tilgang er endret",
      "Synk: delvis",
      "Dette er en intern praksis",
    ],
    "VA/VIS": [
      "Visual mottatt (Va/Vis)",
      "Variant B forkastet",
      "For tydelig nå",
      "Reduser kontrast",
      "Bruk versjon 3",
      "Omslag: midlertidig",
      "Presentasjon: avventer",
    ],
    ARCH: [
      "IF-REF/14 mangler vedlegg",
      "Notat ligger feil datert",
      "Gamle referanser beholdes",
      "Arkivpost komprimert",
      "Vedlegg ble fjernet tidligere",
    ],
    VURD: [
      "Foreløpig observeres",
      "Ikke publiser enda",
      "Det er ikke tatt stilling",
      "Ingen innsigelser registrert",
      "Dette anses ikke som feil",
    ],
  };
}

function chance(p: number) {
  return Math.random() < p;
}

export function nextLiveMessage(state: { used: Set<string> }, activeChannel?: string): ChatMsg {
  const pool = makeLivePool();

  // mest sannsynlig i aktiv kanal, men ikke alltid
  const channel =
    activeChannel && chance(0.68)
      ? activeChannel
      : pick(CHANNELS).key;

  // litt systemmeldinger, mest “avdeling”
  const from = chance(0.16) ? "SYSTEM" : pick(FROM);
  const kind = from === "SYSTEM" ? "system" : undefined;

  // plukk en tekst du ikke har brukt nylig
  const candidates = (pool[channel] ?? pool["ORG-∆7"]).slice();
  let text = pick(candidates);
  let guard = 0;
  while (state.used.has(channel + "::" + text) && guard++ < 30) {
    text = pick(candidates);
  }
  state.used.add(channel + "::" + text);

  return {
    id: uid(),
    ts: Date.now(),
    channel,
    from,
    text,
    kind,
  };
}
