"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { MotionCanvas } from "./MotionCanvas";
import { MotionPreset, serializeConfigToParams } from "@/lib/presets";

interface ShowcaseCardProps {
  preset: MotionPreset;
}

export function ShowcaseCard({ preset }: ShowcaseCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const editorHref = `/editor?${serializeConfigToParams(preset.config)}`;

  return (
    <article className="bento-card group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <MotionCanvas
          config={preset.config}
          isPlaying={isPlaying}
          className="h-full w-full"
        />
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={
            isPlaying ? `Pause ${preset.title}` : `Play ${preset.title}`
          }
          className="btn-tactile absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/85 text-[#0F1117] backdrop-blur-md hover:border-[#C2410C] hover:text-[#C2410C] dark:border-white/15 dark:bg-[#161316]/85 dark:text-[#F5F6F8] dark:hover:border-[#FF6D29] dark:hover:text-[#FF6D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <span className="inline-block rounded-xl bg-[#C2410C]/12 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#C2410C] dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
            {preset.category}
          </span>
          <h3 className="mt-1.5 truncate font-display text-sm font-bold tracking-tight text-[var(--text-main)]">
            {preset.title}
          </h3>
        </div>
        <Link
          href={editorHref}
          className="btn-tactile inline-flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-black/5 px-3.5 py-1.5 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-[#C2410C] hover:border-[#C2410C] hover:text-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-[#FF6D29] dark:hover:border-[#FF6D29] dark:hover:text-[#161316]"
        >
          Edit
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
