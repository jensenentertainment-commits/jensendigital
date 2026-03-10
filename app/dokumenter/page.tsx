const docs = [
  {
    title: "Endringslogg (utdrag)",
    meta: "Revisjon: mindre • 2026-02-10",
    snippet:
      "Konsolidering av navngiving. Tilknyttede systemer beholdes uendret.",
  },
  {
    title: "Rundskriv 04/2026",
    meta: "Gyldighet: uavklart • 2026-02-07",
    snippet:
      "Interne flater kan fremstå ufullstendige. Dette anses ikke som avvik.",
  },
  {
    title: "Notat – tilgangspraksis",
    meta: "For intern bruk • 2026-02-02",
    snippet:
      "Tilgang gis etter behov. Behov vurderes fortløpende.",
  },
];

export default function Dokumenter() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Dokumenter
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Utdrag og arkivmateriale. Enkelte dokumenter kan være ufullstendige.
        </p>
      </header>

      <div className="space-y-4">
        {docs.map((d) => (
          <div
            key={d.title}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="text-base font-medium tracking-tight text-zinc-950">
              {d.title}
            </div>
            <div className="mt-1 text-sm text-zinc-500">{d.meta}</div>
            <div className="mt-3 text-sm leading-relaxed text-zinc-700">
              {d.snippet}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <a className="text-sm text-zinc-700 hover:text-zinc-950" href="/">
          ← Tilbake til oversikt
        </a>
      </div>
    </main>
  );
}
