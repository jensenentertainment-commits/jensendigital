"use client";

import { useState } from "react";

const STATUS = [
  "Stabil med avvik",
  "Midlertidig normalisert",
  "Delvis operativ",
  "Nominal, med forbehold",
  "Foreløpig avklart",
  "Under stille observasjon",
  "Aktiv uten tydelig grunn",
  "Teknisk rolig",
  "Formelt uendret",
  "Praktisk bevegelig",
] as const;

const EVENTS = [
  "Ekstern påvirkning er registrert, men ikke bekreftet.",
  "Et mindre avvik er ført uten at dette krever tiltak.",
  "Signalgrunnlaget fremstår samlet, men noe ujevnt.",
  "Intern justering er gjennomført uten offentlig betydning.",
  "Flere forhold peker i samme retning, uten å forplikte systemet.",
  "Systemet har oppfattet endring, men ikke konkludert med den.",
  "Bakgrunnsprosesser er aktive, men uten synlig fremdrift.",
  "En uvanlig rolig periode er observert og notert.",
  "Datagrunnlaget er forbedret uten at dette endrer vurderingen.",
  "Tilknyttede noder fremstår samkjørte i teorien.",
] as const;

const ACTIONS = [
  "Videre observasjon anses som tilstrekkelig.",
  "Ingen aktiv respons anbefales på nåværende tidspunkt.",
  "Tiltak er vurdert, men ikke funnet nødvendig.",
  "Situasjonen håndteres best ved kontrollert passivitet.",
  "Systemet opprettholder nåværende nivå uten justering.",
  "Ytterligere handling kan skape unødig tydelighet.",
  "Forholdet anses ivaretatt gjennom fortsatt oppmerksomhet.",
  "Midlertidig avventing vurderes som mest presist.",
  "Eventuell respons bør fremstå rolig og udramatisk.",
  "Tiltak kan etableres i etterkant dersom dette blir relevant.",
] as const;

const NOTES = [
  "Ytterligere reaksjon vil kunne forstyrre helhetsbildet.",
  "Fravær av eskalering skal ikke tolkes som fravær av aktivitet.",
  "Normal drift kan etterlate et misvisende inntrykk av kontroll.",
  "Det foreligger ingen garanti for at utviklingen ønsker å være tydelig.",
  "Situasjonen er ikke nødvendigvis ferdig bare fordi den virker ferdig.",
  "Det anbefales å ikke overtolke stabilitet.",
  "Observasjonen opprettholdes også når ingenting synes å skje.",
  "Mer informasjon vil ikke automatisk bedre forståelsen.",
  "Systemet er kjent med forholdet i den grad det er nødvendig.",
  "Videre klarhet kan ikke loves uten at noe går tapt.",
] as const;

const RARE = [
  {
    status: "Ikke relevant",
    event: "Systemet vurderer ikke lenger dette som en hendelse i ordinær forstand.",
    action: "Ingen videre behandling gjennomføres.",
    note: "Forsøk på avklaring kan føre saken tilbake til aktiv tilstand.",
  },
  {
    status: "Tilbakeført",
    event: "Forholdet er flyttet til et tidligere nivå uten at dette anses som tilbakeslag.",
    action: "Ny gjennomgang utsettes.",
    note: "Tidslinjen fremstår fortsatt brukbar, men mindre lineær enn antatt.",
  },
  {
    status: "Teknisk utilgjengelig",
    event: "Meldingen foreligger, men grunnlaget ønsker ikke å samle seg.",
    action: "Midlertidig stillhet opprettholdes.",
    note: "Manglende klarhet skal ikke leses som systemsvikt alene.",
  },
] as const;

type Result = {
  status: string;
  event: string;
  action: string;
  note: string;
};

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SystemmeldingPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(0);

  function generate() {
    if (Math.random() < 0.07) {
      setResult(pick(RARE));
      setCount((v) => v + 1);
      return;
    }

    setResult({
      status: pick(STATUS),
      event: pick(EVENTS),
      action: pick(ACTIONS),
      note: pick(NOTES),
    });
    setCount((v) => v + 1);
  }

  async function copyResult() {
    if (!result) return;

    const text = [
      `Status: ${result.status}`,
      `Hendelse: ${result.event}`,
      `Tiltak: ${result.action}`,
      `Merknad: ${result.note}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignorer
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
            Systemmelding
          </div>

          <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-white/92 sm:text-5xl">
            Løpende status for forhold som ikke nødvendigvis angår deg.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/44 sm:text-base">
            Generer en oppdatert melding. Innholdet er formelt gyldig så lenge det står der.
          </p>
        </header>

        <section className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generate}
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.09] hover:text-white"
            >
              Generer melding
            </button>

            <button
              onClick={() => setResult(null)}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/48 transition hover:border-white/16 hover:text-white/70"
            >
              Nullstill
            </button>
          </div>

          <div className="mt-4 text-[11px] text-white/26">
            Genererte meldinger i denne økten: {count}
          </div>
        </section>

        <section className="mt-6">
          {result ? (
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/28">
                    Aktiv melding
                  </div>
                  <div className="mt-3 text-2xl font-medium tracking-[-0.03em] text-white/92">
                    {result.status}
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
                <InfoCard title="Hendelse" value={result.event} />
                <InfoCard title="Tiltak" value={result.action} />
                <InfoCard title="Merknad" value={result.note} />
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/30">
              Ingen aktiv melding er generert ennå.
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