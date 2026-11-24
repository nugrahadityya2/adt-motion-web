"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ASPECT_DIMENSIONS,
  MotionConfig,
  MotionLayer,
  renderCompositeFrame,
  renderMotionFrame,
} from "@/lib/motion-engine";
import { ParsedSvg, parseSvgToUnits } from "@/lib/svg-parser";

interface MotionCanvasProps {
  config: MotionConfig;
  layers?: MotionLayer[];
  activeLayerId?: string;
  bgImage?: string | null;
  isPlaying?: boolean;
  replayNonce?: number;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onProgress?: (progress: number) => void;
  onUnitsDetected?: (count: number) => void;
  onLayerDrag?: (layerId: string, dx: number, dy: number) => void;
  onBgImageError?: (message: string) => void;
  className?: string;
}

export function MotionCanvas({
  config,
  layers,
  activeLayerId,
  bgImage,
  isPlaying = true,
  replayNonce = 0,
  externalCanvasRef,
  onProgress,
  onUnitsDetected,
  onLayerDrag,
  onBgImageError,
  className = "",
}: MotionCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef ?? internalRef;
  const parsedSvgRef = useRef<ParsedSvg | null>(null);
  const parsedSvgsMapRef = useRef<Map<string, ParsedSvg | null>>(new Map());
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const onBgImageErrorRef = useRef(onBgImageError);
  onBgImageErrorRef.current = onBgImageError;
  const [bgVersion, setBgVersion] = useState(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];
  const effectiveBgImage = bgImage ?? config.bgImage ?? null;

  useEffect(() => {
    elapsedRef.current = 0;
  }, [replayNonce, config.template]);

  // Load uploaded background image reliably (supports Blob URLs & Data URLs)
  useEffect(() => {
    let cancelled = false;
    if (!effectiveBgImage) {
      bgImgRef.current = null;
      setBgVersion((v) => v + 1);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      bgImgRef.current = img;
      setBgVersion((v) => v + 1);
    };
    img.onerror = () => {
      if (cancelled) return;
      bgImgRef.current = null;
      setBgVersion((v) => v + 1);
      onBgImageErrorRef.current?.(
        "Format gambar tidak didukung browser. Gunakan JPG, PNG, atau WebP."
      );
    };
    img.src = effectiveBgImage;

    if (img.complete && img.naturalWidth > 0) {
      bgImgRef.current = img;
      setBgVersion((v) => v + 1);
    }

    return () => {
      cancelled = true;
    };
  }, [effectiveBgImage]);

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
          const charCount = (active.config.text.trim() || "ADT MOTION").replace(/\s/g, "").length;
          onUnitsDetected?.(charCount);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (config.mode !== "svg" || !config.svgMarkup) {
      parsedSvgRef.current = null;
      const charCount = (config.text.trim() || "ADT MOTION").replace(/\s/g, "").length;
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
  }, [config.mode, config.svgMarkup, config.text, layers, activeLayerId, onUnitsDetected]);

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

      const loopSec = Math.max(
        0.5,
        config.loopDurationSec / Math.max(0.2, config.speed)
      );

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
          bgImgRef.current,
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
          bgImgRef.current
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
  }, [config, layers, isPlaying, dims.width, dims.height, canvasRef, onProgress, bgVersion]);

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
    <canvas
      ref={canvasRef}
      width={dims.width}
      height={dims.height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`block max-h-full max-w-full object-contain ${
        config.bgColor === "transparent" && !effectiveBgImage
          ? "checkerboard-bg"
          : ""
      } ${onLayerDrag ? (isDragging ? "cursor-grabbing touch-none" : "cursor-grab touch-none") : ""} ${className}`}
      aria-label={`Motion preview: ${config.mode === "svg" ? config.svgFileName : config.text}`}
    />
  );
}
