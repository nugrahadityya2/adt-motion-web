"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ASPECT_DIMENSIONS,
  BgMediaElement,
  CursorModeOption,
  getEffectiveLoopSec,
  MotionConfig,
  MotionLayer,
  renderCompositeFrame,
  renderMotionFrame,
  StageBackdrop,
} from "@/lib/motion-engine";
import { ParsedSvg, parseSvgToUnits } from "@/lib/svg-parser";

export type SafeZoneMode = "none" | "reels" | "tiktok" | "shorts";

export interface BgMediaSource {
  url: string;
  type: "image" | "video";
}

interface MotionCanvasProps {
  config: MotionConfig;
  layers?: MotionLayer[];
  activeLayerId?: string;
  bgMedia?: BgMediaSource | null;
  backdrop?: StageBackdrop | null;
  safeZone?: SafeZoneMode;
  cursorMode?: CursorModeOption;
  audioEnergyRef?: React.RefObject<number>;
  scrubTimeSec?: number | null;
  isPlaying?: boolean;
  replayNonce?: number;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onProgress?: (progress: number, elapsedSec: number) => void;
  onUnitsDetected?: (count: number) => void;
  onLayerDrag?: (layerId: string, dx: number, dy: number) => void;
  onBgMediaError?: (message: string) => void;
  className?: string;
}

