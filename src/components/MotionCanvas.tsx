"use client";

import React, { useEffect, useRef } from "react";
import {
  ASPECT_DIMENSIONS,
  MotionConfig,
  renderMotionFrame,
} from "@/lib/motion-engine";

interface MotionCanvasProps {
  config: MotionConfig;
  isPlaying?: boolean;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onProgress?: (progress: number) => void;
  className?: string;
}

export function MotionCanvas({
  config,
  isPlaying = true,
  externalCanvasRef,
  onProgress,
  className = "",
}: MotionCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef ?? internalRef;
  const svgImgRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];

  // Load SVG markup into an HTMLImageElement when in svg mode
  useEffect(() => {
    if (config.mode !== "svg" || !config.svgMarkup) {
      svgImgRef.current = null;
      return;
    }

    const blob = new Blob([config.svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      svgImgRef.current = img;
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [config.mode, config.svgMarkup]);

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
        const loopSec = Math.max(0.5, config.loopDurationSec / Math.max(0.2, config.speed));
        progressRef.current = (progressRef.current + dtSec / loopSec) % 1;
        onProgress?.(progressRef.current);
      }

      renderMotionFrame(
        ctx,
        dims.width,
        dims.height,
        config,
        progressRef.current,
        svgImgRef.current
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
      className={`block max-w-full max-h-full object-contain ${
        config.bgColor === "transparent" ? "checkerboard-bg" : ""
      } ${className}`}
      aria-label={`Motion preview: ${config.mode === "svg" ? "SVG graphic" : config.text}`}
    />
  );
}
