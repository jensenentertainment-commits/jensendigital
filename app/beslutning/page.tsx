"use client";

import { useMemo, useState } from "react";

const DECISIONS = [
  "Foreløpig godkjent",
  "Midlertidig avklart",
  "Ikke avvist",
  "Kan gjennomføres med forbehold",
  "Tiltaket frarådes ikke",
  "Videreføring anses som forsvarlig",
  "Beslutningen kan forsvares språklig",
  "Delvis anbefalt",
  "Tilgjengelig for gjennomføring",
  "Ikke prioritert, men mulig",
] as const;

const BASIS = [
  "Grunnlaget er svakt, men tilstrekkelig.",
  "Vurderingen bygger hovedsakelig på stemning og restkapasitet.",
  "Dokumentasjonen er begrenset, men ikke fraværende.",
  "Det foreligger ikke tungtveiende motforestillinger akkurat nå.",
  "Beslutningen støttes av et foreløpig akseptabelt skjønn.",
  "Det finnes forhold som taler både for og imot, men mest for nok.",
  "Saken er ikke tilstrekkelig avklart til å avvises.",
  "Det er rom for handling uten at noen trenger å stå hardt i det.",
  "Risikoen er forstått i teorien.",
  "Det er ikke identifisert forhold som krever full stans.",
] as const;

const RISK = [
  "Lav, men merkbar",
  "Moderat og håndterbar",
  "Ujevn, men innenfor",
  "Uklar, men akseptabel",
  "Noe forhøyet ved oppfølging",
  "Teoretisk høy, praktisk lav",
  "Operativt moderat",
  "Mildt krevende",
  "Avgrenset, men levende",
  "Til stede uten å dominere",
] as const;

const NOTES = [
  "Ny vurdering anbefales ikke før tiltaket faktisk er forsøkt.",
  "Ytterligere analyse vil trolig ikke bedre beslutningsgrunnlaget nevneverdig.",
  "Beslutningen bør helst fremstå rolig utad.",
  "Ansvar kan fordeles senere ved behov.",
  "Tiltaket bør ikke overforklares.",
  "Videre tvil anses som normal.",
  "Forankring kan etableres i etterkant.",
  "Usikkerhet alene utgjør ikke tilstrekkelig grunnlag for utsettelse.",
  "Ingen garanti foreligger. Det gjør sjelden det.",
  "Hvis dette mislykkes, bør tonen fortsatt være kontrollert.",
] as const;

const GLITCH = [
  {
    decision: "Ikke relevant",
    basis: "Saken har glidd over i en annen kategori uten at dette er varslet.",
    risk: "Formelt ukjent",
    note: "Ny vurdering kan forverre situasjonen.",
  },
  {
    decision: "Foreløpig utilgjengelig",
    basis: "Beslutningsgrunnlaget er midlertidig opptatt i annet arbeid.",
    risk: "Uspesifisert",
    note: "Avventing fremstår ikke svakere enn handling.",
  },
  {
    decision: "Godkjent i teorien",
    basis: "Praktisk grunnlag foreligger ikke, men innvendingene er heller ikke samlet.",
    risk: "Akademisk",
    note: "Tiltaket bør ikke møte virkeligheten unødvendig tidlig.",
  },
] as const;

type Result = {
  decision: string;
  basis: string;
  risk: string;
  note: string;
};

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function DecisionPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(0);

 const placeholder = "Bør dette gjennomføres?";

  function evaluate() {
    const trimmed = question.trim();

    if (!trimmed) return;

    const glitchRoll = Math.random();

    if (glitchRoll < 0.08) {
      setResult(pick(GLITCH));
      setCount((v) => v + 1);
      return;
    }

    setResult({
      decision: pick(DECISIONS),
      basis: pick(BASIS),
      risk: pick(RISK),
      note: pick(NOTES),
    });
    setCount((v) => v + 1);
  }

  async function copyResult() {
    if (!result) return;

    const text = [
      `Beslutning: ${result.decision}`,
      `Grunnlag: ${result.basis}`,
      `Risiko: ${result.risk}`,
      `Merknad: ${result.note}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // stille fallback – ikke viktig nok til mer styr
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08), transparent 30%)",
        }}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <a
          href="/systemsentralen"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/32 transition hover:text-white/50"
          style={{ textDecoration: "none" }}
        >
          <span>←</span>
          <span>Tilbake</span>
        </a>

        <header className="mt-8 border-b border-white/10 pb-8">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/24">
            Beslutningsstøtte
          </div>

          <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-white/92 sm:text-5xl">
            En digital vurderingsenhet for spørsmål som ikke blir bedre av mer tenking.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/44 sm:text-base">
            Still et spørsmål. Motta en vurdering. Ikke nødvendigvis en løsning.
          </p>
        </header>

        <section className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
          <label
            htmlFor="question"
            className="block text-[11px] uppercase tracking-[0.24em] text-white/38"
          >
            Spørsmål
          </label>

          <div className="mt-3">
            <input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") evaluate();
              }}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/18 focus:bg-black/40"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={evaluate}
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.09] hover:text-white"
            >
              Vurder
            </button>

            <button
              onClick={() => {
                setQuestion("");
                setResult(null);
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/48 transition hover:border-white/16 hover:text-white/70"
            >
              Nullstill
            </button>
          </div>

          <div className="mt-4 text-[11px] text-white/26">
            Antall vurderinger i denne økten: {count}
          </div>
        </section>

        <section className="mt-6">
          {result ? (
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/28">
                    Vurdering
                  </div>
                  <div className="mt-3 text-2xl font-medium tracking-[-0.03em] text-white/92">
                    {result.decision}
                  </div>
                </div>

                <button
                  onClick={copyResult}
                  className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/46 transition hover:border-white/16 hover:text-white/72"
                >
                  Kopier
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InfoCard title="Grunnlag" value={result.basis} />
                <InfoCard title="Risiko" value={result.risk} />
                <InfoCard title="Merknad" value={result.note} />
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/30">
              Ingen vurdering er gjennomført ennå.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
        {title}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-white/72">{value}</div>
    </div>
  );
}