import { artists, vault } from "@/lib/elephant";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wide text-black/50">Intern visning</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black/90">
            Elephant Vault
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Utdrag / arbeidsversjoner. Tilgjengelighet: uavklart.
          </p>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 p-4 text-xs uppercase tracking-wide text-black/50">
            Eksklusive spor
          </div>

          <div className="divide-y divide-black/10">
            {vault.map((t) => (
              <div key={t.id} className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-black/90">{t.title}</div>
                    <div className="mt-1 text-xs text-black/55">
                      {artists[t.artist].name}
                      {t.note ? ` • ${t.note}` : ""}
                    </div>
                  </div>

                  <a
                    href={t.file}
                    download
                    className="text-xs text-black/60 hover:text-black/90"
                  >
                    Download
                  </a>
                </div>

                <div className="mt-3">
                  <audio controls preload="none" className="w-full">
                    <source src={t.file} />
                    Nettleseren din støtter ikke audio.
                  </audio>
                </div>

                <div className="mt-2 text-[11px] text-black/45">
                  Referanse: ER-VLT/{t.id}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <a className="text-sm text-black/60 hover:text-black/90" href="elephant">
            ← Tilbake til Elephant Records
          </a>
        </div>
      </div>
    </main>
  );
}
