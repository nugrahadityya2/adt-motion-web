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
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-14 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-[var(--border-subtle)] pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#C2410C] uppercase dark:text-[#FF6D29]">
              showcase gallery
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Motion templates in action.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
              Every example below is rendered live on HTML5 Canvas. Click{" "}
              <strong className="text-[var(--text-main)]">Edit</strong> on any
              card to customize the text, font, colors, or export it as WebM or
              GIF.
            </p>
          </div>
          <Link
            href="/editor"
            className="btn-tactile inline-block self-start rounded-full bg-[#C2410C] px-6 py-3 font-display text-xs font-bold text-white shadow-md hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
          >
            Start From Scratch
          </Link>
        </div>

        {/* Category Filter */}
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter presets by category"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-tactile rounded-full border px-4 py-2 font-display text-xs font-semibold transition-colors ${
                  active
                    ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((preset) => (
            <ShowcaseCard key={preset.id} preset={preset} />
          ))}
        </div>
      </main>
    </div>
  );
}
