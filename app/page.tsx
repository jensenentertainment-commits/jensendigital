"use client";

import { Geist } from "next/font/google";
import Link from "next/link";
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
      {/* soft spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_calc(var(--x,0.5)*100%)_calc(var(--y,0.4)*100%),rgba(255,255,255,0.07),transparent_34%)]" />

      {/* subtle ambient falloff */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(255,255,255,0.05),transparent_70%)]" />

      {/* grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%270%200%20400%20400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

      <div className="relative flex min-h-screen flex-col">
        <section className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8 sm:py-20">
          <div className="w-full max-w-4xl text-center">
            <h1 className="group relative mx-auto text-[clamp(2.6rem,11vw,7rem)] font-medium leading-[0.94] tracking-[-0.06em]">
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

            <p className="mx-auto mt-5 max-w-[28rem] text-[11px] uppercase tracking-[0.24em] text-white/52 sm:text-xs sm:tracking-[0.28em]">
              Creative systems, software and media
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
              <a
                href="mailto:post@jensendigital.no"
                className="inline-flex min-w-[168px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/78 transition hover:border-white/18 hover:bg-white/[0.06] hover:text-white"
              >
                Contact
              </a>

              <Link
                href="/systemsentralen"
                className="inline-flex min-w-[168px] items-center justify-center rounded-full border border-white/6 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/36 transition hover:border-white/12 hover:text-white/62"
              >
                Enter
              </Link>
            </div>
          </div>
        </section>

        <footer className="relative border-t border-white/10 px-6 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center text-center">
            <a
              href="mailto:post@jensendigital.no"
              className="text-sm text-white/72 transition hover:text-white"
            >
              post@jensendigital.no
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}