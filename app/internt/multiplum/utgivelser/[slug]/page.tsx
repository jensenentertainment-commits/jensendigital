// app/internt/multiplum/utgivelser/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";

type Chapter = {
  slug: string;
  title: string;
};

type Work = {
  slug: string;
  title: string;
  author: string;
  description?: string;
  archiveCode: string;
  cover?: string;
  chapters: Chapter[];
  related?: Array<{ slug: string; label: string }>;
};

const works: Work[] = [
  {
    slug: "bok-for-bokas-skyld",
    title: "Bok for bokas skyld",
    author: "Margrete Vollan",
    description: "Samling av selvstendige tekster uten narrativ progresjon.",
    archiveCode: "MV-BFBS-I",
    cover: "/covers/multiplum/bok-for-bokas-skyld.png",
    chapters: [
      { slug: "innledning", title: "I. Innledning (uten innledning)" },
      { slug: "liste", title: "II. Liste" },
      { slug: "referat", title: "III. Referat" },
      { slug: "oppskrift", title: "IV. Oppskrift" },
      { slug: "tekst-uten-funksjon", title: "V. Tekst uten funksjon" },
    ],
    related: [{ slug: "korreksjoner", label: "Korreksjoner" }],
  },
  {
    slug: "korreksjoner",
    title: "Korreksjoner",
    author: "Einar H. Selvik",
    description: "Tekster strukturert som rettelser uten original.",
    archiveCode: "EHS-KOR-I",
    cover: "/covers/multiplum/korreksjoner.png",
    chapters: [{ slug: "tekst", title: "Tekst" }],
    related: [{ slug: "bok-for-bokas-skyld", label: "Bok for bokas skyld" }],
  },
  {
    slug: "anmerkninger",
    title: "Anmerkninger",
    author: "Clara Weiss",
    description: "Kortprosa i randsonen av protokoll og notat.",
    archiveCode: "CW-ANM-I",
    cover: "/covers/multiplum/anmerkninger.png",
    chapters: [{ slug: "tekst", title: "Tekst" }],
    related: [{ slug: "korreksjoner", label: "Korreksjoner" }],
  },

  // “Tekstlige objekter” kan leve her også med ett kapittel
  {
    slug: "referat-uten-sak",
    title: "Referat uten sak",
    author: "Tomasz Linder",
    description: "Dokument uten saksliste.",
    archiveCode: "TL-OBJ-RUS",
    chapters: [{ slug: "tekst", title: "Tekst" }],
    related: [{ slug: "bok-for-bokas-skyld", label: "Bok for bokas skyld" }],
  },
];

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const work = works.find((w) => w.slug === slug);
  if (!work) return notFound();

  return (
    <main className="min-h-screen text-zinc-900 bg-[#fbfaf7]">
      {/* subtil vignett */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.55] [background:radial-gradient(900px_600px_at_50%_0%,rgba(0,0,0,0.035),transparent_65%)]" />
      {/* subtil grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(#000_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 backdrop-blur-[1px] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-12 sm:px-12 sm:py-14">
            {/* Top breadcrumb */}
            <div className="flex flex-wrap items-baseline gap-3">
              <Link
                href="/internt/multiplum"
                className="text-[11px] tracking-[0.22em] text-zinc-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
              >
                MULTIPLUM
              </Link>
              <span className="text-[11px] tracking-[0.22em] text-zinc-400">/</span>
              <span className="text-[11px] tracking-[0.22em] text-zinc-600">{work.title}</span>
            </div>

            {/* Header block */}
            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-[160px_1fr]">
              {/* Cover */}
              <div className="w-[160px]">
                <div className="aspect-[2/3] w-full overflow-hidden border border-zinc-200 bg-zinc-50 shadow-[0_8px_22px_rgba(0,0,0,0.05)]">
                  {work.cover ? (
                    <img
                      src={work.cover}
                      alt={`${work.title} omslag`}
                      className="h-full w-full object-cover grayscale opacity-90"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] tracking-[0.22em] text-zinc-500">
                      COVER
                    </div>
                  )}
                </div>

                <p className="mt-4 text-[11px] tracking-[0.22em] text-zinc-600">
                  Omslag: Va/Vis
                </p>
              </div>

              {/* Meta */}
              <div>
                <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
                  {work.title}
                </h1>

                <p className="mt-3 text-[14px] text-zinc-700">{work.author}</p>

                {work.description ? (
                  <p className="mt-6 max-w-prose font-serif text-[15px] leading-7 text-zinc-700">
                    {work.description}
                  </p>
                ) : null}

                <Link
  href={`/internt/multiplum/arkiv/${encodeURIComponent(work.archiveCode)}`}
  className="mt-6 inline-block text-[11px] tracking-[0.22em] text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
>
  ARKIVKODE · {work.archiveCode}
</Link>
              </div>
            </div>

            {/* Innhold */}
            <section className="mt-16">
              <h2 className="mb-6 font-serif text-xl tracking-wide">Innhold</h2>

              <ol className="space-y-4">
                {work.chapters.map((chapter) => (
                  <li key={chapter.slug} className="border-b border-zinc-200/60 pb-4">
                    <Link
                      href={`/internt/multiplum/utgivelser/${work.slug}/${chapter.slug}`}
                      className="font-serif text-[16px] leading-7 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                    >
                      {chapter.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {/* Relaterte */}
            {work.related?.length ? (
              <section className="mt-16 border-t border-zinc-200/70 pt-10">
                <h3 className="mb-4 font-serif text-lg">Relaterte verk</h3>

                <ul className="space-y-2 text-[14px] text-zinc-700">
                  {work.related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/internt/multiplum/utgivelser/${r.slug}`}
                        className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Footer line */}
            <div className="mt-14 border-t border-zinc-200/70 pt-8">
              <p className="text-[11px] tracking-[0.22em] text-zinc-600">
                INTERN EKSTERN AVDELING · SYSTEMSENTRALEN
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
