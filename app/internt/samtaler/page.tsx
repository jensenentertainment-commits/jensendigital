"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Kind = "system" | "note" | "msg";

type ChatMsg = {
  id: string;
  ts: number; // epoch ms
  channel: string;
  from: string; // avdeling/rolle
  text: string;
  kind: Kind;
};

const CHANNELS = [
  { key: "ORG-∆7", label: "ORG-∆7" },
  { key: "IF/OPS", label: "IF/OPS" },
  { key: "VA/VIS", label: "VA/VIS" },
  { key: "ARCH", label: "ARCH" },
] as const;

const FROM = ["KOORD", "DRIFT", "MEDIA", "VURD", "ARKIV", "SYSTEM", "VA/VIS"] as const;

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(p: number) {
  return Math.random() < p;
}

function seedArchive(days = 10, count = 220): ChatMsg[] {
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
    "Denne varianten ble ikke videreført",
    "Uklart hvem som flyttet dette",
    "Ikke kommenter dette i åpen kanal",
  ] as const;

  const msgs: ChatMsg[] = [];
  for (let i = 0; i < count; i++) {
    ts += 5000 + Math.random() * (2 * 60 * 60 * 1000);

    const channel = chance(0.55) ? "ORG-∆7" : pick(CHANNELS).key;
    const from = chance(0.16) ? "SYSTEM" : pick(FROM);
    const kind: Kind = from === "SYSTEM" ? "system" : "msg";

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

function makeLivePool(): Record<string, string[]> {
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
      "Slett ved behov",
      "Det var flere igjen",
    ],
    "IF/OPS": [
      "Dette er allerede avklart med Interforum",
      "Ikke skriv Interforum i emnefelt",
      "Hold det på driftssiden",
      "Det skal ikke ut",
      "Tilgang er endret",
      "Synk: delvis",
      "Dette er en intern praksis",
      "Dette anses som kjent",
    ],
    "VA/VIS": [
      "Visual mottatt (Va/Vis)",
      "Variant B forkastet",
      "For tydelig nå",
      "Reduser kontrast",
      "Bruk versjon 3",
      "Omslag: midlertidig",
      "Presentasjon: avventer",
      "Ikke bruk denne fonten",
    ],
    ARCH: [
      "IF-REF/14 mangler vedlegg",
      "Notat ligger feil datert",
      "Gamle referanser beholdes",
      "Arkivpost komprimert",
      "Vedlegg ble fjernet tidligere",
      "Mappe opprettet uten forespørsel",
    ],
  };
}

