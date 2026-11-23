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
    <article className="group flex flex-col border border-[#D4CFC4] bg-[#FAF9F6] transition-colors hover:border-[#141413]">
      <div className="relative aspect-square w-full overflow-hidden border-b border-[#D4CFC4] bg-[#F5F3EE] flex items-center justify-center">
        <MotionCanvas
          config={preset.config}
          isPlaying={isPlaying}
          className="h-full w-full"
        />
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? `Pause ${preset.title}` : `Play ${preset.title}`}
          className="absolute bottom-3 left-3 inline-flex h-8 w-8 items-center justify-center border border-[#141413]/20 bg-[#F5F3EE]/90 text-[#141413] backdrop-blur-xs transition-colors hover:border-[#141413] hover:bg-[#141413] hover:text-[#F5F3EE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest text-[#5C5A54] uppercase">
            {preset.category}
          </p>
          <h3 className="truncate text-xs font-medium text-[#141413]">
            {preset.title}
          </h3>
        </div>
        <Link
          href={editorHref}
          className="inline-flex shrink-0 items-center gap-1 border border-[#D4CFC4] bg-white px-2.5 py-1.5 text-[10px] font-medium tracking-wider text-[#141413] uppercase transition-colors hover:border-[#141413] hover:bg-[#141413] hover:text-[#F5F3EE]"
        >
          Edit
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
