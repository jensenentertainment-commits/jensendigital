"use client";

import { useState } from "react";

const INTERNAL_STATUS = [
  "Delvis operativ",
  "Stabil med indre støy",
  "Midlertidig samlet",
  "Tilgjengelig med forbehold",
  "Funksjonell i korte intervaller",
  "Teknisk til stede",
  "Formelt oppreist",
  "Delvis justert",
  "Praktisk brukbar",
  "Under stille reorganisering",
] as const;

const CAPACITY = [
  "Begrenset, men tilgjengelig",
  "Lav, men ikke fraværende",
  "Ujevn og situasjonsavhengig",
  "Tilstrekkelig for avgrensede tiltak",
  "Bedre i teorien enn i praksis",
  "Moderat, med enkelte åpninger",
  "Redusert uten at drift er stanset",
  "Til stede i konsentrerte perioder",
  "Foreløpig innenfor",
  "Noe presset, men håndterbar",
] as const;

const PROGRESS = [
  "Ujevn, men reell",
  "Langsom uten å være stillestående",
  "Teoretisk pågående",
  "Registrert, men lite synlig",
  "Tilstrekkelig til å omtales som fremdrift",
  "Ikke lineær, men fortsatt gyldig",
  "Avbrutt av mindre forhold",
  "Midlertidig omfordelt",
  "Praktisk forsinket",
  "Lavmælt, men tilstedeværende",
] as const;

const NOTES = [
  "Ytterligere selvinnsikt anses ikke nødvendig akkurat nå.",
  "Det anbefales å ikke tolke alle signaler som avgjørende.",
  "Fravær av oversikt utgjør ikke i seg selv et avvik.",
  "Systemet vurderer situasjonen som håndterbar uten større grep.",
  "Klarhet kan oppstå senere uten aktiv fremprovosering.",
  "Det foreligger ikke grunnlag for dramatikk.",
  "Intern friksjon regnes som en del av normal drift.",
  "Behov for full omstart er ikke identifisert.",
  "Videre vurdering kan med fordel utsettes.",
  "Statusen anses tilstrekkelig til å fortsette i begrenset form.",
] as const;

const RARE = [
  {
    status: "Overvurdert",
    capacity: "Formelt til stede, praktisk usikker",
    progress: "Påstått, men vanskelig å lokalisere",
    note: "Korrigering anbefales ikke mens systemet fortsatt er i bruk.",
  },
  {
    status: "Midlertidig overbevist",
    capacity: "Uvanlig høy uten kjent årsak",
    progress: "Mistenkelig god",
    note: "Tilstanden bør ikke kommuniseres bredt.",
  },
  {
    status: "Teknisk sammensatt",
    capacity: "Spredt utover flere lag",
    progress: "Pågår parallelt med annen intern aktivitet",
    note: "Full forståelse er ikke et krav for videre drift.",
  },
] as const;

type Result = {
  status: string;
  capacity: string;
  progress: string;
  note: string;
};

function pick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function InternStatusPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(0);

  function generate() {
    if (Math.random() < 0.08) {
      setResult(pick(RARE));
      setCount((v) => v + 1);
      return;
    }

    setResult({
      status: pick(INTERNAL_STATUS),
      capacity: pick(CAPACITY),
      progress: pick(PROGRESS),
      note: pick(NOTES),
    });
    setCount((v) => v + 1);
  }

  async function copyResult() {
    if (!result) return;

    const text = [
      `Intern status: ${result.status}`,
      `Kapasitet: ${result.capacity}`,
      `Fremdrift: ${result.progress}`,
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
            Intern status
          </div>

          <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-white/92 sm:text-5xl">
            En løpende vurdering av forhold som allerede er i drift.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/44 sm:text-base">
            Generer en intern rapport. Resultatet er ikke nødvendigvis nytt, men det kan være formelt nyttig.
          </p>
        </header>

        <section className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generate}
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.09] hover:text-white"
            >
              Generer status
            </button>

            <button
              onClick={() => setResult(null)}
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/48 transition hover:border-white/16 hover:text-white/70"
            >
              Nullstill
            </button>
          </div>

          <div className="mt-4 text-[11px] text-white/26">
            Genererte rapporter i denne økten: {count}
          </div>
        </section>

        <section className="mt-6">
          {result ? (
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/28">
                    Aktiv rapport
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
                <InfoCard title="Kapasitet" value={result.capacity} />
                <InfoCard title="Fremdrift" value={result.progress} />
                <InfoCard title="Merknad" value={result.note} />
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/30">
              Ingen intern rapport er generert ennå.
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