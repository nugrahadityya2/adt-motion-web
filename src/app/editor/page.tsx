"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Pause,
  Play,
  RotateCcw,
  Upload,
  FileCode2,
  Type,
} from "lucide-react";
import { MotionCanvas } from "@/components/MotionCanvas";
import { EditorRangeSlider } from "@/components/EditorRangeSlider";
import {
  ASPECT_DIMENSIONS,
  AspectRatio,
  FontOption,
  MotionConfig,
  MotionTemplate,
  TEMPLATE_META,
} from "@/lib/motion-engine";
import {
  DEFAULT_CONFIG,
  SAMPLE_SVGS,
  SHOWCASE_PRESETS,
} from "@/lib/presets";
import { exportToGif, exportToWebM } from "@/lib/exporter";

const FONTS: FontOption[] = [
  "IBM Plex Mono",
  "Space Grotesk",
  "Instrument Serif",
  "Syne",
  "Bebas Neue",
  "Playfair Display",
];

const BG_PRESETS: { label: string; value: string }[] = [
  { label: "Transparent", value: "transparent" },
  { label: "Cream", value: "#F5F3EE" },
  { label: "White", value: "#FFFFFF" },
  { label: "Charcoal", value: "#141413" },
  { label: "Blue", value: "#2563EB" },
];

