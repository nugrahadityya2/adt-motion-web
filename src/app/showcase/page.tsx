"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { SHOWCASE_PRESETS } from "@/lib/presets";

const CATEGORIES = [
  "All",
  "Logo motion",
  "Web portfolio",
  "Social media",
  "Circular & kinetic",
] as const;

export default function ShowcasePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  const filtered =
    selectedCategory === "All"
      ? SHOWCASE_PRESETS
      : SHOWCASE_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F3EE] text-[#141413]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-[#D4CFC4] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#5C5A54] uppercase">
              showcase gallery
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              Motion templates in action.
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-[#5C5A54]">
              Every example below is rendered live on HTML5 Canvas. Click{" "}
              <strong className="text-[#141413]">Edit</strong> on any card to
              customize the text, font, colors, or export it as WebM or GIF.
            </p>
          </div>
          <Link
            href="/editor"
            className="inline-block self-start border border-[#141413] bg-[#141413] px-5 py-2.5 text-xs font-medium tracking-widest text-[#F5F3EE] uppercase transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]"
          >
            Start From Scratch
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter presets by category">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`border px-3.5 py-2 text-[11px] font-medium tracking-wider uppercase transition-colors ${
                  active
                    ? "border-[#141413] bg-[#141413] text-[#F5F3EE]"
                    : "border-[#D4CFC4] bg-[#FAF9F6] text-[#141413] hover:border-[#141413]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((preset) => (
            <ShowcaseCard key={preset.id} preset={preset} />
          ))}
        </div>
      </main>
    </div>
  );
}
