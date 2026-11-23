import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { MotionCanvas } from "@/components/MotionCanvas";
import { DEFAULT_CONFIG, SHOWCASE_PRESETS } from "@/lib/presets";

export default function HomePage() {
  const featuredPresets = SHOWCASE_PRESETS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero with adt-design atmosphere + 64px architectural grid */}
        <section className="hero-atmosphere relative overflow-hidden">
          <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-60" />

          <div className="relative mx-auto max-w-5xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20 lg:px-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C2410C]/30 bg-[#C2410C]/10 px-4 py-1.5 font-mono text-[11px] font-medium tracking-wider text-[#C2410C] uppercase dark:border-[#FF6D29]/30 dark:bg-[#FF6D29]/10 dark:text-[#FF6D29]">
              SVG to motion, no timeline required
            </span>

            <h1 className="mt-6 pb-1 font-display text-4xl leading-[1.06] font-extrabold tracking-tighter sm:text-6xl xl:text-[62px]">
              Turn typography{" "}
              <span className="text-[#C2410C] dark:text-[#FF6D29]">
                into motion.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[54ch] text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Upload an outlined SVG mark or type with curated fonts — pick a
              motion template, tune speed, stagger, and intensity, and export as
              WebM or GIF in seconds.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/editor"
                className="btn-tactile rounded-full bg-[#C2410C] px-7 py-3.5 font-display text-sm font-bold text-white shadow-lg hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
              >
                Try It Free
              </Link>
              <a
                href="#showcase"
                className="btn-tactile rounded-full border border-black/10 bg-black/5 px-7 py-3.5 font-display text-sm font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                See Examples
              </a>
            </div>

            <p className="mt-5 font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
              free to try — no sign up required — export in seconds
            </p>
          </div>
        </section>

        {/* Live Editor Preview Bento Card */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-10">
          <div className="bento-card overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-3 font-mono text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                <span className="ml-2">adt-motion / editor</span>
              </div>
              <span className="rounded-xl bg-[#C2410C]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                v1 / live preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="border-b border-[var(--border-subtle)] p-5 md:col-span-7 md:border-r md:border-b-0">
                <div className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
                  <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                    01 · Preview
                  </span>
                  <span>1:1 Canvas</span>
                </div>
                <div className="flex aspect-square max-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#161316]">
                  <MotionCanvas
                    config={{
                      ...DEFAULT_CONFIG,
                      bgColor: "#161316",
                      color: "#F5F6F8",
                    }}
                    isPlaying={true}
                    className="h-full w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 md:col-span-5">
                <div>
                  <div className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
                    <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                      03 · Controls
                    </span>
                    <span>Real-time</span>
                  </div>
                  <div className="space-y-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] uppercase">
                        Speed
                      </span>
                      <span className="font-medium text-[var(--text-main)]">
                        1.0×
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
                      <div className="h-1.5 w-1/3 rounded-full bg-[#C2410C] dark:bg-[#FF6D29]" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[var(--text-muted)] uppercase">
                        Stagger
                      </span>
                      <span className="font-medium text-[var(--text-main)]">
                        40ms
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
                      <div className="h-1.5 w-1/4 rounded-full bg-[#C2410C] dark:bg-[#FF6D29]" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[var(--text-muted)] uppercase">
                        Intensity
                      </span>
                      <span className="font-medium text-[var(--text-main)]">
                        100%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
                      <div className="h-1.5 w-1/2 rounded-full bg-[#C2410C] dark:bg-[#FF6D29]" />
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                      <span className="text-[var(--text-muted)] uppercase">
                        03A Circle Detail
                      </span>
                      <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                        185px
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/editor"
                  className="btn-tactile mt-5 block rounded-full bg-[#C2410C] py-3 text-center font-display text-xs font-bold tracking-wide text-white shadow-md hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
                >
                  Open Interactive Editor →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section
          id="showcase"
          className="border-t border-[var(--border-subtle)] py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
                  made with adt motion
                </p>
                <h2 className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight sm:text-5xl">
                  Real-time presets, ready to export.
                </h2>
              </div>
              <Link
                href="/showcase"
                className="btn-tactile inline-block self-start rounded-full border border-black/10 bg-black/5 px-6 py-2.5 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
              >
                See Full Showcase
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPresets.map((preset) => (
                <ShowcaseCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
              how it works
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight sm:text-5xl">
              From static to moving in three steps.
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="bento-card rounded-2xl p-7">
                <span className="inline-block rounded-xl bg-[#C2410C]/15 px-3 py-1 font-mono text-xs font-semibold text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  01
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                  Start with your text
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Type any headline or upload an SVG logo mark. Pick from
                  curated display, serif, and monospace fonts.
                </p>
              </div>
              <div className="bento-card rounded-2xl p-7">
                <span className="inline-block rounded-xl bg-[#C2410C]/15 px-3 py-1 font-mono text-xs font-semibold text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  02
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                  Pick a motion
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Choose Circle Orbit, Kinetic Wave, Stagger Rise, Elastic Pop,
                  or Split Ribbon—then fine-tune speed and stagger.
                </p>
              </div>
              <div className="bento-card rounded-2xl p-7">
                <span className="inline-block rounded-xl bg-[#C2410C]/15 px-3 py-1 font-mono text-xs font-semibold text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
                  03
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                  Export in seconds
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Render a seamless loop directly in your browser as a WebM
                  video or animated GIF—ready for web, decks, or socials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built For */}
        <section className="border-t border-[var(--border-subtle)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
              built for
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight sm:text-5xl">
              Wherever your type needs to move.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="bento-card rounded-2xl bg-gradient-to-br from-[#C2410C]/[0.07] via-transparent to-transparent p-7 dark:from-[#FF6D29]/[0.07]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] font-display text-base font-bold text-[#C2410C] dark:text-[#FF6D29]">
                  Aa
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                  Designers
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Prototype kinetic hero headers, case study cards, and visual
                  identities without opening keyframe timelines.
                </p>
              </div>
              <div className="bento-card rounded-2xl p-7">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm text-[#C2410C] dark:text-[#FF6D29]">
                  ▶
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                  Content creators
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Generate crisp 9:16, 4:5, or 1:1 typographic stickers and
                  title loops for Reels, Shorts, and threads.
                </p>
              </div>
              <div className="bento-card rounded-2xl p-7">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm text-[#C2410C] dark:text-[#FF6D29]">
                  ◆
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                  Brand &amp; logo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Bring static SVG marks to life with deterministic loop motion
                  and transparent backgrounds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-[var(--border-subtle)] py-20 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
              get started
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Your type, in motion.
            </h2>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Jump straight into the editor—everything runs locally in your
              browser.
            </p>
            <Link
              href="/editor"
              className="btn-tactile mt-8 inline-block rounded-full bg-[#C2410C] px-8 py-4 font-display text-sm font-bold text-white shadow-lg hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              Launch ADT Motion Editor
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 font-mono text-xs text-[var(--text-muted)] sm:flex-row sm:px-6 lg:px-10">
          <span>ADT Motion © 2026</span>
          <span>
            Part of{" "}
            <a
              href="https://adt-design.vercel.app/index.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#C2410C] hover:underline dark:text-[#FF6D29]"
            >
              ADT Design
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
