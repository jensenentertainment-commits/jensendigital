// app/internt/multiplum/arkiv/[code]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";

type ArchiveRecord = {
  code: string;
  title: string;
  classification: "KATALOGFØRT" | "INTERN" | "BEGRENSET";
  access: "ÅPENT UTDRA" | "BEGRENSET" | "INTERN";
  note: string;
  related?: Array<{ label: string; href: string }>;
};

const records: ArchiveRecord[] = [
  {
    code: "MP/BK/BFBS/CAT",
    title: "Bok for bokas skyld (katalogpost)",
    classification: "KATALOGFØRT",
    access: "ÅPENT UTDRA",
    note: "Katalogposten beskriver verket uten å forklare det.",
    related: [
      { label: "Åpne verket", href: "/internt/multiplum/utgivelser/bok-for-bokas-skyld" },
    ],
  },
  {
    code: "MP/BK/BFBS/CH-01",
    title: "I. Innledning (uten innledning)",
    classification: "KATALOGFØRT",
    access: "ÅPENT UTDRA",
    note: "Kapittel er registrert som strukturmarkør.",
    related: [
      { label: "Åpne kapittel", href: "/internt/multiplum/utgivelser/bok-for-bokas-skyld/innledning" },
    ],
  },
  {
    code: "MP/OB/RUS/TX-01",
    title: "Referat uten sak (tekst)",
    classification: "KATALOGFØRT",
    access: "ÅPENT UTDRA",
    note: "Dokument uten saksliste. Bruksområde ikke angitt.",
    related: [
      { label: "Åpne tekst", href: "/internt/multiplum/utgivelser/referat-uten-sak/tekst" },
    ],
  },
];

function decodeCodeParam(codeParam: string) {
  try {
    return decodeURIComponent(codeParam);
  } catch {
    return codeParam;
  }
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decoded = decodeCodeParam(code);

  const record = records.find((r) => r.code === decoded);
  if (!record) return notFound();

  return (
    <main className="min-h-screen text-zinc-900 bg-[#fbfaf7]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.55] [background:radial-gradient(900px_600px_at_50%_0%,rgba(0,0,0,0.035),transparent_65%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:radial-gradient(#000_0.6px,transparent_0.6px)] [background-size:18px_18px]" />

      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 backdrop-blur-[1px] shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-12 sm:px-12 sm:py-14">
            <div className="flex items-baseline justify-between gap-6">
              <Link
                href="/internt/multiplum"
                className="text-[11px] tracking-[0.22em] text-zinc-600 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
              >
                MULTIPLUM
              </Link>

              <span className="text-[11px] tracking-[0.22em] text-zinc-600">
                ARKIV
              </span>
            </div>

            <h1 className="mt-10 font-serif text-3xl leading-tight sm:text-4xl">
              Arkivkort
            </h1>

            <p className="mt-6 text-[11px] tracking-[0.22em] text-zinc-600">
              {record.code}
            </p>

            <p className="mt-6 font-serif text-[16px] leading-8 text-zinc-800">
              {record.title}
            </p>

            <dl className="mt-12 grid gap-y-4 border-t border-zinc-200/70 pt-8">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr]">
                <dt className="text-[11px] tracking-[0.22em] text-zinc-500">KLASSIFISERING</dt>
                <dd className="font-serif text-[15px] text-zinc-700">{record.classification}</dd>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr]">
                <dt className="text-[11px] tracking-[0.22em] text-zinc-500">TILGANG</dt>
                <dd className="font-serif text-[15px] text-zinc-700">{record.access}</dd>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr]">
                <dt className="text-[11px] tracking-[0.22em] text-zinc-500">MERKNAD</dt>
                <dd className="font-serif text-[15px] leading-7 text-zinc-700">{record.note}</dd>
              </div>
            </dl>

            {record.related?.length ? (
              <div className="mt-12 border-t border-zinc-200/70 pt-8">
                <div className="text-[11px] tracking-[0.22em] text-zinc-500">RELATERTE</div>
                <ul className="mt-4 space-y-2 text-[14px] text-zinc-700">
                  {record.related.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-700"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
