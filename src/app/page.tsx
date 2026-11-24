import Link from "next/link";
import { Layers, Move, Image as ImageIcon, Download, Sparkles, ArrowRight } from "lucide-react";
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
        {/* 2-Column Bento Hero (Distinct ADT Design Architecture) */}
        <section className="hero-atmosphere relative overflow-hidden">
          <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-50" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-20 lg:pb-24">
            {/* Left: Original ADT Positioning */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C2410C]/30 bg-[#C2410C]/10 px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wider text-[#C2410C] uppercase dark:border-[#FF6D29]/30 dark:bg-[#FF6D29]/10 dark:text-[#FF6D29]">
                <Sparkles className="h-3.5 w-3.5" />
                Browser-Native Motion Lab
              </span>

              <h1 className="mt-5 font-display text-4xl leading-[1.04] font-extrabold tracking-tighter sm:text-6xl xl:text-[64px]">
                Kinetic type &amp; layered motion,{" "}
                <span className="text-[#C2410C] dark:text-[#FF6D29]">
                  built for speed.
                </span>
              </h1>

              <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                Stack multiple typography or SVG layers on one canvas, drag them
                into place, drop in your own background image, and render crisp
                WebM, MP4, or GIF loops locally—no heavy desktop suite needed.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/editor"
                  className="btn-tactile inline-flex items-center gap-2 rounded-full bg-[#C2410C] px-7 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
                >
                  Open Motion Studio
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#recipes"
                  className="btn-tactile rounded-full border border-black/10 bg-black/5 px-6 py-3.5 font-display text-sm font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Browse Recipes
                </a>
              </div>

              {/* Compact capability metrics strip */}
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-6">
                <div>
                  <p className="font-display text-2xl font-extrabold text-[var(--text-main)]">
                    37
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">
                    Motion styles
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-[var(--text-main)]">
                    Multi
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">
                    Layer canvas
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-[var(--text-main)]">
                    4K
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">
                    Local render
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live Multi-Layer Stage Tile */}
            <div className="lg:col-span-5">
              <div className="bento-card overflow-hidden rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    Live Multi-Layer Stage
                  </span>
                  <span className="rounded-full bg-[#C2410C]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                    2 Layers Active
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
                    Orbital Ring + Sine Ribbon
                  </span>
                  <Link
                    href="/editor"
                    className="font-display text-xs font-bold text-[#C2410C] hover:underline dark:text-[#FF6D29]"
                  >
                    Customize →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unique ADT Motion Capabilities Bento Grid */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
                Studio Capabilities
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
                Designed like a miniature motion workstation.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="bento-card rounded-2xl bg-gradient-to-br from-[#C2410C]/[0.07] via-transparent to-transparent p-6 dark:from-[#FF6D29]/[0.07]">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C]/15 text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  Multi-Layer Scenes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Combine headlines, orbital stamps, and SVG marks simultaneously
                  in one unified composition.
                </p>
              </div>

              <div className="bento-card rounded-2xl p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C]/15 text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  <Move className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  Direct Canvas Drag
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Grab any active layer straight on the preview canvas to compose
                  asymmetric layouts visually.
                </p>
              </div>

              <div className="bento-card rounded-2xl p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C]/15 text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  Custom Backgrounds
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Upload your own photography or brand textures behind animated
                  typography with auto cover-fit.
                </p>
              </div>

              <div className="bento-card rounded-2xl p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C]/15 text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  Client-Side Render
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Export transparent GIFs or up to 4K 60fps WebM/MP4 clips
                  directly from your browser—zero waitlists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built-in Recipes Gallery */}
        <section
          id="recipes"
          className="border-t border-[var(--border-subtle)] py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
                  Starter Recipes
                </p>
                <h2 className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight sm:text-5xl">
                  Pick a look and remix it live.
                </h2>
              </div>
              <Link
                href="/showcase"
                className="btn-tactile inline-block self-start rounded-full border border-black/10 bg-black/5 px-6 py-2.5 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                Explore All Recipes
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPresets.map((preset) => (
                <ShowcaseCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </section>

        {/* Bento CTA Banner */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
          <div className="bento-card flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-r from-[#C2410C]/[0.1] via-transparent to-transparent p-8 sm:flex-row sm:items-center sm:p-12 dark:from-[#FF6D29]/[0.12]">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
                ADT Motion Studio
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to animate your next visual?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
                Launch the studio immediately—14 curated fonts, 37 motion
                styles, and instant local export.
              </p>
            </div>
            <Link
              href="/editor"
              className="btn-tactile shrink-0 rounded-full bg-[#C2410C] px-7 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              Launch Studio →
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
