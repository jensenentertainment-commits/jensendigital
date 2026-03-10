import { artists, releases } from "@/lib/elephant";

type Props = { params: { artist: string } };

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function Page({ params }: Props) {
  const key = params.artist as keyof typeof artists;
  const artist = artists[key];

  if (!artist) {
    return (
      <main className="min-h-screen bg-[#f3f4f6]">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            Ukjent artist.
          </div>
          <div className="mt-8">
            <a className="text-sm text-black/60 hover:text-black/90" href="/elephant">
              ← Tilbake
            </a>
          </div>
        </div>
      </main>
    );
  }

  const mine = releases
    .filter((r) => r.artist === key)
    .slice()
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wide text-black/50">Artist</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black/90">
            {artist.name}
          </h1>
          <p className="mt-2 text-sm text-black/60">{artist.blurb}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs text-black/70">
              Spotify: kommer
            </span>
            <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs text-black/70">
              Apple Music: kommer
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 p-4 text-xs uppercase tracking-wide text-black/50">
            Diskografi
          </div>
          <div className="divide-y divide-black/10">
            {mine.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm font-semibold text-black/90">{r.title}</div>
                  <div className="text-xs text-black/55">{fmtDate(r.releaseDate)}</div>
                </div>
                <div className="mt-1 text-xs text-black/55">
                  {r.type} • Status: {r.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex gap-4">
          <a className="text-sm text-black/60 hover:text-black/90" href="/elephant">
            ← Elephant Records
          </a>
          <a className="text-sm text-black/60 hover:text-black/90" href="/elephant/internt">
            Intern visning →
          </a>
        </div>
      </div>
    </main>
  );
}
