"use client";

import React, { useEffect, useRef } from "react";
import {
  ASPECT_DIMENSIONS,
  MotionConfig,
  renderMotionFrame,
} from "@/lib/motion-engine";
import { ParsedSvg, parseSvgToUnits } from "@/lib/svg-parser";

interface MotionCanvasProps {
  config: MotionConfig;
  isPlaying?: boolean;
  replayNonce?: number;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onProgress?: (progress: number) => void;
  onUnitsDetected?: (count: number) => void;
  className?: string;
}

export function MotionCanvas({
  config,
  isPlaying = true,
  replayNonce = 0,
  externalCanvasRef,
  onProgress,
  onUnitsDetected,
  className = "",
}: MotionCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef ?? internalRef;
  const parsedSvgRef = useRef<ParsedSvg | null>(null);
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];

  // Reset progress when user clicks Replay or switches template
  useEffect(() => {
    progressRef.current = 0;
  }, [replayNonce, config.template]);

  // Parse SVG into per-element units when in svg mode
  useEffect(() => {
    let cancelled = false;
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
  }, [config.mode, config.svgMarkup, config.text, onUnitsDetected]);

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

      if (isPlaying) {
        const loopSec = Math.max(
          0.5,
          config.loopDurationSec / Math.max(0.2, config.speed)
        );
        progressRef.current = (progressRef.current + dtSec / loopSec) % 1;
        onProgress?.(progressRef.current);
      }

      renderMotionFrame(
        ctx,
        dims.width,
        dims.height,
        config,
        progressRef.current,
        parsedSvgRef.current
      );

      if (isPlaying) {
        rafId = requestAnimationFrame(draw);
      }
    };

    lastTimeRef.current = null;
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [config, isPlaying, dims.width, dims.height, canvasRef, onProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={dims.width}
      height={dims.height}
      className={`block max-h-full max-w-full object-contain ${
        config.bgColor === "transparent" ? "checkerboard-bg" : ""
      } ${className}`}
      aria-label={`Motion preview: ${config.mode === "svg" ? config.svgFileName : config.text}`}
    />
  );
}
