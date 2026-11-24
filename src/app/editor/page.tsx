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
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Move,
  Image as ImageIcon,
  X,
  Code2,
  Copy,
  Check,
  Music,
  Shield,
} from "lucide-react";
import {
  BgMediaSource,
  MotionCanvas,
  SafeZoneMode,
} from "@/components/MotionCanvas";
import { EditorRangeSlider } from "@/components/EditorRangeSlider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { generateHtmlCssEmbed } from "@/lib/code-exporter";
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
  MotionLayer,
  MotionTemplate,
  TEMPLATE_CATEGORIES,
  TEMPLATE_META,
  type TemplateCategory,
  WaveDensityOption,
} from "@/lib/motion-engine";
import {
  DEFAULT_CONFIG,
  SAMPLE_SVGS,
} from "@/lib/presets";
import { exportMotionVideo, exportToGif } from "@/lib/exporter";
import {
  getDailyExportLimit,
  getRemainingExports,
  getUpgradeUrl,
  isExportLimitEnabled,
  recordExportUsage,
} from "@/lib/export-quota";

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

  const [layers, setLayers] = useState<MotionLayer[]>([
    {
      id: "layer-1",
      name: "Motion 1",
      visible: true,
      config: DEFAULT_CONFIG,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState("layer-1");
  const [bgMedia, setBgMedia] = useState<BgMediaSource | null>(null);
  const [safeZone, setSafeZone] = useState<SafeZoneMode>("none");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const tapTimesRef = useRef<number[]>([]);
  const activeLayer =
    layers.find((l) => l.id === activeLayerId) ?? layers[0];
  const config = activeLayer.config;

  const setConfig = useCallback(
    (updater: MotionConfig | ((prev: MotionConfig) => MotionConfig)) => {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id !== activeLayer.id) return layer;
          const nextConfig =
            typeof updater === "function" ? updater(layer.config) : updater;
          return { ...layer, config: nextConfig };
        })
      );
    },
    [activeLayer.id]
  );

  const [isPlaying, setIsPlaying] = useState(true);
  const [replayNonce, setReplayNonce] = useState(0);
  const [unitsCount, setUnitsCount] = useState(24);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [templateCategory, setTemplateCategory] = useState<"All" | TemplateCategory>("All");

  const filteredTemplates =
    templateCategory === "All"
      ? TEMPLATE_META
      : TEMPLATE_META.filter((t) => t.category === templateCategory);

  const [exportFormat, setExportFormat] = useState<"webm" | "mp4" | "gif">("webm");
  const [exportRes, setExportRes] = useState<ExportResolution>("1080p");
  const [exportFps, setExportFps] = useState<ExportFps>(30);
  const [exportState, setExportState] = useState<{
    active: boolean;
    progress: number;
    notice: string | null;
    error: string | null;
  }>({ active: false, progress: 0, notice: null, error: null });
  const [showLimitModal, setShowLimitModal] = useState(false);

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

  const handleLayerDrag = useCallback(
    (layerId: string, dx: number, dy: number) => {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId
            ? {
                ...l,
                config: {
                  ...l.config,
                  offsetX: (l.config.offsetX ?? 0) + dx,
                  offsetY: (l.config.offsetY ?? 0) + dy,
                },
              }
            : l
        )
      );
    },
    []
  );

  const handleAddLayer = () => {
    const idx = layers.length + 1;
    const newId = `layer-${Date.now()}`;
    const newLayer: MotionLayer = {
      id: newId,
      name: `Motion ${idx}`,
      visible: true,
      config: {
        ...DEFAULT_CONFIG,
        text: `LAYER ${idx}`,
        template: "wave",
        offsetY: 90,
      },
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newId);
  };

  const handleToggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const next = layers.filter((l) => l.id !== id);
    setLayers(next);
    if (activeLayerId === id) {
      setActiveLayerId(next[0].id);
    }
  };

  // Escape key closes any open modal (R-32)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCodeModal(false);
        setShowProModal(false);
        setShowLimitModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleTapTempo = () => {
    const now = performance.now();
    const recent = tapTimesRef.current.filter((ts) => now - ts < 2500);
    recent.push(now);
    tapTimesRef.current = recent.slice(-5);

    if (recent.length >= 2) {
      let sum = 0;
      for (let i = 1; i < recent.length; i++) {
        sum += recent[i] - recent[i - 1];
      }
      const avgMs = sum / (recent.length - 1);
      const bpm = Math.min(200, Math.max(60, Math.round(60000 / avgMs)));
      setConfig((prev) => ({ ...prev, bpmEnabled: true, bpm }));
    } else {
      setConfig((prev) => ({ ...prev, bpmEnabled: true, bpm: prev.bpm ?? 120 }));
    }
  };

  const handleBgMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bgMedia?.url.startsWith("blob:")) {
      URL.revokeObjectURL(bgMedia.url);
    }
    const objectUrl = URL.createObjectURL(file);
    const type: "image" | "video" = file.type.startsWith("video/")
      ? "video"
      : "image";
    setBgMedia({ url: objectUrl, type });
    setExportState((s) => ({ ...s, error: null }));
    e.target.value = "";
  };

  const handleClearBgMedia = () => {
    if (bgMedia?.url.startsWith("blob:")) {
      URL.revokeObjectURL(bgMedia.url);
    }
    setBgMedia(null);
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
    if (isExportLimitEnabled() && getRemainingExports() <= 0) {
      setShowLimitModal(true);
      return;
    }

    setExportState({ active: true, progress: 0, notice: null, error: null });
    try {
      if (exportFormat === "gif") {
        await exportToGif(
          config,
          exportRes,
          exportFps,
          (progress) => setExportState((s) => ({ ...s, progress })),
          layers,
          bgMedia
        );
        recordExportUsage();
        setExportState({ active: false, progress: 100, notice: "GIF exported!", error: null });
      } else {
        const res = await exportMotionVideo(
          config,
          exportFormat,
          exportRes,
          exportFps,
          (progress) => setExportState((s) => ({ ...s, progress })),
          layers,
          bgMedia
        );
        recordExportUsage();
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-main)] lg:h-screen lg:overflow-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
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
            <span className="hidden rounded-full bg-[#C2410C]/12 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#C2410C] uppercase sm:inline-block dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
              Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = getUpgradeUrl();
                if (url) {
                  window.open(url, "_blank", "noopener,noreferrer");
                } else {
                  setShowProModal(true);
                }
              }}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-full bg-[#C2410C] px-3.5 py-1.5 font-display text-xs font-bold text-white shadow-sm hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
            >
              <span>Go Premium</span>
            </button>

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

      {/* 3-Column Studio Shell: Left & Right scroll independently, Center stays pinned */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 lg:overflow-hidden">
        {/* Left Sidebar: Categorized Motion Library */}
        <aside className="flex min-h-0 flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] lg:col-span-3 lg:h-full lg:border-r lg:border-b-0">
          <div className="border-b border-[var(--border-subtle)] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-tight text-[var(--text-main)]">
                Motion Library
              </span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {filteredTemplates.length} styles
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateCategory(cat)}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors ${
                    templateCategory === cat
                      ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)] lg:max-h-none lg:flex-1">
            {filteredTemplates.map((tpl) => {
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
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${
                      active
                        ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#161316]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tpl.category}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Pinned Canvas Stage */}
        <section className="flex min-h-0 flex-col border-b border-[var(--border-subtle)] p-4 lg:col-span-6 lg:h-full lg:overflow-hidden lg:border-r lg:border-b-0">
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

          {/* Multi-Layer Bar */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
            <span className="mr-1 font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              Layers:
            </span>
            {layers.map((layer) => {
              const isActive = layer.id === activeLayer.id;
              return (
                <div
                  key={layer.id}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    isActive
                      ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-main)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveLayerId(layer.id)}
                    className="font-display font-semibold"
                  >
                    {layer.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLayerVisibility(layer.id)}
                    aria-label={layer.visible ? "Hide layer" : "Show layer"}
                    className="opacity-75 hover:opacity-100"
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </button>
                  {layers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLayer(layer.id)}
                      aria-label="Delete layer"
                      className="opacity-75 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddLayer}
              className="btn-tactile inline-flex items-center gap-1 rounded-full border border-dashed border-[#C2410C]/50 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#C2410C] uppercase hover:bg-[#C2410C]/10 dark:border-[#FF6D29]/50 dark:text-[#FF6D29] dark:hover:bg-[#FF6D29]/10"
            >
              <Plus className="h-3 w-3" />
              Add Motion
            </button>
          </div>

          {/* Canvas Stage Header */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold text-[var(--text-main)]">
                Canvas Stage
              </span>
              <span className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:inline">
                (drag to move)
              </span>
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
                  updateConfig("offsetX", 0);
                  updateConfig("offsetY", 0);
                }}
                title="Center active motion"
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Move className="h-3 w-3" />
                Center
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
                <span className="px-1.5 text-[var(--text-muted)]" title="Social Safe-Zone Guide">
                  <Shield className="h-3 w-3" />
                </span>
                {(["none", "reels", "tiktok", "shorts"] as SafeZoneMode[]).map(
                  (sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSafeZone(sz);
                        if (sz !== "none" && config.aspectRatio !== "9:16") {
                          updateConfig("aspectRatio", "9:16");
                        }
                      }}
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        safeZone === sz
                          ? "bg-[#C2410C] text-white dark:bg-[#FF6D29] dark:text-[#161316]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {sz === "none" ? "Off" : sz}
                    </button>
                  )
                )}
              </div>

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
          <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 sm:p-4 lg:min-h-0">
            <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center">
              <MotionCanvas
                config={config}
                layers={layers}
                activeLayerId={activeLayer.id}
                bgMedia={bgMedia}
                safeZone={safeZone}
                isPlaying={isPlaying}
                replayNonce={replayNonce}
                externalCanvasRef={canvasRef}
                onProgress={handleProgress}
                onUnitsDetected={setUnitsCount}
                onLayerDrag={handleLayerDrag}
                onBgMediaError={(msg) =>
                  setExportState((s) => ({ ...s, error: msg }))
                }
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

        {/* Right Sidebar: Inspector + Motion Tuning + Render & Export */}
        <aside className="flex min-h-0 flex-col divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] lg:col-span-3 lg:h-full lg:overflow-y-auto">
          {/* Inspector */}
          <div className="space-y-3.5 p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-[var(--text-main)]">
                Inspector
              </span>
              <span className="font-mono text-[10px] text-[#C2410C] dark:text-[#FF6D29]">
                {activeLayer.name}
              </span>
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

            {/* BPM Music Sync */}
            <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                  <Music className="h-3 w-3 text-[#C2410C] dark:text-[#FF6D29]" />
                  BPM Sync
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleTapTempo}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-main)] uppercase hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
                  >
                    Tap
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        bpmEnabled: !prev.bpmEnabled,
                        bpm: prev.bpm ?? 120,
                      }))
                    }
                    className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] uppercase ${
                      config.bpmEnabled
                        ? "border-[#C2410C] bg-[#C2410C] text-white dark:border-[#FF6D29] dark:bg-[#FF6D29] dark:text-[#161316]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {config.bpmEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
              {config.bpmEnabled && (
                <EditorRangeSlider
                  label="Tempo"
                  value={config.bpm ?? 120}
                  min={60}
                  max={200}
                  step={1}
                  unit=" BPM"
                  onChange={(v) => updateConfig("bpm", v)}
                />
              )}
            </div>

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

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 font-mono text-[10px] uppercase hover:border-[#C2410C] dark:hover:border-[#FF6D29]">
                    <ImageIcon className="h-3 w-3 text-[#C2410C] dark:text-[#FF6D29]" />
                    <span>
                      {bgMedia ? "Change BG Media" : "Upload Image / Video"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      onChange={handleBgMediaUpload}
                      className="sr-only"
                    />
                  </label>
                  {bgMedia && (
                    <>
                      {bgMedia.type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={bgMedia.url}
                          alt="Background preview"
                          className="h-7 w-10 rounded-md border border-[var(--border-subtle)] object-cover"
                        />
                      ) : (
                        <span className="rounded-md border border-[#C2410C]/40 bg-[#C2410C]/10 px-2 py-1 font-mono text-[10px] text-[#C2410C] uppercase dark:border-[#FF6D29]/40 dark:bg-[#FF6D29]/10 dark:text-[#FF6D29]">
                          Video BG
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleClearBgMedia}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 font-mono text-[10px] text-[var(--text-muted)] uppercase hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                        Clear BG
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Motion Tuning */}
          {activeTemplateMeta.detailType !== "none" && (
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-[var(--text-main)]">
                  Motion Tuning
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                  {activeTemplateMeta.detailType}
                </span>
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

          {/* Render & Export */}
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-[var(--text-main)]">
                Render &amp; Export
              </span>
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                Local
              </span>
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

            <button
              type="button"
              onClick={() => {
                setCodeCopied(false);
                setShowCodeModal(true);
              }}
              className="btn-tactile flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 font-display text-xs font-semibold text-[var(--text-main)] hover:border-[#C2410C] dark:hover:border-[#FF6D29]"
            >
              <Code2 className="h-3.5 w-3.5" />
              Export HTML / CSS Code
            </button>
          </div>
        </aside>
      </div>
      {/* HTML / CSS Code Export Modal */}
      {showCodeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="code-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="bento-card flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2
                  id="code-modal-title"
                  className="font-display text-xl font-bold tracking-tight"
                >
                  HTML / CSS Embed Code
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Copy and paste into Framer, Webflow, Next.js, or any HTML page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                aria-label="Close code modal"
                className="rounded-full border border-[var(--border-subtle)] p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="mt-4 flex-1 overflow-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 font-mono text-[11px] leading-relaxed text-[var(--text-main)]">
              <code>{generateHtmlCssEmbed(config)}</code>
            </pre>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="btn-tactile rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 font-display text-xs font-semibold text-[var(--text-main)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    generateHtmlCssEmbed(config)
                  );
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-full bg-[#C2410C] px-5 py-2 font-display text-xs font-bold text-white hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
              >
                {codeCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Coming Soon Modal (when NEXT_PUBLIC_UPGRADE_URL is not yet configured) */}
      {showProModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="bento-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-[#C2410C] uppercase dark:text-[#FF6D29]">
              Coming soon
            </span>
            <h2
              id="pro-modal-title"
              className="mt-2 font-display text-2xl font-bold tracking-tight"
            >
              ADT Motion Pro
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Pro plans are currently in preparation. Right now all studio
              features are open to use directly in your browser.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="btn-tactile rounded-full bg-[#C2410C] px-5 py-2 font-display text-xs font-bold text-white hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
              >
                Back to Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Limit Modal (only shown when NEXT_PUBLIC_ENABLE_EXPORT_LIMIT=true) */}
      {showLimitModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="limit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="bento-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <span className="inline-block rounded-xl bg-[#C2410C]/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#C2410C] uppercase dark:bg-[#FF6D29]/15 dark:text-[#FF6D29]">
              Daily Limit Reached
            </span>
            <h2
              id="limit-modal-title"
              className="mt-3 font-display text-2xl font-bold tracking-tight"
            >
              Free export quota used ({getDailyExportLimit()}/day)
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              You have used all {getDailyExportLimit()} free exports for today.
              Upgrade to Pro for unlimited WebM, MP4, and GIF exports.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="btn-tactile rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 font-display text-xs font-semibold text-[var(--text-main)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = getUpgradeUrl();
                  if (url) {
                    window.open(url, "_blank", "noopener,noreferrer");
                  }
                }}
                className="btn-tactile rounded-full bg-[#C2410C] px-5 py-2 font-display text-xs font-bold text-white hover:opacity-90 dark:bg-[#FF6D29] dark:text-[#161316]"
              >
                Upgrade to Pro →
              </button>
            </div>
          </div>
        </div>
      )}
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
