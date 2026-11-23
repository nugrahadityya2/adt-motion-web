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
  RefreshCw,
} from "lucide-react";
import { MotionCanvas } from "@/components/MotionCanvas";
import { EditorRangeSlider } from "@/components/EditorRangeSlider";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ASPECT_DIMENSIONS,
  AspectRatio,
  DirectionOption,
  EaseStyleOption,
  ExportFps,
  ExportResolution,
  FontOption,
  FontWeightOption,
  JitterAxisOption,
  MotionConfig,
  MotionTemplate,
  TEMPLATE_META,
  WaveDensityOption,
} from "@/lib/motion-engine";
import {
  DEFAULT_CONFIG,
  SAMPLE_SVGS,
  SHOWCASE_PRESETS,
} from "@/lib/presets";
import { exportMotionVideo, exportToGif } from "@/lib/exporter";

const FONTS: FontOption[] = [
  "JetBrains Mono",
  "Outfit",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Instrument Serif",
  "Syne",
  "IBM Plex Mono",
  "Bebas Neue",
  "Playfair Display",
  "Anton",
  "DM Serif Display",
  "Oswald",
  "Bricolage Grotesque",
  "Cormorant Garamond",
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
  const [replayNonce, setReplayNonce] = useState(0);
  const [unitsCount, setUnitsCount] = useState(24);
  const [showSourcePanel, setShowSourcePanel] = useState(true);

  const [exportFormat, setExportFormat] = useState<"webm" | "mp4" | "gif">("webm");
  const [exportRes, setExportRes] = useState<ExportResolution>("1080p");
  const [exportFps, setExportFps] = useState<ExportFps>(30);
  const [exportState, setExportState] = useState<{
    active: boolean;
    progress: number;
    notice: string | null;
    error: string | null;
  }>({ active: false, progress: 0, notice: null, error: null });

  const activeTemplateMeta =
    TEMPLATE_META.find((t) => t.id === config.template) ?? TEMPLATE_META[0];

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
      setConfig((prev) => ({
        ...prev,
        mode: "svg",
        svgMarkup: text,
        svgFileName: file.name,
      }));
    }
  };

  const handleExport = async () => {
    setExportState({ active: true, progress: 0, notice: null, error: null });
    try {
      if (exportFormat === "gif") {
        await exportToGif(config, exportRes, exportFps, (progress) =>
          setExportState((s) => ({ ...s, progress }))
        );
        setExportState({ active: false, progress: 100, notice: "GIF exported!", error: null });
      } else {
        const res = await exportMotionVideo(
          config,
          exportFormat,
          exportRes,
          exportFps,
          (progress) => setExportState((s) => ({ ...s, progress }))
        );
        const note =
          exportFormat === "mp4" && res.actualFormat === "webm"
            ? "Browser does not support native MP4 recording; exported as WebM instead."
            : `${res.actualFormat.toUpperCase()} exported!`;
        setExportState({ active: false, progress: 100, notice: note, error: null });
      }
    } catch (err) {
      setExportState({
        active: false,
        progress: 0,
        notice: null,
        error: err instanceof Error ? err.message : "Export failed",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
        <div className="flex h-14 flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[var(--text-main)] hover:text-[#C2410C] dark:hover:text-[#FF6D29]"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C2410C] font-display text-[10px] font-extrabold text-white dark:bg-[#FF6D29] dark:text-[#161316]">
                ADT
              </span>
              <span className="font-display text-sm font-bold tracking-tight sm:text-base">
                ADT Motion
              </span>
            </Link>
            <span className="hidden rounded-xl bg-[#C2410C]/12 px-2 py-0.5 font-mono text-[10px] font-medium text-[#C2410C] uppercase sm:inline-block dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
              v2 · 37 Templates
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
              className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--text-main)] sm:block"
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
              onClick={() => setShowSourcePanel((v) => !v)}
              className="btn-tactile rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-main)] hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
            >
              {showSourcePanel ? "Hide Source" : "Edit Text / SVG"}
            </button>

            <ThemeToggle />
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

      {exportState.notice && (
        <div className="border-b border-[#C2410C]/30 bg-[#C2410C]/10 px-6 py-2 font-mono text-xs text-[#C2410C] dark:border-[#FF6D29]/30 dark:bg-[#FF6D29]/10 dark:text-[#FF6D29]">
          {exportState.notice}
        </div>
      )}

      {/* 3-Column Workspace matching TypeMotion video */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12">
        {/* 01 TEMPLATE (Left Sidebar - 37 Motion Templates) */}
        <aside className="flex flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] lg:col-span-3 lg:max-h-[calc(100vh-3.5rem)] lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
            <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
              01 · Template
            </span>
            <span>{TEMPLATE_META.length} motions</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)] lg:max-h-none lg:flex-1">
            {TEMPLATE_META.map((tpl) => {
              const active = config.template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => updateConfig("template", tpl.id)}
                  className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition-colors ${
                    active
                      ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-display text-xs font-bold">
                      {tpl.name}
                    </p>
                    <p
                      className={`mt-0.5 line-clamp-2 text-[11px] leading-snug ${
                        active
                          ? "text-white/85 dark:text-[#161316]/80"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {tpl.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[10px] font-semibold ${
                      active
                        ? "text-white/90 dark:text-[#161316]/80"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {tpl.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 02 PREVIEW (Center Canvas + Source Input) */}
        <section className="flex flex-col border-b border-[var(--border-subtle)] p-4 sm:p-5 lg:col-span-6 lg:border-r lg:border-b-0">
          {/* Collapsible Source Input (Text / SVG) */}
          {showSourcePanel && (
            <div className="mb-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                  Source Input
                </span>
                <div className="flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
                  <button
                    type="button"
                    onClick={() => updateConfig("mode", "text")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase ${
                      config.mode === "text"
                        ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    <Type className="h-3 w-3" />
                    Type Text
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig("mode", "svg")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase ${
                      config.mode === "svg"
                        ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    <FileCode2 className="h-3 w-3" />
                    Upload SVG
                  </button>
                </div>
              </div>

              {config.mode === "text" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <textarea
                      aria-label="Typography text"
                      rows={2}
                      value={config.text}
                      onChange={(e) => updateConfig("text", e.target.value)}
                      placeholder="Type your headline..."
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-[#C2410C] focus:outline-none dark:focus:border-[#FF6D29]"
                    />
                  </div>
                  <div className="space-y-2">
                    <select
                      aria-label="Font family"
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
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Font weight"
                        value={config.fontWeight}
                        onChange={(e) =>
                          updateConfig(
                            "fontWeight",
                            e.target.value as FontWeightOption
                          )
                        }
                        className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 font-mono text-[10px] text-[var(--text-main)] focus:border-[#C2410C] focus:outline-none dark:focus:border-[#FF6D29]"
                      >
                        <option value="400">Regular 400</option>
                        <option value="500">Medium 500</option>
                        <option value="700">Bold 700</option>
                        <option value="800">Extra 800</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateConfig(
                            "fontStyle",
                            config.fontStyle === "italic" ? "normal" : "italic"
                          )
                        }
                        className={`rounded-xl border px-2.5 py-1.5 font-serif text-xs italic transition-colors ${
                          config.fontStyle === "italic"
                            ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        }`}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2.5 text-xs font-semibold hover:border-[#C2410C] dark:hover:border-[#FF6D29]">
                    <Upload className="h-4 w-4 text-[#C2410C] dark:text-[#FF6D29]" />
                    <span>Upload .SVG</span>
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={handleSvgUpload}
                      className="sr-only"
                    />
                  </label>

                  {SAMPLE_SVGS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          svgMarkup: sample.markup,
                          svgFileName: `${sample.id.toUpperCase()}.svg`,
                        }))
                      }
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-[10px] uppercase hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 02 PREVIEW Header */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                02
              </span>
              <span>Preview</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setReplayNonce((n) => n + 1);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] text-[var(--text-main)] hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
              >
                <RefreshCw className="h-3 w-3" />
                Replay
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfig(DEFAULT_CONFIG);
                  setReplayNonce((n) => n + 1);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <RotateCcw className="h-3 w-3" />
                Start Over
              </button>

              <div className="flex items-center gap-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
                {(Object.keys(ASPECT_DIMENSIONS) as AspectRatio[]).map(
                  (ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => updateConfig("aspectRatio", ratio)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        config.aspectRatio === ratio
                          ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {ratio}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Canvas Stage */}
          <div className="relative flex min-h-[340px] flex-1 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
            <div className="flex h-full max-h-[500px] w-full items-center justify-center">
              <MotionCanvas
                config={config}
                isPlaying={isPlaying}
                replayNonce={replayNonce}
                externalCanvasRef={canvasRef}
                onProgress={handleProgress}
                onUnitsDetected={setUnitsCount}
                className="rounded-xl border border-[var(--border-subtle)] shadow-lg"
              />
            </div>
          </div>

          {/* Playback & Detected Units Strip */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C2410C] text-white hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
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

            <span className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:inline">
              {config.mode === "svg" ? config.svgFileName : "TEXT"} · {unitsCount}{" "}
              animatable units
            </span>
          </div>
        </section>

        {/* 03 CONTROLS + 03A DETAIL + 04 EXPORT (Right Sidebar) */}
        <aside className="flex flex-col divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] lg:col-span-3 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {/* 03 CONTROLS */}
          <div className="space-y-3.5 p-4">
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
              <div className="space-y-3 border-t border-[var(--border-subtle)] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Typography
                  </span>
                  <button
                    type="button"
                    onClick={() => updateConfig("autoFit", !config.autoFit)}
                    className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] uppercase transition-colors ${
                      config.autoFit
                        ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    Auto-Fit: {config.autoFit ? "ON" : "OFF"}
                  </button>
                </div>

                <EditorRangeSlider
                  label="Font Size"
                  value={config.fontSize}
                  min={16}
                  max={160}
                  step={2}
                  unit="px"
                  onChange={(v) => updateConfig("fontSize", v)}
                />

                <EditorRangeSlider
                  label="Kerning"
                  value={config.letterSpacing}
                  min={-8}
                  max={32}
                  step={1}
                  unit="px"
                  onChange={(v) => updateConfig("letterSpacing", v)}
                />

                <EditorRangeSlider
                  label="Line Height"
                  value={config.lineHeight}
                  min={0.8}
                  max={2}
                  step={0.05}
                  unit="×"
                  onChange={(v) => updateConfig("lineHeight", v)}
                />
              </div>
            )}

            {/* Color & Background */}
            <div className="space-y-3 border-t border-[var(--border-subtle)] pt-3">
              {config.mode === "text" && (
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="text-color-input"
                    className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase"
                  >
                    Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="text-color-input"
                      type="color"
                      value={config.color}
                      onChange={(e) => updateConfig("color", e.target.value)}
                      className="h-6 w-6 cursor-pointer rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5"
                    />
                    <span className="w-16 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] uppercase">
                      {config.color}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="mb-1.5 block font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                  Background
                </span>
                <div className="flex flex-wrap gap-1">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => updateConfig("bgColor", bg.value)}
                      className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase ${
                        config.bgColor === bg.value
                          ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 03A CONTEXTUAL DETAIL */}
          {activeTemplateMeta.detailType !== "none" && (
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
                <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                  03A
                </span>
                <span>{activeTemplateMeta.detailType} Detail</span>
              </div>

              {activeTemplateMeta.detailType === "pattern" && (
                <div>
                  <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                    Pattern
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["straight", "circle"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateConfig("pattern", p)}
                        className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                          config.pattern === p
                            ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(activeTemplateMeta.detailType === "slide" ||
                activeTemplateMeta.detailType === "reveal") && (
                <>
                  <div>
                    <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Direction
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {(["up", "down", "left", "right"] as DirectionOption[]).map(
                        (d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => updateConfig("direction", d)}
                            className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                              config.direction === d
                                ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                                : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                            }`}
                          >
                            {d}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Ease Style
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {(["linear", "smooth", "snappy"] as EaseStyleOption[]).map(
                        (e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => updateConfig("easeStyle", e)}
                            className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                              config.easeStyle === e
                                ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                                : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                            }`}
                          >
                            {e}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTemplateMeta.detailType === "glitch" && (
                <div>
                  <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                    Jitter Axis
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(["x", "y", "spin", "both"] as JitterAxisOption[]).map(
                      (ax) => (
                        <button
                          key={ax}
                          type="button"
                          onClick={() => updateConfig("jitterAxis", ax)}
                          className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                            config.jitterAxis === ax
                              ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                          }`}
                        >
                          {ax}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTemplateMeta.detailType === "marquee" && (
                <div>
                  <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                    Direction
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["left", "right"] as DirectionOption[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => updateConfig("direction", d)}
                        className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                          config.direction === d
                            ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTemplateMeta.detailType === "wave" && (
                <>
                  <div>
                    <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Wave Density
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {(["loose", "normal", "tight"] as WaveDensityOption[]).map(
                        (wd) => (
                          <button
                            key={wd}
                            type="button"
                            onClick={() => updateConfig("waveDensity", wd)}
                            className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                              config.waveDensity === wd
                                ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                                : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                            }`}
                          >
                            {wd}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <EditorRangeSlider
                    label="Tilt"
                    value={config.tilt}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) => updateConfig("tilt", v)}
                  />
                </>
              )}

              {activeTemplateMeta.detailType === "circle" && (
                <>
                  <div>
                    <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Rotation Direction
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: "cw", label: "Clockwise" },
                          { id: "ccw", label: "Counter-CW" },
                        ] as const
                      ).map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => updateConfig("circleDirection", dir.id)}
                          className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                            config.circleDirection === dir.id
                              ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
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

                  <EditorRangeSlider
                    label="Arc Coverage"
                    value={config.arcCoverage}
                    min={30}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) => updateConfig("arcCoverage", v)}
                  />

                  <div>
                    <span className="mb-1.5 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Letter Facing
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["outward", "inward"] as const).map((lf) => (
                        <button
                          key={lf}
                          type="button"
                          onClick={() => updateConfig("letterFacing", lf)}
                          className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase ${
                            config.letterFacing === lf
                              ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                          }`}
                        >
                          {lf}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 04 EXPORT */}
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
              <span className="font-semibold text-[#C2410C] dark:text-[#FF6D29]">
                04
              </span>
              <span>Export</span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {(["webm", "mp4", "gif"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`rounded-lg border py-1.5 font-mono text-[10px] font-semibold uppercase ${
                    exportFormat === fmt
                      ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div>
              <span className="mb-1 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                Resolution
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(["240p", "720p", "1080p", "4k"] as ExportResolution[]).map(
                  (res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setExportRes(res)}
                      className={`rounded-lg border py-1 font-mono text-[10px] uppercase ${
                        exportRes === res
                          ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                      }`}
                    >
                      {res}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <span className="mb-1 block font-mono text-[10px] text-[var(--text-muted)] uppercase">
                Frame Rate
              </span>
              <div className="grid grid-cols-3 gap-1">
                {([24, 30, 60] as ExportFps[]).map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => setExportFps(fps)}
                    className={`rounded-lg border py-1 font-mono text-[10px] uppercase ${
                      exportFps === fps
                        ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {fps}fps
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exportState.active}
              className="btn-tactile flex w-full items-center justify-center gap-2 rounded-full bg-[#C2410C] py-3 font-display text-xs font-bold tracking-wider text-white uppercase shadow-md hover:opacity-90 disabled:opacity-50 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              <Download className="h-3.5 w-3.5" />
              {exportState.active
                ? `Exporting ${exportFormat.toUpperCase()} ${exportState.progress}%`
                : `Export ${exportFormat.toUpperCase()}`}
            </button>
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
