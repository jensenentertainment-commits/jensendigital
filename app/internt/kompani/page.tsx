// src/app/kompani/page.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kompani & Co — SystemSentralen",
  description:
    "Kompani & Co utvikler originale serie- og formatkonsepter med tydelig strukturell identitet.",
};

type Project = {
  title: string;
  format: string;
  status: string;
  description: string;
  internalNote?: string;
};

const utvalgteProduksjoner: Project[] = [
  {
    title: "Prishandel",
    format: "Komiserie",
    status: "Strukturert utvikling",
    description:
      "En observerende serie om menneskene bak en anonym nettbutikk der systemet er hovedpersonen, og beslutninger oppstår gjennom prosess snarere enn ansvar.",
    internalNote: "Forutsetter tålmodig mottaker.",
  },
  {
    title: "Intensjoner AS",
    format: "Komiserie",
    status: "Strukturert utvikling",
    description:
      "En lavmælt serie om et selskap som selger klimakompensering uten effekt – juridisk korrekt, språklig presis og moralsk uangripelig.",
    internalNote: "Språklige justeringer viktigere enn handling.",
  },
  {
    title: "I henhold til regelverket",
    format: "Reality-hybrid",
    status: "Strukturert utvikling",
    description:
      "Et konkurransebasert format der regelverket gradvis utvikler seg raskere enn spillet selv, til avgjørelser blir umulige.",
    internalNote: "Ingen vinner. I henhold til regelverket.",
  },
];

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline gap-3">
        <div className="text-xs tracking-[0.2em] text-neutral-500">{index}</div>
        <h2 className="text-sm font-semibold tracking-wide text-neutral-800">
          {title}
        </h2>
      </div>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="rounded-md border border-neutral-200/60 bg-white/30 p-4 backdrop-blur">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-neutral-950">
            {p.title}
          </h3>

          <div className="mt-0.5 text-[11px] tracking-wide text-neutral-600">
            <span className="text-neutral-700">Format:</span> {p.format}
          </div>
        </div>

        {/* Én statusvisning holder */}
        <div className="shrink-0 text-[11px] tracking-wide text-neutral-500">
          {p.status}
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-neutral-800">
        {p.description}
      </p>

      {p.internalNote ? (
        <div className="mt-5 border-l border-neutral-300 pl-3">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500">
            INTERN MERKNAD
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-800">
            {p.internalNote}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default function KompaniPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf7ef_0%,#f7f0e2_40%,#f6efe4_100%)] text-neutral-900">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {/* Top */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white/45 p-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-[15px] tracking-[0.65em] text-neutral-800">
                KOMPANI &amp; CO
              </div>
              <div className="mt-3 h-px w-28 bg-neutral-300/60" />
            </div>

            <div className="hidden sm:block text-[10px] tracking-[0.35em] text-neutral-400">
              AUDIOVISUELL UTVIKLINGSENHET
            </div>
          </div>

          <h1 className="mt-5 text-[26px] font-semibold leading-tight tracking-tight text-neutral-950">
            Utvikling av serie- og formatkonsepter.
          </h1>

          <div className="mt-5 space-y-2 text-sm leading-relaxed text-neutral-800">
            <p>
              Kompani &amp; Co utvikler prosjekter innen fiksjon, dokumentar og
              hybride formater.
            </p>
            <p>
              Presentasjonen er kuratert. Ytterligere materiale finnes internt.
            </p>
          </div>
        </div>

        {/* One section only */}
        <Section index="01" title="Utvalgte produksjoner">
          {utvalgteProduksjoner.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </Section>

        {/* Footer */}
        <footer className="mt-12 border-t border-neutral-200 pt-6">
          <div className="text-xs text-neutral-500">
            Infrastruktur levert gjennom SystemSentralen.
          </div>
        </footer>
      </div>
    </main>
  );
}
