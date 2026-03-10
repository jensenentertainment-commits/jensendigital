// app/internt/multiplum/utgivelser/[slug]/[chapter]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";

type Footnote = {
  id: string; // e.g. "fn-1"
  label: string; // e.g. "1"
  text: string;
  relatedHref?: string;
};

type ChapterContent = {
  slug: string;
  title: string;
  archiveCode: string;
  paragraphs: Array<{
    type: "p" | "quote" | "meta";
    text: string;
    footnoteRefs?: string[];
    linkify?: Array<{ label: string; href: string }>;
  }>;
  footnotes?: Footnote[];
};

type Work = {
  slug: string;
  title: string;
  author: string;
  archiveCode: string;
  cover?: string;
  chapters: ChapterContent[];
};

const works: Work[] = [
  {
    slug: "bok-for-bokas-skyld",
    title: "Bok for bokas skyld",
    author: "Margrete Vollan",
    archiveCode: "MV-BFBS-I",
    cover: "/covers/multiplum/bok-for-bokas-skyld.png",
    chapters: [
      {
        slug: "innledning",
        title: "I. Innledning (uten innledning)",
        archiveCode: "MV-BFBS-I.1",
        paragraphs: [
          { type: "p", text: "Dette er ikke en innledning." },
          { type: "p", text: "Den er plassert her fordi noe må stå først.", footnoteRefs: ["fn-1"] },
          { type: "p", text: "Teksten begynner der den allerede er." },
          { type: "quote", text: "Noe kan være skrevet uten å være ment.", footnoteRefs: ["fn-2"] },
          {
            type: "p",
            text: "Videre lesning kan foregå uten at lesningen fører til noe.",
            linkify: [{ label: "Referat uten sak", href: "/internt/multiplum/utgivelser/referat-uten-sak/tekst" }],
          },
        ],
        footnotes: [
          { id: "fn-1", label: "1", text: "Førsteplassering er en struktur, ikke en begrunnelse." },
          { id: "fn-2", label: "2", text: "Formuleringen er registrert i arkivet uten videre kommentar." },
        ],
      },
      {
        slug: "liste",
        title: "II. Liste",
        archiveCode: "MV-BFBS-I.2",
        paragraphs: [
          { type: "p", text: "1. Et punkt." },
          { type: "p", text: "2. Et punkt til." },
          { type: "p", text: "3. En avbrutt presisering." },
          { type: "p", text: "4. En ting som ikke trengte å stå her." },
          { type: "p", text: "5. Dette kunne vært en oppsummering. Det er det ikke." },
        ],
        footnotes: [{ id: "fn-1", label: "1", text: "Listen er ikke fullstendig. Den er ferdig." }],
      },
      {
        slug: "referat",
        title: "III. Referat",
        archiveCode: "MV-BFBS-I.3",
        paragraphs: [
          { type: "meta", text: "Møtet ble avholdt." },
          { type: "meta", text: "Saksliste forelå ikke." },
          { type: "meta", text: "Det ble tatt til orientering at orientering fant sted." },
          { type: "meta", text: "Vedtak: Ingen." },
        ],
      },
      {
        slug: "oppskrift",
        title: "IV. Oppskrift",
        archiveCode: "MV-BFBS-I.4",
        paragraphs: [
          { type: "p", text: "Bland det med det andre." },
          { type: "p", text: "La det stå til det ikke lenger står." },
          { type: "p", text: "Tilsett mer av det som mangler." },
          { type: "p", text: "Server uten å vise hva det er." },
        ],
        footnotes: [{ id: "fn-1", label: "1", text: "Oppskriften viser ikke til noen rett. Det er ikke en feil." }],
      },
      {
        slug: "tekst-uten-funksjon",
        title: "V. Tekst uten funksjon",
        archiveCode: "MV-BFBS-I.5",
        paragraphs: [
          { type: "p", text: "Den gjør ingenting." },
          { type: "p", text: "Den får likevel stå." },
          { type: "p", text: "Det finnes ingen oppgave som løses ved at den leses." },
          { type: "p", text: "Likevel er den en del av helheten, fordi helheten er registrert." },
        ],
      },
    ],
  },

  {
    slug: "referat-uten-sak",
    title: "Referat uten sak",
    author: "Tomasz Linder",
    archiveCode: "TL-OBJ-RUS",
    chapters: [
      {
        slug: "tekst",
        title: "Tekst",
        archiveCode: "TL-OBJ-RUS.1",
        paragraphs: [
          { type: "meta", text: "Møtet ble avholdt." },
          { type: "meta", text: "Saksliste forelå ikke." },
          { type: "meta", text: "Vedtak: Ingen." },
          { type: "meta", text: "Merknad: Referat kan ikke brukes som referat." },
        ],
      },
    ],
  },
];

