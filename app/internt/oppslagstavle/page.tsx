"use client";

import { useEffect, useMemo, useState } from "react";

type ModuleKey = "styret" | "drift" | "felles" | "til_orientering";

type ModuleDef = {
  key: ModuleKey;
  title: string;
  subtitle: string;
  stripe: string; // CSS color
  items: string[];
  rotateEveryMs: number;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateTime(d: Date) {
  // dd.mm.yyyy hh:mm
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export default function Page() {
  const modules = useMemo<ModuleDef[]>(
    () => [
      {
        key: "styret",
        title: "STYRET",
        subtitle: "Referat / orientering",
        stripe: "#e11d48", // rose/red
        rotateEveryMs: 22000, // slower
        items: [
          "Styret minner om:\nTrappeoppgang skal holdes fri.\nGjelder ogsa korte perioder.",
          "Det henstilles til ro etter kl. 23.\nDette gjelder ogsa helg.",
          "Oppslag fjernes ved behov.\nDette anses som kjent.",
          "Det forutsettes at de fleste kjenner til dette.\nGjelder alle.",
        ],
      },
      {
        key: "drift",
        title: "DRIFT",
        subtitle: "Status / vedlikehold",
        stripe: "#f59e0b", // amber
        rotateEveryMs: 12000,
        items: [
          "Vann stenges.\nTidspunkt oppgis senere.",
          "Lys ved kjellertrapp flimrer.\nDet anses som kjent.",
          "Heisen kan stoppe.\nDet er meldt inn.",
          "Doren til bodrekke B henger.\nTrykk igjen.",
        ],
      },
      {
        key: "felles",
        title: "FELLES",
        subtitle: "Fellesrom / vaskeri",
        stripe: "#06b6d4", // cyan
        rotateEveryMs: 14000,
        items: [
          "Vennligst fjern lo.\nGjelder alle.",
          "Vaskeriet er ryddet.\nDet er uklart av hvem.",
          "Torketrommel 2 lager lyd igjen.\nDet antas at eier vet det.",
          "Noen har glemt toy.\nAntas at eier vet det.",
        ],
      },
      {
        key: "til_orientering",
        title: "TIL ORIENTERING",
        subtitle: "Lose notater",
        stripe: "#9ca3af", // gray
        rotateEveryMs: 11000,
        items: [
          "Dette ble tatt opp sist ogsa.",
          "Som nevnt.",
          "Det var flere igjen.",
          "Oppslaget fjernes ved behov.",
        ],
      },
    ],
    []
  );

  const [now, setNow] = useState(() => new Date());
  const [indexByKey, setIndexByKey] = useState<Record<ModuleKey, number>>({
    styret: 0,
    drift: 0,
    felles: 0,
    til_orientering: 0,
  });

  // clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // rotate each module independently
  useEffect(() => {
    const timers = modules.map((m) =>
      setInterval(() => {
        setIndexByKey((prev) => ({
          ...prev,
          [m.key]: prev[m.key] + 1,
        }));
      }, m.rotateEveryMs)
    );

    return () => timers.forEach(clearInterval);
  }, [modules]);

  // ---------- Visual constants (locked layout) ----------
  const SCREEN_W = 1080;
  const SCREEN_H = 660;

  return (
  <div
    className="relative min-h-screen overflow-hidden isolate"
    style={{
      // warmer painted wall vibe
      backgroundColor: "#80776c",
      backgroundImage:
        "radial-gradient(1200px circle at 50% 30%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 45%, rgba(0,0,0,0.25) 100%), radial-gradient(closest-side, rgba(0,0,0,0) 70%, rgba(0,0,0,0.18) 100%)",
    }}
  >
   
      {/* subtle wall noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.30) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-6 py-10">
        {/* OUTER BEZEL (simple, not over-styled) */}
        <div className="relative rounded-[28px] bg-neutral-900 p-2 ring-1 ring-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
          {/* subtle bezel bevel */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[30px]"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 45%, rgba(0,0,0,0.25))",
            }}
          />

          {/* INNER BEZEL */}
          <div className="relative rounded-[20px] bg-neutral-950 p-2 ring-1 ring-white/10">
            {/* SCREEN FRAME */}
            <div className="relative rounded-[18px] bg-neutral-800/25 p-2 ring-1 ring-white/10">
              {/* tiny dot */}
              <div className="pointer-events-none absolute left-1/2 -bottom-3 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/15" />

              {/* SCREEN */}
              <div
                
  className="relative overflow-hidden rounded-[14px] border border-black/10 bg-white"
  style={{
    width: "min(1080px, calc(100vw - 140px))",
    height: "auto",
    aspectRatio: "1080 / 660",
  }}
>

              
                {/* GLASS + LCD OVERLAY (NO tailwind arbitrary bg-[...]) */}
                <div className="pointer-events-none absolute inset-0">
                  {/* scanlines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      opacity: 0.035,
                      backgroundImage:
                        "linear-gradient(transparent 0, transparent 7px, rgba(0,0,0,0.12) 7px, rgba(0,0,0,0.12) 8px)",
                      backgroundSize: "100% 8px",
                    }}
                  />
                  {/* top-left glass highlight */}
                  <div className="absolute -left-10 -top-10 h-56 w-[70%] rotate-[-12deg] rounded-full bg-white/70 blur-3xl" />
                  {/* vignette */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0.12) 100%)",
                    }}
                  />
                </div>

                {/* LOCKED CANVAS */}
                <div className="relative h-full w-full p-5" style={{ backgroundColor: "#e9eaec" }}>
                  {/* HEADER */}
                  <div className="h-[86px] w-full rounded-[14px] border border-black/10 bg-white px-6 py-4 shadow-[0_6px_16px_rgba(0,0,0,0.10)]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[12px] font-medium tracking-wide text-neutral-500">
                          INFORMASJON
                        </div>
                        <div className="mt-1 text-[20px] font-semibold text-neutral-900">
                          Vestre Mellomlia Borettslag — Blokk 3, Oppgang B
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-medium tracking-wide text-neutral-500">
                          STATUS
                        </div>
                        <div className="mt-1 text-[16px] font-semibold text-neutral-900">
                          {formatDateTime(now)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GRID */}
                  <div className="mt-6 grid grid-cols-2 gap-5">
                    {/* LEFT COLUMN */}
                    <div className="grid grid-rows-[1fr_auto] gap-5">
                      {/* STYRET BIG */}
                      <ModuleCard
                        module={modules.find((m) => m.key === "styret")!}
                        text={pick(
                          modules.find((m) => m.key === "styret")!.items,
                          indexByKey.styret
                        )}
                        big
                      />

                      {/* LOGO / PANEL */}
                      <div className="relative overflow-hidden rounded-[16px] border border-black/10 bg-white/95 shadow-[0_6px_16px_rgba(0,0,0,0.10)]">
                        <div className="p-6">
                          <div className="text-[12px] font-medium text-neutral-500">
                            
                          </div>
                          <div className="mt-1 text-[22px] font-semibold text-neutral-900">
                            Vestre Mellomlia Borettslag
                          </div>

                          <div className="mt-4 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10 bg-white text-[13px] font-semibold text-neutral-900">
                              VM
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-neutral-900">
                                Intern informasjonsvisning
                              </div>
                              <div className="text-[12px] text-neutral-500">
                                Blokk 3 / Oppgang B
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex items-end justify-between text-[11px] text-neutral-500">
                            <div>Systemstatus: aktiv</div>
                            <div>Levert av SystemSentralen</div>
                          </div>
                        </div>

                        {/* soft panel highlight */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.50]"
                          style={{
                            backgroundImage:
                              "radial-gradient(900px circle at 30% 30%, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.00) 55%)",
                          }}
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="grid grid-rows-3 gap-5">
                      <ModuleCard
                        module={modules.find((m) => m.key === "drift")!}
                        text={pick(
                          modules.find((m) => m.key === "drift")!.items,
                          indexByKey.drift
                        )}
                      />
                      <ModuleCard
                        module={modules.find((m) => m.key === "felles")!}
                        text={pick(
                          modules.find((m) => m.key === "felles")!.items,
                          indexByKey.felles
                        )}
                      />
                      <ModuleCard
                        module={modules.find((m) => m.key === "til_orientering")!}
                        text={pick(
                          modules.find((m) => m.key === "til_orientering")!.items,
                          indexByKey.til_orientering
                        )}
                      />
                    </div>
                  </div>

                  {/* footer hint */}
                  <div className="mt-3 text-[11px] text-neutral-500">(Noe kan legges til.)</div>
                </div>
              </div>
            </div>
          </div>

          {/* small label under bezel */}
          <div className="pointer-events-none mt-3 flex items-center justify-center gap-2 text-[11px] tracking-[0.25em] text-white/75">
            <span className="inline-block h-1 w-1 rounded-full bg-white/75" />
            <span>TOSHURA</span>
            <span className="inline-block h-1 w-1 rounded-full bg-white/75" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  module,
  text,
  big = false,
}: {
  module: ModuleDef;
  text: string;
  big?: boolean;
}) {
  const lines = text.split("\n");

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[16px] border border-black/10 bg-white shadow-[0_6px_16px_rgba(0,0,0,0.10)]",
        big ? "min-h-[310px]" : "min-h-[140px]",
      ].join(" ")}
    >
      {/* top stripe */}
      <div className="h-[3px] w-full" style={{ backgroundColor: module.stripe }} />

      <div className={["p-6", big ? "pt-5" : "pt-5"].join(" ")}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[12px] font-medium tracking-wide text-neutral-500">
              {module.title}
            </div>
            <div className="text-[13px] text-neutral-600">{module.subtitle}</div>
          </div>

          <div className="mt-1 h-2 w-2 rounded-full bg-black/10" />
        </div>

        <div className={["mt-4 text-[15px] leading-6 text-neutral-900", big ? "max-w-[92%]" : ""].join(" ")}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-6 text-[11px] text-neutral-400">Intern visning</div>
      <div className="absolute bottom-4 right-6 text-[11px] tracking-wide text-neutral-400">
        {module.title}
      </div>

      {/* gentle corner shading */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(800px circle at 85% 15%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.00) 55%)",
        }}
      />
    </div>
  );
}
