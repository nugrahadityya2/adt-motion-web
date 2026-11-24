"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ASPECT_DIMENSIONS,
  BgMediaElement,
  getEffectiveLoopSec,
  MotionConfig,
  MotionLayer,
  renderCompositeFrame,
  renderMotionFrame,
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
  safeZone?: SafeZoneMode;
  isPlaying?: boolean;
  replayNonce?: number;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onProgress?: (progress: number) => void;
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
  safeZone = "none",
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
  const [isDragging, setIsDragging] = useState(false);

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];
  const effectiveBgMedia: BgMediaSource | null =
    bgMedia ??
    (config.bgImage ? { url: config.bgImage, type: "image" } : null);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [replayNonce, config.template]);

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

      if (isPlaying) {
        elapsedRef.current += dtSec;
        onProgress?.((elapsedRef.current / loopSec) % 1);
      }

      if (layers && layers.length > 0) {
        renderCompositeFrame(
          ctx,
          dims.width,
          dims.height,
          layers,
          config.bgColor,
          bgMediaElRef.current,
          elapsedRef.current,
          parsedSvgsMapRef.current
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

      if (isPlaying) {
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
    isPlaying,
    dims.width,
    dims.height,
    canvasRef,
    onProgress,
    bgVersion,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onLayerDrag) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onLayerDrag || !dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = ((e.clientX - dragRef.current.x) / rect.width) * 800;
    const dy = ((e.clientY - dragRef.current.y) / rect.height) * 800;
    dragRef.current = { x: e.clientX, y: e.clientY };

    const targetId = activeLayerId ?? layers?.[0]?.id ?? "layer-1";
    onLayerDrag(targetId, dx, dy);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <div className="relative flex max-h-full max-w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dims.width}
        height={dims.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`block max-h-full max-w-full object-contain ${
          config.bgColor === "transparent" && !effectiveBgMedia
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
          {/* Top header dead zone */}
          <div
            className="absolute inset-x-0 top-0 border-b border-dashed border-[#FF6D29]/80 bg-[#FF6D29]/15"
            style={{ height: safeZone === "tiktok" ? "11%" : "13%" }}
          >
            <span className="absolute bottom-1 left-2 font-mono text-[9px] font-semibold text-[#FF6D29] uppercase">
              {safeZone} top UI
            </span>
          </div>

          {/* Right action buttons dead zone */}
          <div
            className="absolute right-0 border-l border-dashed border-[#FF6D29]/80 bg-[#FF6D29]/15"
            style={{
              top: safeZone === "reels" ? "46%" : "42%",
              bottom: safeZone === "shorts" ? "20%" : "24%",
              width: "15%",
            }}
          />

          {/* Bottom caption & audio dead zone */}
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