function getPrevNext(work: Work, chapterSlug: string) {
  const idx = work.chapters.findIndex((c) => c.slug === chapterSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? work.chapters[idx - 1] : null,
    next: idx < work.chapters.length - 1 ? work.chapters[idx + 1] : null,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;

  const work = works.find((w) => w.slug === slug);
  if (!work) return notFound();

  const ch = work.chapters.find((c) => c.slug === chapter);
  if (!ch) return notFound();

  const { prev, next } = getPrevNext(work, chapter);

  return (
    <main className="min-h-screen text-zinc-900 bg-[#fbfaf7]">
      {/* subtil vignett */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.55] [background:radial-gradient(900px_600px_at_50%_0%,rgba(0,0,0,0.035),transparent_65%)]" />
      {/* subtil grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(#000_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 backdrop-blur-[1px] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-12 sm:px-12 sm:py-14">
            {/* breadcrumb + innhold-link */}
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <Link
                  href="/internt/multiplum"
                  className="text-[11px] tracking-[0.22em] text-zinc-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                >
                  MULTIPLUM
                </Link>

                <span className="text-[11px] tracking-[0.22em] text-zinc-400">/</span>

                <Link
                  href={`/internt/multiplum/utgivelser/${work.slug}`}
                  className="text-[11px] tracking-[0.22em] text-zinc-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                >
                  {work.title}
                </Link>

                <span className="text-[11px] tracking-[0.22em] text-zinc-400">/</span>

                <span className="text-[11px] tracking-[0.22em] text-zinc-600">
                  {ch.title}
                </span>
              </div>

              <Link
                href={`/internt/multiplum/utgivelser/${work.slug}`}
                className="text-[11px] tracking-[0.22em] text-zinc-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
              >
                INNHOLD
              </Link>
            </div>

            {/* header */}
            <header className="mt-10">
              <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{ch.title}</h1>
              <p className="mt-3 text-[14px] text-zinc-700">{work.author}</p>
            </header>

            {/* lesemodus: tekst + marg */}
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]">
              {/* tekstkolonne */}
              <section className="min-w-0">
                <div className="space-y-6">
                  {ch.paragraphs.map((p, idx) => {
                    const isMeta = p.type === "meta";
                    const isQuote = p.type === "quote";

                    return (
                      <div
                        key={idx}
                        className={[
                          isMeta
                            ? "text-[13px] tracking-wide text-zinc-700 leading-7"
                            : "font-serif text-[17px] leading-9 text-zinc-800",
                          isQuote ? "border-l border-zinc-200 pl-5 italic" : "",
                        ].join(" ")}
                      >
                        <span>{p.text}</span>

                        {/* restrained hypertext */}
                        {p.linkify?.length ? (
                          <span className="ml-2">
                            {p.linkify.map((l) => (
                              <Link
                                key={l.href}
                                href={l.href}
                                className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                              >
                                {l.label}
                              </Link>
                            ))}
                          </span>
                        ) : null}

                        {/* footnote refs */}
                        {p.footnoteRefs?.length ? (
                          <span className="ml-2 align-super text-[11px] tracking-wide text-zinc-600">
                            {p.footnoteRefs.map((id) => {
                              const fn = ch.footnotes?.find((f) => f.id === id);
                              const label = fn?.label ?? "?";
                              return (
                                <Link
                                  key={id}
                                  href={`#${id}`}
                                  className="ml-1 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                                  title="Fotnote"
                                >
                                  {label}
                                </Link>
                              );
                            })}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* footnotes */}
                {ch.footnotes?.length ? (
                  <section className="mt-16 border-t border-zinc-200/70 pt-8">
                    <h2 className="font-serif text-lg">Fotnoter</h2>

                    <ol className="mt-6 space-y-4">
                      {ch.footnotes.map((fn) => (
                        <li key={fn.id} id={fn.id} className="scroll-mt-24">
                          <div className="flex gap-3">
                            <div className="shrink-0 text-[12px] tracking-wide text-zinc-600">
                              {fn.label}.
                            </div>
                            <div className="font-serif text-[15px] leading-7 text-zinc-700">
                              {fn.text}{" "}
                              {fn.relatedHref ? (
                                <Link
                                  href={fn.relatedHref}
                                  className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                                >
                                  (åpne)
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {/* prev/next */}
                <nav className="mt-16 border-t border-zinc-200/70 pt-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {prev ? (
                        <Link
                          href={`/internt/multiplum/utgivelser/${work.slug}/${prev.slug}`}
                          className="font-serif text-[15px] underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                        >
                          ← {prev.title}
                        </Link>
                      ) : (
                        <span className="text-[12px] tracking-wide text-zinc-500">Ingen forrige</span>
                      )}
                    </div>

                    <div>
                      {next ? (
                        <Link
                          href={`/internt/multiplum/utgivelser/${work.slug}/${next.slug}`}
                          className="font-serif text-[15px] underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                        >
                          {next.title} →
                        </Link>
                      ) : (
                        <span className="text-[12px] tracking-wide text-zinc-500">Ingen neste</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-8 text-[11px] tracking-[0.22em] text-zinc-600">
                    INTERN EKSTERN AVDELING · SYSTEMSENTRALEN
                  </p>
                </nav>
              </section>

              {/* marg/sidekolonne */}
              <aside className="hidden lg:block border-l border-zinc-200/70 pl-6">
                <div className="text-[11px] tracking-[0.22em] text-zinc-500">
                  ARKIVKODE
                </div>
                <div className="mt-2 font-serif text-[14px] text-zinc-700">
                  {ch.archiveCode}
                </div>

                <div className="mt-10">
                  <div className="text-[11px] tracking-[0.22em] text-zinc-500">
                    NAVIGASJON
                  </div>
                  <div className="mt-4 space-y-2 text-[12px] text-zinc-700">
                    <Link
                      className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                      href={`/internt/multiplum/utgivelser/${work.slug}`}
                    >
                      Innhold
                    </Link>

                    {prev ? (
                      <Link
                        className="block underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                        href={`/internt/multiplum/utgivelser/${work.slug}/${prev.slug}`}
                      >
                        ← Forrige
                      </Link>
                    ) : null}

                    {next ? (
                      <Link
                        className="block underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                        href={`/internt/multiplum/utgivelser/${work.slug}/${next.slug}`}
                      >
                        Neste →
                      </Link>
                    ) : null}
                  </div>
                </div>

                {work.cover ? (
                  <div className="mt-12">
                    <div className="text-[11px] tracking-[0.22em] text-zinc-500">
                      OMSLAG
                    </div>
                    <div className="mt-4 w-full overflow-hidden border border-zinc-200 bg-zinc-50 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
                      <img
                        src={work.cover}
                        alt={`${work.title} omslag`}
                        className="h-full w-full object-cover grayscale opacity-90"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-3 text-[11px] tracking-[0.22em] text-zinc-600">
                      Va/Vis
                    </p>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
