"use client";

import { Geist } from "next/font/google";
import { useEffect } from "react";

const geist = Geist({ subsets: ["latin"] });

export default function Page() {
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      document.documentElement.style.setProperty("--x", String(x));
      document.documentElement.style.setProperty("--y", String(y));
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main
      className={`${geist.className} relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_calc(var(--x,0.5)*100%)_calc(var(--y,0.4)*100%),rgba(255,255,255,0.07),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(255,255,255,0.05),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20400%20400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

      <div className="relative flex min-h-screen flex-col">
        <section className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8 sm:py-20">
          <div className="w-full max-w-5xl text-center">
           
            <h1 className="group relative mx-auto text-[clamp(2.9rem,11vw,7.2rem)] font-medium leading-[0.92] tracking-[-0.065em]">
              <span className="relative z-10 transition duration-300 group-hover:[text-shadow:0_0_30px_rgba(255,255,255,0.14)]">
                Jensen Digital
              </span>

              <span className="pointer-events-none absolute left-0 top-0 z-0 opacity-0 text-cyan-300/35 transition duration-500 group-hover:translate-x-[-3px] group-hover:translate-y-[-1px] group-hover:opacity-100">
                Jensen Digital
              </span>

              <span className="pointer-events-none absolute left-0 top-0 z-0 opacity-0 text-fuchsia-400/30 transition duration-500 group-hover:translate-x-[3px] group-hover:translate-y-[1px] group-hover:opacity-100">
                Jensen Digital
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[42rem] text-sm leading-7 text-white/62 sm:text-base">
              Små systemer. Ingen nødvendige. Alle fungerer.
              <br className="hidden sm:block" /> Bygget, testet og satt i drift.
            </p>

            <p className="mx-auto mt-5 max-w-[34rem] text-xs leading-6 text-white/42 sm:text-sm">
              Ikke alle er nødvendige.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/systemsentralen"
                className="inline-flex min-w-[184px] items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.08] hover:text-white"
              >
                Gå Inn
              </a>

              
            </div>
          </div>
        </section>

        <footer className="relative border-t border-white/10 px-6 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 text-xs text-white/36">
            <div>Jensen Digital</div>
            <a
              href="mailto:post@jensendigital.no"
              className="text-white/64 transition hover:text-white"
            >
              post@jensendigital.no
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}