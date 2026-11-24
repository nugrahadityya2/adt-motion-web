import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { MotionCanvas } from "@/components/MotionCanvas";
import { DEFAULT_CONFIG, SHOWCASE_PRESETS } from "@/lib/presets";
import type { MotionLayer } from "@/lib/motion-engine";

const HERO_DEMO_LAYERS: MotionLayer[] = [
  {
    id: "hero-ring",
    name: "Orbital Ring",
    visible: true,
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT MOTION • KINETIC STUDIO",
      font: "JetBrains Mono",
      fontSize: 50,
      template: "circle",
      circleRadius: 235,
      color: "#94A3B8",
      bgColor: "#161316",
      speed: 0.75,
    },
  },
  {
    id: "hero-center",
    name: "Center Headline",
    visible: true,
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT\nLAB",
      font: "Outfit",
      fontWeight: "800",
      fontSize: 120,
      template: "wave",
      color: "#FF6D29",
      bgColor: "transparent",
      speed: 1.1,
      intensity: 90,
    },
  },
];

export default function HomePage() {
  const featuredPresets = SHOWCASE_PRESETS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      <SiteHeader />

      <main className="flex-1">
        {/* 2-Column Hero */}
        <section className="hero-atmosphere relative overflow-hidden">
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-20 lg:pb-24">
            <div className="lg:col-span-7">
              <h1 className="font-display text-4xl leading-[1.04] font-extrabold tracking-tighter sm:text-6xl xl:text-[64px]">
                Kinetic type and layered motion,{" "}
                <span className="text-[#C2410C] dark:text-[#FF6D29]">
                  right in your browser.
                </span>
              </h1>

              <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                Stack multiple typography or SVG layers on one canvas, drag them
                into position, place photos or video clips behind your text,
                sync motion to music BPM, and export WebM, MP4, GIF, or
                HTML/CSS locally.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/editor"
                  className="btn-tactile rounded-full bg-[#C2410C] px-7 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
                >
                  Open Motion Studio
                </Link>
                <a
                  href="#recipes"
                  className="btn-tactile rounded-full border border-black/10 bg-black/5 px-6 py-3.5 font-display text-sm font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  View Starter Recipes
                </a>
              </div>
            </div>

            {/* Live Multi-Layer Stage */}
            <div className="lg:col-span-5">
              <div className="bento-card overflow-hidden rounded-2xl shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    Live 2-layer canvas
                  </span>
                  <span className="font-mono text-[11px] font-medium text-[#C2410C] dark:text-[#FF6D29]">
                    Orbital Ring + Sine Ribbon
                  </span>
                </div>
                <div className="flex aspect-square w-full items-center justify-center bg-[#161316] p-4">
                  <MotionCanvas
                    config={HERO_DEMO_LAYERS[0].config}
                    layers={HERO_DEMO_LAYERS}
                    isPlaying={true}
                    className="h-full w-full"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-3">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    Runs locally on HTML5 Canvas
                  </span>
                  <Link
                    href="/editor"
                    className="font-display text-xs font-bold text-[#C2410C] hover:underline dark:text-[#FF6D29]"
                  >
                    Open in editor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Asymmetric Capabilities Breakdown (No uniform 4-card icon grid) */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
                Built for social videos, posters, and web embeds.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
                Most typography generators lock you to a single centered line on
                a flat color. ADT Motion gives you layer control, direct canvas
                placement, video backgrounds, and export formats that fit real
                production workflows.
              </p>
              <Link
                href="/editor"
                className="btn-tactile mt-6 inline-block rounded-full border border-black/10 bg-black/5 px-6 py-2.5 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                Start a new canvas
              </Link>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] lg:col-span-7">
              <div className="py-5">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Multi-layer scenes and direct canvas drag
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  Combine orbital rings, kinetic headlines, and SVG marks in one
                  frame. Drag any active layer directly on the canvas to compose
                  your layout without guessing coordinates.
                </p>
              </div>
              <div className="py-5">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Photo and video backgrounds with Reels/TikTok safe zones
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  Drop an image or MP4/WebM clip behind your typography, then
                  toggle Reels, TikTok, or Shorts safe-zone guides so your text
                  never collides with platform buttons.
                </p>
              </div>
              <div className="py-5">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  Music BPM sync and HTML/CSS code export
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  Match loop timing to your soundtrack with Tap Tempo or an
                  exact BPM value. Export up to 4K video, transparent GIF, or a
                  lightweight HTML/CSS snippet for Framer, Webflow, and Next.js.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Starter Recipes */}
        <section
          id="recipes"
          className="border-t border-[var(--border-subtle)] py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-3xl leading-none font-extrabold tracking-tight sm:text-5xl">
                  Starter recipes
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Click Edit on any recipe to load its font, colors, and motion
                  style directly in the studio.
                </p>
              </div>
              <Link
                href="/showcase"
                className="btn-tactile inline-block self-start rounded-full border border-black/10 bg-black/5 px-6 py-2.5 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                All recipes
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPresets.map((preset) => (
                <ShowcaseCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </section>

        {/* Closing Action Strip */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Ready to test your own headline or SVG?
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)]">
                14 fonts, 37 motion styles, video backgrounds, and local export.
              </p>
            </div>
            <Link
              href="/editor"
              className="btn-tactile shrink-0 rounded-full bg-[#C2410C] px-7 py-3.5 font-display text-sm font-bold text-white shadow-md hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              Launch Studio
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 font-mono text-xs text-[var(--text-muted)] sm:flex-row sm:px-6 lg:px-10">
          <span>ADT Motion © 2026</span>
          <span>
            Part of{" "}
            <span className="font-medium text-[#C2410C] dark:text-[#FF6D29]">
              ADT Design
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
