import React from "react";
import Link from "next/link";
import { artists } from "@/lib/elephant";

const ER = {
  elephant: "#8dbb25",
  records: "#dd038d",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur">
      {children}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 14px ${color}33` }}
    />
  );
}

function ArtistNameCard({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-5 backdrop-blur transition-all duration-200 hover:translate-y-[-2px] hover:bg-white/[0.07] transition-all duration-200"
      style={{ boxShadow: "0 10px 24px rgba(0,0,0,0.24)" }}
    >
      <div className="text-lg font-semibold tracking-tight text-white/90">
        {title}
      </div>
      <div className="text-white/28 transition group-hover:translate-x-0.5 group-hover:text-white/48">
        →
      </div>
    </a>
  );
}

export default function Page() {
  const officialKeys = ["jimothy-hibiscus", "abutilon"] as const;
  const official = officialKeys.map((k) => ({ key: k, ...artists[k] })).filter(Boolean);

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f1114, #07090b)" }}
    >
      {/* drifting color field */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="er-blob er-blob-a" />
        <div className="er-blob er-blob-b" />
        <div className="er-grain" />
      </div>

      <style>{`
        @keyframes erSweep {
          0% { background-position: 0% 50%; transform: translateX(-1.2%); opacity: 0.9; }
          50% { background-position: 100% 50%; transform: translateX(1.2%); opacity: 1; }
          100% { background-position: 0% 50%; transform: translateX(-1.2%); opacity: 0.9; }
        }

        .er-strip {
          background-size: 220% 100%;
          animation: erSweep 16s ease-in-out infinite;
          filter: blur(0.2px);
          will-change: transform, background-position, opacity;
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        {/* Top line */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/systemsentralen"
              className="text-[10px] uppercase tracking-[0.28em] text-white/34 transition hover:text-white/52"
              style={{ textDecoration: "none" }}
            >
              ← Sentralen
            </Link>

            <div className="hidden h-3 w-px bg-white/10 sm:block" />

            <div className="flex items-center gap-2">
              <Dot color={ER.elephant} />
              <Dot color={ER.records} />
            </div>

            <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
              Elephant Records
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill>Label node</Pill>
            <Pill>Transmission active</Pill>
          </div>
        </div>

        {/* Hero */}
        <header className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">
              Recorded sound / internal signal / external distribution
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <span style={{ color: ER.elephant }}>Elephant</span>{" "}
              <span style={{ color: ER.records }}>Records</span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-white/60 sm:text-[15px]">
              Elephant Records er en struktur for utgivelser, signal og intern
              transmisjon. Noe distribueres ut. Noe forblir i systemet.
            </p>
          </div>
        </header>

        {/* Transmission */}
        <section className="mb-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">
                Current transmission
              </div>

              <div className="mt-2 text-xl font-semibold tracking-tight text-white/88">
                Continuous signal
              </div>

              <div className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
                Du kobler deg på sendingen der den er. Ingen historikk. Ingen skips.
                Bare aktiv transmisjon.
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Pill>Adaptive mode</Pill>
                <Pill>Sparse markers</Pill>
                <Pill>No history</Pill>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                Status:{" "}
                <span className="font-medium" style={{ color: ER.elephant }}>
                  active
                </span>
              </div>

              <a
                href="/elephant/radio"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white/88 backdrop-blur transition-all duration-200 hover:translate-y-[-1px] hover:bg-white/15"
              >
                Join transmission <span className="text-white/42">▶</span>
              </a>

              <a
                href="/elephant/about"
                className="text-sm text-white/52 transition hover:text-white/78"
              >
                Read protocol →
              </a>
            </div>
          </div>

          <div className="mt-6 h-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div
              className="er-strip h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(141,187,37,0.22), rgba(255,255,255,0) 30%, rgba(221,3,141,0.18) 60%, rgba(255,255,255,0))",
              }}
            />
          </div>
        </section>

        {/* Official artists */}
        <section className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
              Official artists
            </div>
            <div className="text-xs text-white/38">External distribution</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {official.map((a) => (
              <ArtistNameCard
                key={a.key}
                title={a.name}
                href={`/elephant/${a.key}`}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-white/8 pt-6 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <div>Infrastruktur levert via SystemSentralen.</div>
          <div className="text-white/30">Ref: ER-HOME/03</div>
        </footer>
      </div>
    </main>
  );
}