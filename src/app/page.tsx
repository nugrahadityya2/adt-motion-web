import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { MotionCanvas } from "@/components/MotionCanvas";
import { DEFAULT_CONFIG, SHOWCASE_PRESETS } from "@/lib/presets";

export default function HomePage() {
  const featuredPresets = SHOWCASE_PRESETS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F3EE] text-[#141413]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20">
          <p className="mb-5 text-[11px] font-medium tracking-[0.2em] text-[#5C5A54] uppercase">
            SVG to motion, no timeline required
          </p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-tight sm:text-7xl">
            Turn typography{" "}
            <span className="italic text-[#2563EB]">into motion.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#5C5A54]">
            Upload an outlined SVG mark or type with curated fonts — pick a
            motion template, tune speed, stagger, and intensity, and export as
            WebM or GIF in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/editor"
              className="border border-[#141413] bg-[#141413] px-7 py-3.5 text-xs font-medium tracking-widest text-[#F5F3EE] uppercase transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]"
            >
              Try It Free
            </Link>
            <a
              href="#showcase"
              className="border border-[#141413] bg-[#FAF9F6] px-7 py-3.5 text-xs font-medium tracking-widest text-[#141413] uppercase transition-colors hover:bg-[#141413] hover:text-[#F5F3EE]"
            >
              See Examples
            </a>
          </div>
          <p className="mt-4 text-[11px] tracking-wide text-[#5C5A54]">
            free to try — no sign up required — export in seconds
          </p>
        </section>

        {/* Live Editor Preview Mockup */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="border border-[#141413] bg-[#FAF9F6]">
            <div className="flex items-center justify-between border-b border-[#D4CFC4] px-4 py-2.5 text-[11px] text-[#5C5A54]">
              <span>preview</span>
              <span>typemotion / editor</span>
            </div>

            <div className="bg-[#2B2B29] p-4 sm:p-8">
              <div className="overflow-hidden rounded-lg border border-[#44423D] bg-[#F5F3EE] shadow-2xl">
                {/* Fake browser bar */}
                <div className="flex items-center justify-between border-b border-[#D4CFC4] bg-[#ECE9E2] px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D4CFC4]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D4CFC4]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D4CFC4]" />
                  </div>
                  <span className="border border-[#D4CFC4] bg-[#FAF9F6] px-3 py-0.5 text-[10px] text-[#5C5A54]">
                    localhost / editor
                  </span>
                  <span className="text-[10px] text-[#5C5A54]">v1 / mvp</span>
                </div>

                {/* Live miniature editor */}
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="border-b border-[#D4CFC4] p-4 md:col-span-7 md:border-r md:border-b-0">
                    <div className="mb-2 flex items-center justify-between text-[10px] tracking-widest text-[#5C5A54] uppercase">
                      <span>01</span>
                      <span>Preview</span>
                    </div>
                    <div className="flex aspect-square max-h-[340px] w-full items-center justify-center border border-[#D4CFC4] bg-white">
                      <MotionCanvas
                        config={DEFAULT_CONFIG}
                        isPlaying={true}
                        className="h-full w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 md:col-span-5">
                    <div>
                      <div className="mb-3 flex items-center justify-between text-[10px] tracking-widest text-[#5C5A54] uppercase">
                        <span>03</span>
                        <span>Controls</span>
                      </div>
                      <div className="space-y-3 border border-[#D4CFC4] bg-[#FAF9F6] p-3.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#5C5A54] uppercase">Speed</span>
                          <span className="font-medium text-[#141413]">1.0×</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-[#D4CFC4]">
                          <div className="h-1 w-1/3 rounded-full bg-[#2563EB]" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#5C5A54] uppercase">Stagger</span>
                          <span className="font-medium text-[#141413]">40ms</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-[#D4CFC4]">
                          <div className="h-1 w-1/4 rounded-full bg-[#2563EB]" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#5C5A54] uppercase">Intensity</span>
                          <span className="font-medium text-[#141413]">100%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-[#D4CFC4]">
                          <div className="h-1 w-1/2 rounded-full bg-[#2563EB]" />
                        </div>

                        <div className="flex items-center justify-between border-t border-[#D4CFC4] pt-3">
                          <span className="text-[#5C5A54] uppercase">03A Circle Detail</span>
                          <span className="text-[#2563EB]">185px</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/editor"
                      className="mt-4 block border border-[#141413] bg-[#141413] py-2.5 text-center text-[11px] font-medium tracking-widest text-[#F5F3EE] uppercase transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]"
                    >
                      Open Interactive Editor →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section
          id="showcase"
          className="border-t border-[#D4CFC4] bg-[#FAF9F6] py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] tracking-[0.2em] text-[#5C5A54] uppercase">
                  made with typemotion
                </p>
                <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                  Real-time presets, ready to export.
                </h2>
              </div>
              <Link
                href="/showcase"
                className="inline-block self-start border border-[#141413] bg-[#F5F3EE] px-5 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors hover:bg-[#141413] hover:text-[#F5F3EE]"
              >
                See Full Showcase
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPresets.map((preset) => (
                <ShowcaseCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-[#D4CFC4] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-[11px] tracking-[0.2em] text-[#5C5A54] uppercase">
              how it works
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              From static to moving in three steps.
            </h2>

            <div className="mt-12 grid grid-cols-1 border border-[#D4CFC4] bg-[#FAF9F6] md:grid-cols-3">
              <div className="border-b border-[#D4CFC4] p-7 md:border-r md:border-b-0">
                <span className="text-xs font-semibold text-[#2563EB]">01</span>
                <h3 className="mt-3 font-serif text-2xl">Start with your text</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Type any headline or upload an SVG logo mark. Pick from
                  curated serif, grotesk, and display fonts.
                </p>
              </div>
              <div className="border-b border-[#D4CFC4] p-7 md:border-r md:border-b-0">
                <span className="text-xs font-semibold text-[#2563EB]">02</span>
                <h3 className="mt-3 font-serif text-2xl">Pick a motion</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Choose Circle Orbit, Kinetic Wave, Stagger Rise, Elastic Pop,
                  or Split Ribbon—then fine-tune speed and stagger.
                </p>
              </div>
              <div className="p-7">
                <span className="text-xs font-semibold text-[#2563EB]">03</span>
                <h3 className="mt-3 font-serif text-2xl">Export in seconds</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Render a seamless loop directly in your browser as a WebM
                  video or animated GIF—ready for web, decks, or socials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built For */}
        <section className="border-t border-[#D4CFC4] bg-[#FAF9F6] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-[11px] tracking-[0.2em] text-[#5C5A54] uppercase">
              built for
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              Wherever your type needs to move.
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="border border-[#D4CFC4] bg-[#F5F3EE] p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center border border-[#141413] bg-white font-serif text-lg">
                  Aa
                </div>
                <h3 className="mt-5 font-serif text-2xl">Designers</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Prototype kinetic hero headers, case study cards, and visual
                  identities without opening keyframe timelines.
                </p>
              </div>
              <div className="border border-[#D4CFC4] bg-[#F5F3EE] p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center border border-[#141413] bg-white text-sm">
                  ▶
                </div>
                <h3 className="mt-5 font-serif text-2xl">Content creators</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Generate crisp 9:16, 4:5, or 1:1 typographic stickers and
                  title loops for Reels, Shorts, and threads.
                </p>
              </div>
              <div className="border border-[#D4CFC4] bg-[#F5F3EE] p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center border border-[#141413] bg-white text-sm">
                  ◆
                </div>
                <h3 className="mt-5 font-serif text-2xl">Brand &amp; logo</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5C5A54]">
                  Bring static SVG marks to life with deterministic loop motion
                  and transparent backgrounds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-[#D4CFC4] py-20 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <p className="text-[11px] tracking-[0.2em] text-[#5C5A54] uppercase">
              get started
            </p>
            <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">
              Your type, in motion.
            </h2>
            <p className="mt-4 text-xs text-[#5C5A54]">
              Jump straight into the editor—everything runs locally in your
              browser.
            </p>
            <Link
              href="/editor"
              className="mt-8 inline-block border border-[#141413] bg-[#141413] px-8 py-4 text-xs font-medium tracking-widest text-[#F5F3EE] uppercase transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]"
            >
              Launch Editor
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#D4CFC4] bg-[#FAF9F6] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-[#5C5A54] sm:flex-row sm:px-6">
          <span>TypeMotion Studio © 2026</span>
          <span>Built with Next.js + HTML5 Canvas + gifenc</span>
        </div>
      </footer>
    </div>
  );
}
