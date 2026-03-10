// app/internt/multiplum/page.tsx

import Link from "next/link";

type Book = {
  slug: string;
  title: string;
  author: string;
  note?: string;
  cover?: string;
};

type TextObject = {
  slug: string;
  title: string;
  author: string;
};

const mainWorks: Book[] = [
  {
    slug: "bok-for-bokas-skyld",
    title: "Bok for bokas skyld",
    author: "Margrete Vollan",
    note: "Samling av selvstendige tekster uten narrativ progresjon.",
    cover: "/covers/multiplum/bok-for-bokas-skyld.png",
  },
  {
    slug: "korreksjoner",
    title: "Korreksjoner",
    author: "Einar H. Selvik",
    note: "Tekster strukturert som rettelser uten original.",
    cover: "/covers/multiplum/korreksjoner.png",
  },
  {
    slug: "anmerkninger",
    title: "Anmerkninger",
    author: "Clara Weiss",
    note: "Kortprosa i randsonen av protokoll og notat.",
    cover: "/covers/multiplum/anmerkninger.png",
  },
];

const objects: TextObject[] = [
  { slug: "referat-uten-sak", title: "Referat uten sak", author: "Tomasz Linder" },
  { slug: "liste-over-ubrukte-titler", title: "Liste over ubrukte titler", author: "Ingrid Hovden" },
  { slug: "utkast-til-forord-forkastet", title: "Utkast til forord (forkastet)", author: "Arnaud Bellier" },
];

export default function MultiplumPage() {
  return (
    <main className="min-h-screen text-zinc-900 bg-[#fbfaf7]">
      {/* subtil vignett */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.55] [background:radial-gradient(900px_600px_at_50%_0%,rgba(0,0,0,0.035),transparent_65%)]" />
      {/* subtil grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(#000_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 backdrop-blur-[1px] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-12 sm:px-12 sm:py-14">

            {/* Header */}
            <header>
              <p className="mb-6 text-[11px] tracking-[0.28em] text-zinc-600">
                INTERN EKSTERN AVDELING · SYSTEMSENTRALEN
              </p>

              <h1 className="font-serif text-4xl leading-tight tracking-[0.14em] sm:text-5xl">
                MULTIPLUM FORLAG
              </h1>

              <p className="mt-6 max-w-prose font-serif text-base leading-7 text-zinc-700">
                Multiplum publiserer tekstlige arbeider. Vurdering skjer på grunnlag av form og språklig
                struktur. Innholdets funksjon er ikke avgjørende.
              </p>
            </header>

            {/* Utgivelser */}
            <section className="mt-16">
              <h2 className="mb-8 font-serif text-xl tracking-wide">
                Utgivelser
              </h2>

              <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
                {mainWorks.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/internt/multiplum/utgivelser/${b.slug}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden border border-zinc-200 bg-zinc-50 shadow-[0_8px_22px_rgba(0,0,0,0.05)] transition-transform duration-200 group-hover:-translate-y-0.5">
                      {b.cover ? (
                        <img
                          src={b.cover}
                          alt={`${b.title} omslag`}
                          className="h-full w-full object-cover grayscale opacity-90"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] tracking-[0.22em] text-zinc-500">
                          COVER
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="font-serif text-[15px] leading-6 underline underline-offset-4 decoration-zinc-200 group-hover:decoration-zinc-700">
                        {b.title}
                      </div>
                      <div className="mt-1 text-[12px] text-zinc-600">
                        {b.author}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Tekstlige objekter */}
            <section className="mt-20">
              <h2 className="mb-6 font-serif text-xl tracking-wide">
                Tekstlige objekter
              </h2>

              <ul className="space-y-4">
                {objects.map((o) => (
                  <li key={o.slug} className="border-b border-zinc-200/60 pb-4">
                    <Link
                      href={`/internt/multiplum/utgivelser/${o.slug}/tekst`}
                      className="font-serif text-[15px] leading-7 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                    >
                      {o.title}
                    </Link>
                    <div className="mt-1 text-[12px] text-zinc-600">
                      {o.author}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-8 font-serif text-[14px] leading-7 text-zinc-700">
                Tekstlige objekter publiseres fortløpende. Forklarende kontekst kan forekomme. Det er ikke et krav.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