function nextLiveMessage(used: Set<string>, activeChannel?: string): ChatMsg {
  const pool = makeLivePool();

  const channel =
    activeChannel && chance(0.72) ? activeChannel : pick(CHANNELS).key;

  const from = chance(0.14) ? "SYSTEM" : pick(FROM);
  const kind: Kind = from === "SYSTEM" ? "system" : "msg";

  const candidates = (pool[channel] ?? pool["ORG-∆7"]).slice();
  let text = pick(candidates);
  let guard = 0;
  while (used.has(channel + "::" + text) && guard++ < 40) {
    text = pick(candidates);
  }
  used.add(channel + "::" + text);

  return { id: uid(), ts: Date.now(), channel, from, text, kind };
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string>("ORG-∆7");

  // IMPORTANT: start tomt for å unngå SSR/CSR mismatch
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const usedRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Mount gate
  useEffect(() => {
    setMounted(true);
  }, []);

  // Seed først etter mount (kun klient)
  useEffect(() => {
    if (!mounted) return;
    setMessages(seedArchive(12, 260));
  }, [mounted]);

  // Live “pust” først etter mount
  useEffect(() => {
    if (!mounted) return;

    let alive = true;
    let t: number | undefined;

    const tick = () => {
      if (!alive) return;

      const quiet = Math.random() < 0.12;
      const delay = quiet ? 22000 + Math.random() * 28000 : 4000 + Math.random() * 14000;

      t = window.setTimeout(() => {
        if (!alive) return;

        const msg = nextLiveMessage(usedRef.current, activeChannel);
        setMessages((prev) => [...prev, msg]);

        if (Math.random() < 0.18) {
          const msg2 = nextLiveMessage(usedRef.current, activeChannel);
          window.setTimeout(() => {
            setMessages((prev) => [...prev, msg2]);
          }, 600 + Math.random() * 1400);
        }

        tick();
      }, delay);
    };

    tick();
    return () => {
      alive = false;
      if (t) window.clearTimeout(t);
    };
  }, [mounted, activeChannel]);

  // Autoscroll (diskré) når du er nær bunnen
  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [mounted, messages]);

  // Deterministisk filter (ingen random i render)
  const visible = useMemo(() => {
    return messages.filter((m) => m.channel === activeChannel || m.kind === "system");
  }, [messages, activeChannel]);

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px 520px at 18% 0%, rgba(59,130,246,0.16), transparent 58%), radial-gradient(900px 520px at 85% 12%, rgba(167,139,250,0.18), transparent 55%), linear-gradient(180deg, #070A16, #0B1024)",
        color: "rgba(245,246,250,0.92)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.10)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: "rgba(245,246,250,0.55)" }}>
                Intern kommunikasjon
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                Samtaler
              </div>
              <div className="mt-2 text-sm" style={{ color: "rgba(245,246,250,0.65)" }}>
                Begrenset innsyn. Synkronisering: forsinket.
              </div>
            </div>

            <div className="text-right text-xs" style={{ color: "rgba(245,246,250,0.55)" }}>
              <div>Node: SS-CHAT/INT</div>
              <div style={{ color: "rgba(245,246,250,0.40)" }}>
                Interforum forekommer i intern praksis.
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveChannel(c.key)}
                className="rounded-full border px-3 py-1 text-xs transition"
                style={{
                  borderColor: activeChannel === c.key ? "rgba(167,139,250,0.45)" : "rgba(255,255,255,0.12)",
                  background: activeChannel === c.key ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                  color: "rgba(245,246,250,0.80)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div
          className="mt-6 overflow-hidden rounded-2xl border shadow-sm"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            background: "rgba(10,12,22,0.55)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-5 py-3 text-xs"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(245,246,250,0.60)" }}
          >
            <div>Kanal: {activeChannel}</div>
            <div>Logg: rullende</div>
          </div>

          <div
            ref={scrollRef}
            className="h-[68vh] overflow-auto px-5 py-4"
            style={{
              scrollbarColor: "rgba(167,139,250,0.35) rgba(255,255,255,0.06)",
            }}
          >
            {!mounted ? (
              <div className="text-sm" style={{ color: "rgba(245,246,250,0.55)" }}>
                Laster logg…
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visible.map((m) => (
                    <MessageRow key={m.id} msg={m} />
                  ))}
                </div>

                <div className="mt-6 text-[11px]" style={{ color: "rgba(245,246,250,0.40)" }}>
                  Arkivnoden kan inneholde avvik.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-xs" style={{ color: "rgba(245,246,250,0.40)" }}>
          Utviklet av SystemSentralen. Enkelte enheter er tilknyttet Interforum International.
        </footer>
      </div>
    </main>
  );
}

function MessageRow({ msg }: { msg: ChatMsg }) {
  const isSystem = msg.kind === "system" || msg.from === "SYSTEM";

  const bubbleBg = isSystem
    ? "rgba(255,255,255,0.05)"
    : msg.channel === "VA/VIS"
    ? "rgba(167,139,250,0.10)"
    : msg.channel === "IF/OPS"
    ? "rgba(59,130,246,0.10)"
    : "rgba(255,255,255,0.06)";

  const border = isSystem
    ? "rgba(255,255,255,0.10)"
    : msg.channel === "VA/VIS"
    ? "rgba(167,139,250,0.20)"
    : msg.channel === "IF/OPS"
    ? "rgba(59,130,246,0.20)"
    : "rgba(255,255,255,0.10)";

  return (
    <div className="flex gap-3">
      <div className="w-[78px] shrink-0">
        <div className="text-[11px]" style={{ color: "rgba(245,246,250,0.45)" }}>
          {fmtTime(msg.ts)}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold tracking-wide" style={{ color: "rgba(245,246,250,0.70)" }}>
          {msg.from}
        </div>
      </div>

      <div
        className="min-w-0 flex-1 rounded-xl border px-4 py-3"
        style={{
          background: bubbleBg,
          borderColor: border,
          borderRadius: isSystem ? 10 : 14,
        }}
      >
        <div className="text-[12px]" style={{ color: "rgba(245,246,250,0.55)" }}>
          {msg.channel}
        </div>
        <div className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "rgba(245,246,250,0.92)" }}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}