export function MotionCanvas({
  config,
  layers,
  activeLayerId,
  bgMedia,
  backdrop,
  safeZone = "none",
  cursorMode = "off",
  audioEnergyRef,
  scrubTimeSec = null,
  isPlaying = true,
  replayNonce = 0,
  externalCanvasRef,
  onProgress,
  onUnitsDetected,
  onLayerDrag,
  onBgMediaError,
  className = "",
}: MotionCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef ?? internalRef;
  const parsedSvgRef = useRef<ParsedSvg | null>(null);
  const parsedSvgsMapRef = useRef<Map<string, ParsedSvg | null>>(new Map());
  const bgMediaElRef = useRef<BgMediaElement>(null);
  const onBgMediaErrorRef = useRef(onBgMediaError);
  onBgMediaErrorRef.current = onBgMediaError;
  const [bgVersion, setBgVersion] = useState(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const cursorRef = useRef({ x: 0, y: 0, active: false });
  const [isDragging, setIsDragging] = useState(false);

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];
  const effectiveBgMedia: BgMediaSource | null =
    bgMedia ??
    (config.bgImage ? { url: config.bgImage, type: "image" } : null);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [replayNonce, config.template]);

  useEffect(() => {
    if (scrubTimeSec !== null) {
      elapsedRef.current = scrubTimeSec;
    }
  }, [scrubTimeSec]);

  // Load uploaded background image or video
  useEffect(() => {
    let cancelled = false;
    if (!effectiveBgMedia) {
      bgMediaElRef.current = null;
      setBgVersion((v) => v + 1);
      return;
    }

    if (effectiveBgMedia.type === "video") {
      const video = document.createElement("video");
      video.src = effectiveBgMedia.url;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.onloadeddata = () => {
        if (cancelled) return;
        bgMediaElRef.current = video;
        video.play().catch(() => {});
        setBgVersion((v) => v + 1);
      };
      video.onerror = () => {
        if (cancelled) return;
        bgMediaElRef.current = null;
        setBgVersion((v) => v + 1);
        onBgMediaErrorRef.current?.(
          "Video format could not be decoded. Use MP4 (H.264) or WebM."
        );
      };
      return () => {
        cancelled = true;
        video.pause();
        video.src = "";
      };
    }

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      bgMediaElRef.current = img;
      setBgVersion((v) => v + 1);
    };
    img.onerror = () => {
      if (cancelled) return;
      bgMediaElRef.current = null;
      setBgVersion((v) => v + 1);
      onBgMediaErrorRef.current?.(
        "Image format not supported by browser. Use JPG, PNG, or WebP."
      );
    };
    img.src = effectiveBgMedia.url;

    if (img.complete && img.naturalWidth > 0) {
      bgMediaElRef.current = img;
      setBgVersion((v) => v + 1);
    }

    return () => {
      cancelled = true;
    };
  }, [effectiveBgMedia?.url, effectiveBgMedia?.type]);

  // Pause/play background video alongside animation state
  useEffect(() => {
    const media = bgMediaElRef.current;
    if (media instanceof HTMLVideoElement) {
      if (isPlaying) {
        media.play().catch(() => {});
      } else {
        media.pause();
      }
    }
  }, [isPlaying, bgVersion]);

  // Parse SVG for single-config mode or multi-layer mode
  useEffect(() => {
    let cancelled = false;

    if (layers && layers.length > 0) {
      Promise.all(
        layers.map(async (layer) => {
          if (layer.config.mode !== "svg" || !layer.config.svgMarkup) {
            return [layer.id, null] as const;
          }
          const parsed = await parseSvgToUnits(layer.config.svgMarkup);
          return [layer.id, parsed] as const;
        })
      ).then((entries) => {
        if (cancelled) return;
        const map = new Map<string, ParsedSvg | null>();
        entries.forEach(([id, parsed]) => map.set(id, parsed));
        parsedSvgsMapRef.current = map;

        const active = layers.find((l) => l.id === activeLayerId) ?? layers[0];
        if (active.config.mode === "svg") {
          onUnitsDetected?.(map.get(active.id)?.units.length ?? 0);
        } else {
          const charCount = (
            active.config.text.trim() || "ADT MOTION"
          ).replace(/\s/g, "").length;
          onUnitsDetected?.(charCount);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (config.mode !== "svg" || !config.svgMarkup) {
      parsedSvgRef.current = null;
      const charCount = (config.text.trim() || "ADT MOTION").replace(
        /\s/g,
        ""
      ).length;
      onUnitsDetected?.(charCount);
      return;
    }

    parseSvgToUnits(config.svgMarkup).then((parsed) => {
      if (cancelled) return;
      parsedSvgRef.current = parsed;
      onUnitsDetected?.(parsed.units.length);
    });

    return () => {
      cancelled = true;
    };
  }, [
    config.mode,
    config.svgMarkup,
    config.text,
    layers,
    activeLayerId,
    onUnitsDetected,
  ]);

  useEffect(() => {
    let rafId = 0;

    const draw = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dtSec = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const loopSec = getEffectiveLoopSec(config);

      if (isPlaying && scrubTimeSec === null) {
        elapsedRef.current += dtSec;
      }
      onProgress?.((elapsedRef.current / loopSec) % 1, elapsedRef.current);

      const audioEnergy = audioEnergyRef?.current ?? 0;

      if (layers && layers.length > 0) {
        renderCompositeFrame(
          ctx,
          dims.width,
          dims.height,
          layers,
          config.bgColor,
          bgMediaElRef.current,
          elapsedRef.current,
          parsedSvgsMapRef.current,
          backdrop,
          {
            audioEnergy,
            cursorMode,
            cursorX: cursorRef.current.x,
            cursorY: cursorRef.current.y,
            cursorActive: cursorRef.current.active,
          }
        );
      } else {
        renderMotionFrame(
          ctx,
          dims.width,
          dims.height,
          config,
          (elapsedRef.current / loopSec) % 1,
          parsedSvgRef.current,
          bgMediaElRef.current
        );
      }

      if (isPlaying || cursorMode !== "off") {
        rafId = requestAnimationFrame(draw);
      }
    };

    lastTimeRef.current = null;
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    config,
    layers,
    backdrop,
    cursorMode,
    scrubTimeSec,
    isPlaying,
    dims.width,
    dims.height,
    canvasRef,
    onProgress,
    audioEnergyRef,
    bgVersion,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onLayerDrag) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        cursorRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
          active: true,
        };

        if (onLayerDrag && dragRef.current) {
          const dx = ((e.clientX - dragRef.current.x) / rect.width) * 800;
          const dy = ((e.clientY - dragRef.current.y) / rect.height) * 800;
          dragRef.current = { x: e.clientX, y: e.clientY };

          const targetId = activeLayerId ?? layers?.[0]?.id ?? "layer-1";
          onLayerDrag(targetId, dx, dy);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    cursorRef.current.active = false;
  };

  return (
    <div
      className="relative max-h-full max-w-full shrink-0"
      style={{
        aspectRatio: `${dims.width} / ${dims.height}`,
        height: dims.height >= dims.width ? "100%" : "auto",
        width: dims.width > dims.height ? "100%" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        width={dims.width}
        height={dims.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`block h-full w-full ${
          config.bgColor === "transparent" &&
          !effectiveBgMedia &&
          !backdrop?.useGradient
            ? "checkerboard-bg"
            : ""
        } ${
          onLayerDrag
            ? isDragging
              ? "cursor-grabbing touch-none"
              : "cursor-grab touch-none"
            : ""
        } ${className}`}
        aria-label={`Motion preview: ${
          config.mode === "svg" ? config.svgFileName : config.text
        }`}
      />

      {/* Non-exported Social Safe-Zone Guide Overlay */}
      {safeZone !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
        >
          <div
            className="absolute inset-x-0 top-0 border-b border-dashed border-[#FF6D29]/80 bg-[#FF6D29]/15"
            style={{ height: safeZone === "tiktok" ? "11%" : "13%" }}
          >
            <span className="absolute bottom-1 left-2 font-mono text-[9px] font-semibold text-[#FF6D29] uppercase">
              {safeZone} top UI
            </span>
          </div>

          <div
            className="absolute right-0 border-l border-dashed border-[#FF6D29]/80 bg-[#FF6D29]/15"
            style={{
              top: safeZone === "reels" ? "46%" : "42%",
              bottom: safeZone === "shorts" ? "20%" : "24%",
              width: "15%",
            }}
          />

          <div
            className="absolute inset-x-0 bottom-0 border-t border-dashed border-[#FF6D29]/80 bg-[#FF6D29]/15"
            style={{
              height:
                safeZone === "reels"
                  ? "24%"
                  : safeZone === "tiktok"
                    ? "22%"
                    : "20%",
            }}
          >
            <span className="absolute top-1 left-2 font-mono text-[9px] font-semibold text-[#FF6D29] uppercase">
              Caption &amp; controls zone
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