function EditorWorkspace() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] = useState<MotionConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(true);
  const [exportState, setExportState] = useState<{
    format: "webm" | "gif" | null;
    progress: number;
    error: string | null;
  }>({ format: null, progress: 0, error: null });

  // Hydrate from URL params if coming from Showcase
  useEffect(() => {
    const template = searchParams.get("template") as MotionTemplate | null;
    const text = searchParams.get("text");
    const font = searchParams.get("font") as FontOption | null;
    const mode = searchParams.get("mode") as "text" | "svg" | null;
    const color = searchParams.get("color");
    const bg = searchParams.get("bg");
    const ratio = searchParams.get("ratio") as AspectRatio | null;
    const speed = searchParams.get("speed");
    const stagger = searchParams.get("stagger");
    const intensity = searchParams.get("intensity");
    const fontSize = searchParams.get("fontSize");
    const radius = searchParams.get("radius");

    if (!template && !text && !mode) return;

    setConfig((prev) => ({
      ...prev,
      mode: mode === "svg" || mode === "text" ? mode : prev.mode,
      text: text ?? prev.text,
      font: font && FONTS.includes(font) ? font : prev.font,
      template:
        template && TEMPLATE_META.some((t) => t.id === template)
          ? template
          : prev.template,
      color: color ?? prev.color,
      bgColor: bg ?? prev.bgColor,
      aspectRatio:
        ratio && ratio in ASPECT_DIMENSIONS ? ratio : prev.aspectRatio,
      speed: speed ? Number(speed) : prev.speed,
      stagger: stagger ? Number(stagger) : prev.stagger,
      intensity: intensity ? Number(intensity) : prev.intensity,
      fontSize: fontSize ? Number(fontSize) : prev.fontSize,
      circleRadius: radius ? Number(radius) : prev.circleRadius,
    }));
  }, [searchParams]);

  const handleProgress = useCallback((p: number) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${Math.round(p * 100)}%`;
    }
  }, []);

  const updateConfig = <K extends keyof MotionConfig>(
    key: K,
    value: MotionConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSvgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (text.includes("<svg")) {
      setConfig((prev) => ({ ...prev, mode: "svg", svgMarkup: text }));
    }
  };

  const handleExport = async (format: "webm" | "gif") => {
    setExportState({ format, progress: 0, error: null });
    try {
      if (format === "webm") {
        await exportToWebM(config, (progress) =>
          setExportState({ format: "webm", progress, error: null })
        );
      } else {
        await exportToGif(config, (progress) =>
          setExportState({ format: "gif", progress, error: null })
        );
      }
      setExportState({ format: null, progress: 100, error: null });
    } catch (err) {
      setExportState({
        format: null,
        progress: 0,
        error: err instanceof Error ? err.message : "Export failed",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F3EE] text-[#141413]">
      {/* Editor Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#D4CFC4] bg-[#F5F3EE]/95 backdrop-blur-sm">
        <div className="flex h-14 flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#141413] hover:text-[#2563EB]"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center border border-[#141413] bg-[#141413] text-[11px] font-semibold text-[#F5F3EE]">
                TM
              </span>
              <span className="font-serif text-xl">TypeMotion</span>
            </Link>
            <span className="hidden border border-[#D4CFC4] bg-[#FAF9F6] px-2 py-0.5 text-[10px] tracking-widest text-[#5C5A54] uppercase sm:inline-block">
              Editor
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Load preset"
              value=""
              onChange={(e) => {
                const found = SHOWCASE_PRESETS.find(
                  (p) => p.id === e.target.value
                );
                if (found) setConfig(found.config);
              }}
              className="hidden border border-[#D4CFC4] bg-[#FAF9F6] px-2.5 py-1.5 text-[11px] text-[#141413] sm:block"
            >
              <option value="" disabled>
                Load preset...
              </option>
              {SHOWCASE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleExport("webm")}
              disabled={exportState.format !== null}
              className="inline-flex items-center gap-1.5 border border-[#141413] bg-[#FAF9F6] px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase transition-colors hover:bg-[#141413] hover:text-[#F5F3EE] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exportState.format === "webm"
                ? `WebM ${exportState.progress}%`
                : "Export WebM"}
            </button>

            <button
              type="button"
              onClick={() => handleExport("gif")}
              disabled={exportState.format !== null}
              className="inline-flex items-center gap-1.5 border border-[#141413] bg-[#141413] px-3 py-1.5 text-[11px] font-medium tracking-wider text-[#F5F3EE] uppercase transition-colors hover:border-[#2563EB] hover:bg-[#2563EB] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exportState.format === "gif"
                ? `GIF ${exportState.progress}%`
                : "Export GIF"}
            </button>
          </div>
        </div>
      </header>

      {exportState.error && (
        <div
          role="alert"
          className="border-b border-red-300 bg-red-50 px-6 py-2 text-xs text-red-800"
        >
          Export error: {exportState.error}
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* 01 PREVIEW */}
        <section className="flex flex-col border-b border-[#D4CFC4] p-4 sm:p-6 lg:col-span-7 xl:col-span-8 lg:border-r lg:border-b-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] tracking-widest text-[#5C5A54] uppercase">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2563EB]">01</span>
              <span>Preview</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(Object.keys(ASPECT_DIMENSIONS) as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => updateConfig("aspectRatio", ratio)}
                  className={`border px-2 py-1 text-[10px] transition-colors ${
                    config.aspectRatio === ratio
                      ? "border-[#141413] bg-[#141413] text-[#F5F3EE]"
                      : "border-[#D4CFC4] bg-[#FAF9F6] text-[#5C5A54] hover:border-[#141413]"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-1 min-h-[380px] items-center justify-center border border-[#D4CFC4] bg-[#ECE9E2] p-4 sm:p-8">
            <div className="flex h-full max-h-[560px] w-full items-center justify-center">
              <MotionCanvas
                config={config}
                isPlaying={isPlaying}
                externalCanvasRef={canvasRef}
                onProgress={handleProgress}
                className="border border-[#D4CFC4] shadow-sm"
              />
            </div>
          </div>

          {/* Playback & Loop Progress Bar */}
          <div className="mt-3 flex items-center gap-3 border border-[#D4CFC4] bg-[#FAF9F6] px-3 py-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="inline-flex h-8 w-8 items-center justify-center border border-[#141413] bg-[#141413] text-[#F5F3EE] transition-colors hover:bg-[#2563EB] hover:border-[#2563EB]"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden bg-[#D4CFC4]">
                <div
                  ref={progressBarRef}
                  className="h-full bg-[#2563EB] transition-none"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              title="Reset to default"
              className="inline-flex items-center gap-1 border border-[#D4CFC4] bg-white px-2.5 py-1.5 text-[10px] tracking-wider text-[#5C5A54] uppercase hover:border-[#141413] hover:text-[#141413]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </section>

        {/* 02 SOURCE & 03 CONTROLS */}
        <aside className="flex flex-col divide-y divide-[#D4CFC4] bg-[#FAF9F6] lg:col-span-5 xl:col-span-4 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {/* 02 SOURCE */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] tracking-widest text-[#5C5A54] uppercase">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2563EB]">02</span>
                <span>Source</span>
              </div>

              <div className="flex border border-[#D4CFC4] bg-[#F5F3EE]">
                <button
                  type="button"
                  onClick={() => updateConfig("mode", "text")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase ${
                    config.mode === "text"
                      ? "bg-[#141413] text-[#F5F3EE]"
                      : "text-[#5C5A54]"
                  }`}
                >
                  <Type className="h-3 w-3" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig("mode", "svg")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase ${
                    config.mode === "svg"
                      ? "bg-[#141413] text-[#F5F3EE]"
                      : "text-[#5C5A54]"
                  }`}
                >
                  <FileCode2 className="h-3 w-3" />
                  SVG
                </button>
              </div>
            </div>

            {config.mode === "text" ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="editor-text-input"
                    className="mb-1 block text-[10px] tracking-wider text-[#5C5A54] uppercase"
                  >
                    Typography Text
                  </label>
                  <textarea
                    id="editor-text-input"
                    rows={2}
                    value={config.text}
                    onChange={(e) => updateConfig("text", e.target.value)}
                    placeholder="Type your headline..."
                    className="w-full border border-[#D4CFC4] bg-white px-3 py-2 text-xs text-[#141413] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editor-font-select"
                    className="mb-1 block text-[10px] tracking-wider text-[#5C5A54] uppercase"
                  >
                    Font Family
                  </label>
                  <select
                    id="editor-font-select"
                    value={config.font}
                    onChange={(e) =>
                      updateConfig("font", e.target.value as FontOption)
                    }
                    className="w-full border border-[#D4CFC4] bg-white px-3 py-2 text-xs text-[#141413] focus:border-[#2563EB] focus:outline-none"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#141413]/40 bg-white px-4 py-5 text-center transition-colors hover:border-[#2563EB]">
                  <Upload className="mb-1.5 h-4 w-4 text-[#2563EB]" />
                  <span className="text-xs font-medium text-[#141413]">
                    Upload .SVG file
                  </span>
                  <span className="mt-0.5 text-[10px] text-[#5C5A54]">
                    Outlined vector marks work best
                  </span>
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleSvgUpload}
                    className="sr-only"
                  />
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_SVGS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => updateConfig("svgMarkup", sample.markup)}
                      className="border border-[#D4CFC4] bg-white px-2.5 py-1 text-[10px] uppercase hover:border-[#141413]"
                    >
                      Sample: {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 02B TEMPLATE */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#5C5A54] uppercase">
              <span className="font-semibold text-[#2563EB]">02B</span>
              <span>Motion Template</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_META.map((tpl) => {
                const active = config.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => updateConfig("template", tpl.id)}
                    className={`border p-2.5 text-left transition-colors ${
                      active
                        ? "border-[#2563EB] bg-[#2563EB]/8"
                        : "border-[#D4CFC4] bg-white hover:border-[#141413]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={
                          active ? "font-semibold text-[#2563EB]" : "text-[#5C5A54]"
                        }
                      >
                        {tpl.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#141413]">
                      {tpl.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 03 CONTROLS */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#5C5A54] uppercase">
              <span className="font-semibold text-[#2563EB]">03</span>
              <span>Controls</span>
            </div>

            <EditorRangeSlider
              label="Speed"
              value={config.speed}
              min={0.25}
              max={3}
              step={0.05}
              unit="×"
              onChange={(v) => updateConfig("speed", v)}
            />

            <EditorRangeSlider
              label="Stagger"
              value={config.stagger}
              min={0}
              max={200}
              step={5}
              unit="ms"
              onChange={(v) => updateConfig("stagger", v)}
            />

            <EditorRangeSlider
              label="Intensity"
              value={config.intensity}
              min={0}
              max={200}
              step={5}
              unit="%"
              onChange={(v) => updateConfig("intensity", v)}
            />

            {config.mode === "text" && (
              <EditorRangeSlider
                label="Font Size"
                value={config.fontSize}
                min={28}
                max={160}
                step={2}
                unit="px"
                onChange={(v) => updateConfig("fontSize", v)}
              />
            )}

            {config.template === "circle" && (
              <div className="border-t border-[#D4CFC4] pt-4 space-y-3">
                <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#5C5A54] uppercase">
                  <span className="font-semibold text-[#2563EB]">03A</span>
                  <span>Circle Detail</span>
                </div>
                <EditorRangeSlider
                  label="Orbit Radius"
                  value={config.circleRadius}
                  min={80}
                  max={280}
                  step={5}
                  unit="px"
                  onChange={(v) => updateConfig("circleRadius", v)}
                />
              </div>
            )}

            {/* Color Controls */}
            <div className="border-t border-[#D4CFC4] pt-4 space-y-3">
              {config.mode === "text" && (
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="text-color-input"
                    className="text-[11px] font-medium tracking-wider text-[#5C5A54] uppercase"
                  >
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="text-color-input"
                      type="color"
                      value={config.color}
                      onChange={(e) => updateConfig("color", e.target.value)}
                      className="h-7 w-7 cursor-pointer border border-[#D4CFC4] bg-white p-0.5"
                    />
                    <span className="w-16 border border-[#D4CFC4] bg-white px-2 py-1 text-[11px] uppercase">
                      {config.color}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="mb-1.5 block text-[11px] font-medium tracking-wider text-[#5C5A54] uppercase">
                  Background
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => updateConfig("bgColor", bg.value)}
                      className={`border px-2.5 py-1 text-[10px] uppercase ${
                        config.bgColor === bg.value
                          ? "border-[#141413] bg-[#141413] text-[#F5F3EE]"
                          : "border-[#D4CFC4] bg-white text-[#5C5A54] hover:border-[#141413]"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F3EE] text-xs uppercase tracking-widest text-[#5C5A54]">
          Loading TypeMotion Editor...
        </div>
      }
    >
      <EditorWorkspace />
    </Suspense>
  );
}
