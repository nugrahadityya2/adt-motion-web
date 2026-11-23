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
import { ThemeToggle } from "@/components/ThemeToggle";
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
  "JetBrains Mono",
  "Outfit",
  "Space Grotesk",
  "Instrument Serif",
  "Syne",
  "IBM Plex Mono",
  "Bebas Neue",
  "Playfair Display",
];

const BG_PRESETS: { label: string; value: string }[] = [
  { label: "Transparent", value: "transparent" },
  { label: "Obsidian", value: "#161316" },
  { label: "Surface", value: "#1E1A1D" },
  { label: "Light", value: "#F5F6F8" },
  { label: "Orange", value: "#FF6D29" },
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* Editor Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md">
        <div className="flex h-16 flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[var(--text-main)] hover:text-[#C2410C] dark:hover:text-[#FF6D29]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C2410C] font-display text-[10px] font-extrabold text-white dark:bg-[#FF6D29] dark:text-[#161316]">
                ADT
              </span>
              <span className="font-display text-base font-bold tracking-tight">
                ADT Motion
              </span>
            </Link>
            <span className="hidden rounded-xl bg-[#C2410C]/12 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#C2410C] uppercase sm:inline-block dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
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
              className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs text-[var(--text-main)] sm:block"
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

            <ThemeToggle />

            <button
              type="button"
              onClick={() => handleExport("webm")}
              disabled={exportState.format !== null}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3.5 py-2 font-display text-xs font-semibold text-[var(--text-main)] hover:bg-black/10 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
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
              className="btn-tactile inline-flex items-center gap-1.5 rounded-full bg-[#C2410C] px-4 py-2 font-display text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50 dark:bg-[#FF6D29] dark:text-[#161316]"
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
          className="border-b border-red-500/30 bg-red-500/10 px-6 py-2 text-xs text-red-500"
        >
          Export error: {exportState.error}
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* 01 PREVIEW */}
        <section className="flex flex-col border-b border-[var(--border-subtle)] p-4 sm:p-6 lg:col-span-7 xl:col-span-8 lg:border-r lg:border-b-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                01
              </span>
              <span>Preview</span>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
              {(Object.keys(ASPECT_DIMENSIONS) as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => updateConfig("aspectRatio", ratio)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    config.aspectRatio === ratio
                      ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[380px] flex-1 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:p-8">
            <div className="flex h-full max-h-[560px] w-full items-center justify-center">
              <MotionCanvas
                config={config}
                isPlaying={isPlaying}
                externalCanvasRef={canvasRef}
                onProgress={handleProgress}
                className="rounded-xl border border-[var(--border-subtle)] shadow-lg"
              />
            </div>
          </div>

          {/* Playback & Loop Progress Bar */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="btn-tactile inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C2410C] text-white hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  ref={progressBarRef}
                  className="h-full rounded-full bg-[#C2410C] transition-none dark:bg-[#FF6D29]"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              title="Reset to default"
              className="btn-tactile inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase hover:text-[var(--text-main)]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </section>

        {/* 02 SOURCE & 03 CONTROLS */}
        <aside className="flex flex-col divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] lg:col-span-5 xl:col-span-4 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          {/* 02 SOURCE */}
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                  02
                </span>
                <span>Source</span>
              </div>

              <div className="flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
                <button
                  type="button"
                  onClick={() => updateConfig("mode", "text")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase transition-colors ${
                    config.mode === "text"
                      ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <Type className="h-3 w-3" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig("mode", "svg")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase transition-colors ${
                    config.mode === "svg"
                      ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "text-[var(--text-muted)]"
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
                    className="mb-1.5 block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase"
                  >
                    Typography Text
                  </label>
                  <textarea
                    id="editor-text-input"
                    rows={2}
                    value={config.text}
                    onChange={(e) => updateConfig("text", e.target.value)}
                    placeholder="Type your headline..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-[#C2410C] focus:outline-none dark:focus:border-[#FF6D29]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editor-font-select"
                    className="mb-1.5 block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase"
                  >
                    Font Family
                  </label>
                  <select
                    id="editor-font-select"
                    value={config.font}
                    onChange={(e) =>
                      updateConfig("font", e.target.value as FontOption)
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-[#C2410C] focus:outline-none dark:focus:border-[#FF6D29]"
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
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-5 text-center transition-colors hover:border-[#C2410C] dark:hover:border-[#FF6D29]">
                  <Upload className="mb-1.5 h-4 w-4 text-[#C2410C] dark:text-[#FF6D29]" />
                  <span className="text-xs font-semibold text-[var(--text-main)]">
                    Upload .SVG file
                  </span>
                  <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">
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
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-[10px] uppercase hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
                    >
                      Sample: {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 02B TEMPLATE */}
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
              <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                02B
              </span>
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
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-[#C2410C] bg-[#C2410C]/10 dark:border-[#FF6D29] dark:bg-[#FF6D29]/12"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[#C2410C]/50 dark:hover:border-[#FF6D29]/50"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] ${
                        active
                          ? "font-semibold text-[#C2410C] dark:text-[#FF6D29]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tpl.tag}
                    </span>
                    <p className="mt-1 font-display text-xs font-bold text-[var(--text-main)]">
                      {tpl.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 03 CONTROLS */}
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
              <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                03
              </span>
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
              <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                  <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                    03A
                  </span>
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
            <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
              {config.mode === "text" && (
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="text-color-input"
                    className="font-mono text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase"
                  >
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="text-color-input"
                      type="color"
                      value={config.color}
                      onChange={(e) => updateConfig("color", e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5"
                    />
                    <span className="w-16 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 font-mono text-[11px] uppercase">
                      {config.color}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                  Background
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => updateConfig("bgColor", bg.value)}
                      className={`rounded-xl border px-3 py-1 font-mono text-[10px] uppercase transition-colors ${
                        config.bgColor === bg.value
                          ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase">
          Loading ADT Motion Editor...
        </div>
      }
    >
      <EditorWorkspace />
    </Suspense>
  );
}
