"use client";

import React from "react";
import Link from "next/link";
import BackgroundField from "../components/BackgroundField";

const STATUS = [
  "node sync stable",
  "signal routing nominal",
  "external link handshake ok",
  "internal module standby",
  "ambient field stable",
  "index map aligned",
  "background processes idle",
] as const;

const TAB_STATUS = [
  "node stable",
  "modules synced",
  "routing nominal",
  "index aligned",
] as const;

export default function Page() {
  const local = [
    {
      name: "Lumeris",
      href: "/lumeris",
      dot: "#93c5fd",
      meta: "Digital ambience",
      live: true,
    },
    {
      name: "Elephant Records",
      href: "/elephant",
      dot: "#f472b6",
      meta: "Katalog og transmission",
      live: false,
    },
  ] as const;

  const external = [
    {
      name: "Phorium",
      href: "https://phorium.no",
      dot: "#22c55e",
      meta: "Tekstkontroll",
      external: true,
    },
    {
      name: "Nowheremap",
      href: "https://nowheremap.com",
      dot: "#cbd5e1",
      meta: "Autonom struktur",
      external: true,
    },
    {
      name: "Prishandel.no",
      href: "https://prishandel.no",
      dot: "#60a5fa",
      meta: "Eksternt prosjekt",
      external: true,
    },
    {
      name: "Turforventning.no",
      href: "https://turforventning.no",
      dot: "#94a3b8",
      meta: "Eksternt prosjekt",
      external: true,
    },
  ] as const;

  const [status, setStatus] = React.useState<string>(STATUS[0]);
  const [deepLayerOpen, setDeepLayerOpen] = React.useState(false);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const next = STATUS[Math.floor(Math.random() * STATUS.length)];
      setStatus(next);
    }, 25000 + Math.random() * 15000);

    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    console.log(
      "%cSystemSentralen",
      "font-size:16px;font-weight:600;color:#e2e8f0;"
    );
    console.log("%cnode online", "color:#94a3b8;");
    console.log("%cexternal modules connected", "color:#94a3b8;");
    console.log("%cinternal systems stable", "color:#94a3b8;");
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const baseTitle = "SystemSentralen";

    const id = window.setInterval(() => {
      const r = Math.random();

      if (r < 0.6) {
        document.title = baseTitle;
      } else {
        const msg = TAB_STATUS[Math.floor(Math.random() * TAB_STATUS.length)];
        document.title = `${baseTitle} • ${msg}`;
      }
    }, 40000 + Math.random() * 50000);

    return () => {
      window.clearInterval(id);
      document.title = baseTitle;
    };
  }, []);

  React.useEffect(() => {
    let buffer = "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;

      buffer = (buffer + e.key.toLowerCase()).slice(-2);

      if (buffer === "ss") {
        setDeepLayerOpen((prev) => !prev);
        buffer = "";
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white"
      style={{
        background:
          "radial-gradient(70% 55% at 50% 30%, rgba(255,255,255,0.035), transparent 72%), linear-gradient(180deg, #0a0a0a, #0d1116)",
      }}
    >
      <BackgroundField />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20400%20400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

      <div className="relative mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        <header className="pb-10 sm:pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/32 transition hover:text-white/50"
            style={{ textDecoration: "none" }}
          >
            <span>←</span>
            <span>Jensen Digital</span>
          </Link>

          <div className="mt-5 text-[11px] uppercase tracking-[0.28em] text-white/24">
            Sentralen
          </div>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
            Systemer, arbeid og forbindelser.
          </p>

          <div className="mt-8 h-px w-full bg-white/6" />
        </header>

        <Section title="Lokalt">
          <div className="space-y-3 sm:space-y-4">
            {local.map((item) => (
              <Row
                key={item.name}
                href={item.href}
                dot={item.dot}
                name={item.name}
                meta={item.meta}
                live={item.live}
              />
            ))}
          </div>
        </Section>

        <Section title="Eksternt">
          <div className="space-y-3 sm:space-y-4">
            {external.map((item) => (
              <Row
                key={item.name}
                href={item.href}
                dot={item.dot}
                name={item.name}
                meta={item.meta}
                external={item.external}
              />
            ))}
          </div>
        </Section>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/32">
          <span>Enkelte moduler er ikke navigert offentlig.</span>
          <a
            href="/internt/oppslagstavle"
            className="rounded-full border border-white/10 px-3 py-1 text-white/46 transition hover:border-white/16 hover:text-white/70"
            style={{ textDecoration: "none" }}
          >
            Oppslag
          </a>
        </div>

        <footer className="mt-14 border-t border-white/10 pt-6">
          <div className="text-xs text-white/30">
            Et nav for tilgang og oversikt.
          </div>

          <div className="mt-3 text-[11px] text-white/24">
            Kontakt:{" "}
            <a
              href="mailto:post@jensendigital.no"
              className="text-white/28 hover:text-white/50"
              style={{ textDecoration: "none" }}
            >
              post@jensendigital.no
            </a>
          </div>

          <div className="mt-3 flex items-center text-[11px] tracking-wide text-white/35">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
            {status}
          </div>
        </footer>
      </div>

      {deepLayerOpen ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-20 w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-white/10 bg-black/40 p-4 text-[11px] uppercase tracking-[0.18em] text-white/58 backdrop-blur sm:bottom-6 sm:right-6">
          <div className="mb-3 text-white/34">Deep layer</div>
          <div className="space-y-2 normal-case tracking-normal text-white/52">
            <div>SS-PORTAL/INT-01 → /internt/samtaler</div>
            <div>SS-BOARD/LOCAL → /internt/oppslagstavle</div>
            <div>Node status → stable</div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 sm:mt-14">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/52">
          {title}
        </div>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      {children}
    </section>
  );
}

function Row({
  href,
  dot,
  name,
  meta,
  external,
  live,
}: {
  href: string;
  dot: string;
  name: string;
  meta: string;
  external?: boolean;
  live?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.04] px-4 py-4 transition-all duration-200 hover:translate-y-[-2px] hover:border-white/12 hover:bg-white/[0.07] sm:px-5 sm:py-5"
      style={{
        textDecoration: "none",
        boxShadow: "0 8px 26px rgba(0,0,0,0.35)",
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Dot color={dot} live={live} />
          <div className="truncate text-sm font-medium text-white/88">
            {name}
          </div>
        </div>

        <div className="mt-1.5 pl-[22px] text-[11px] leading-relaxed text-white/34">
          {meta}
          {external ? " • åpnes i nytt vindu" : ""}
        </div>
      </div>

      <div className="ml-4 shrink-0 text-sm text-white/22 transition group-hover:translate-x-0.5 group-hover:text-white/40">
        {external ? "↗" : "→"}
      </div>
    </a>
  );
}

function Dot({
  color,
  live,
}: {
  color: string;
  live?: boolean;
}) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {live ? (
        <span
          className="absolute inset-0 rounded-full animate-ping [animation-duration:2.8s]"
          style={{
            background: color,
            opacity: 0.18,
          }}
        />
      ) : null}

      <span
        className="relative h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: live
            ? `0 0 0 2px rgba(0,0,0,0.18), 0 0 18px ${color}33`
            : "0 0 0 2px rgba(0,0,0,0.18)",
        }}
      />
    </span>
  );
}