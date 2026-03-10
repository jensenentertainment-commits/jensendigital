"use client";

import React from "react";
import { useTransmission } from "@/lib/elephant/useTransmission";
import WaveVisualizer from "./WaveVisualizer";
import { useRouter } from "next/navigation";

const ER = { elephant: "#8dbb25", records: "#dd038d" };

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur">
      {children}
    </span>
  );
}

function ControlChip({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] uppercase tracking-widest text-white/65 backdrop-blur transition hover:bg-white/12"
    >
      {children}
    </button>
  );
}

export default function TransmissionClient() {
  const { audioRef, ui, actions } = useTransmission();
  const router = useRouter();

  const [level, setLevel] = React.useState(0.08);
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, audioRef]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [drift, setDrift] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const loop = () => {
      setDrift(Math.sin(Date.now() * 0.00028));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lvl = clamp01(level);

  const gA = 0.035 + lvl * 0.075;
  const pA = 0.03 + lvl * 0.065;

  const gSize = 28 + lvl * 18 + lvl * 6;
  const pSize = 26 + lvl * 16 + lvl * 6;

  const gX = 18 + drift * 2.2;
  const gY = 26 + drift * 1.6;
  const pX = 82 - drift * 2.0;
  const pY = 34 - drift * 1.2;

  const vinyl = mounted ? Math.sin(performance.now() * 0.00015) * 1.2 : 0;

  const bg = `
    radial-gradient(circle at ${gX}% ${gY}%, rgba(141,187,37,${gA}) 0%, transparent ${gSize}%),
    radial-gradient(circle at ${pX}% ${pY}%, rgba(221,3,141,${pA}) 0%, transparent ${pSize}%),
    linear-gradient(180deg, #0f1114, #07090b)
  `;

  const fg = "text-white";
  const titleKey = `${ui.now?.artist ?? ""}-${ui.now?.title ?? ""}`;

  const time = mounted ? performance.now() * 0.002 : 0;
  const chaseA = Math.sin(time * 0.8 + vinyl);
  const chaseB = Math.sin(time * 0.8 + 2.4 + vinyl);

  const dotAIntensity = clamp01(level * 0.85 + chaseA * 0.18);
  const dotBIntensity = clamp01(level * 0.85 + chaseB * 0.18);

  const progressGlow = 8 + lvl * 18;
  const progressOpacity = 0.85 + lvl * 0.15;
  const progressScaleY = 1 + lvl * 0.35;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: bg,
        filter: `hue-rotate(${vinyl}deg)`,
      }}
    >
      <audio ref={audioRef} preload="auto" />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="er-blob er-blob-a" />
        <div className="er-blob er-blob-b" />
        <div className="er-grain" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10">
        <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${fg}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: ER.elephant,
                  boxShadow: `
                    0 0 ${8 + dotAIntensity * 28}px rgba(141,187,37,${0.2 + dotAIntensity * 0.6}),
                    0 0 ${18 + dotAIntensity * 36}px rgba(141,187,37,${0.06 + dotAIntensity * 0.22})
                  `,
                  transform: `scale(${1 + dotAIntensity * 0.35})`,
                  opacity: 0.72 + dotAIntensity * 0.35,
                  transition: "all 140ms ease-out",
                }}
              />

              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: ER.records,
                  boxShadow: `
                    0 0 ${8 + dotBIntensity * 28}px rgba(221,3,141,${0.18 + dotBIntensity * 0.6}),
                    0 0 ${18 + dotBIntensity * 36}px rgba(221,3,141,${0.05 + dotBIntensity * 0.22})
                  `,
                  transform: `scale(${1 + dotBIntensity * 0.35})`,
                  opacity: 0.72 + dotBIntensity * 0.35,
                  transition: "all 140ms ease-out",
                }}
              />
            </div>

            <div className="text-[11px] uppercase tracking-[0.24em] opacity-60">
              Elephant Transmission
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill>Status: {ui.connected ? "ACTIVE" : "STANDBY"}</Pill>

            {ui.connected && (
              <>
                <ControlChip onClick={() => setMuted((m) => !m)}>
                  {muted ? "Unmute" : "Mute"}
                </ControlChip>

                <ControlChip onClick={() => router.push("/elephant")}>
                  Close
                </ControlChip>
              </>
            )}
          </div>
        </div>

        <div className={`mt-16 sm:mt-20 flex flex-1 flex-col items-center justify-center text-center ${fg}`}>
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">
            Continuous signal from Elephant Records
          </div>

          <h1
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ textShadow: "0 0 22px rgba(255,255,255,0.08)" }}
          >
            <span style={{ color: ER.elephant }}>ELEPHANT</span>{" "}
            <span style={{ color: ER.records }}>TRANSMISSION</span>
          </h1>

          {!ui.connected ? (
            <>
              <button
                onClick={actions.join}
                className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition-all duration-200 hover:translate-y-[-1px] hover:bg-white/14"
              >
                CONNECT <span className="opacity-40">▶</span>
              </button>

              <div className="mt-4 text-xs opacity-60">Signal: Standby</div>
            </>
          ) : (
            <>
              <div
                className="mt-8 w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur sm:p-7"
                style={{ boxShadow: "0 18px 48px rgba(0,0,0,0.36)" }}
              >
                <div className="mb-5 overflow-hidden rounded-2xl bg-white/10">
                  <div className="h-1 w-full bg-white/10" />
                  <div
                    className="h-1 origin-left -mt-1 rounded-full"
                    style={{
                      transform: `scaleX(${ui.progress01}) scaleY(${progressScaleY})`,
                      background: "linear-gradient(90deg, #8dbb25, #dd038d)",
                      opacity: progressOpacity,
                      boxShadow: `0 0 ${progressGlow}px rgba(141,187,37,0.30), 0 0 ${progressGlow}px rgba(221,3,141,0.22)`,
                      transition: "transform 180ms linear, opacity 180ms linear, box-shadow 180ms linear",
                    }}
                  />
                </div>

                <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                  NOW PLAYING
                </div>

                <div className="mt-2 min-h-[2.25rem] text-xl font-semibold tracking-tight">
                  <div key={titleKey} className="animate-[erFade_220ms_ease-out]">
                    {ui.now ? (
                      <>
                        {ui.now.artist} <span className="opacity-40">—</span> {ui.now.title}
                      </>
                    ) : (
                      <span className="opacity-60">…</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <WaveVisualizer
                    audioRef={audioRef}
                    mode={ui.mode}
                    onLevel={setLevel}
                  />
                </div>

                <div className="mt-5 text-[10px] uppercase tracking-[0.25em] opacity-60">
                  PREVIOUSLY
                </div>

                <div className="mt-2 min-h-[1.25rem] text-sm opacity-70">
                  <div
                    key={`${ui.previous?.artist ?? ""}-${ui.previous?.title ?? ""}`}
                    className="animate-[erFade_220ms_ease-out]"
                  >
                    {ui.previous ? (
                      <>
                        {ui.previous.artist} <span className="opacity-40">—</span> {ui.previous.title}
                      </>
                    ) : (
                      <span className="opacity-50">No prior signal.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 text-xs opacity-60">
                Transmitting from Elephant HQ.
              </div>
            </>
          )}
        </div>

        <div className={`mt-10 flex flex-col gap-2 text-xs ${fg} opacity-60 sm:flex-row sm:items-center sm:justify-between`}>
          <div>Signal routed via SystemSentralen.</div>
          <div>Archive: none</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes erFade {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}