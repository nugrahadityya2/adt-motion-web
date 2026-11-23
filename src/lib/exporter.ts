import { GIFEncoder, quantize, applyPalette } from "gifenc";
import {
  ASPECT_DIMENSIONS,
  MotionConfig,
  renderMotionFrame,
} from "./motion-engine";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadSvgImage(svgMarkup: string): Promise<HTMLImageElement | null> {
  if (!svgMarkup) return null;
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load SVG"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportToWebM(
  config: MotionConfig,
  onProgress?: (pct: number) => void
): Promise<void> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const dims = ASPECT_DIMENSIONS[config.aspectRatio];
  const offscreen = document.createElement("canvas");
  offscreen.width = dims.width;
  offscreen.height = dims.height;
  const ctx = offscreen.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  const svgImg =
    config.mode === "svg" ? await loadSvgImage(config.svgMarkup) : null;

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const stream = offscreen.captureStream(60);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 6_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const loopMs =
    Math.max(0.5, config.loopDurationSec / Math.max(0.2, config.speed)) * 1000;

  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
    recorder.start();

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / loopMs);
      renderMotionFrame(ctx, dims.width, dims.height, config, t % 1, svgImg);
      onProgress?.(Math.round(t * 100));

      if (elapsed < loopMs) {
        requestAnimationFrame(tick);
      } else {
        recorder.stop();
      }
    };
    requestAnimationFrame(tick);
  });

  const blob = new Blob(chunks, { type: "video/webm" });
  triggerDownload(blob, `typemotion-${config.template}.webm`);
}

export async function exportToGif(
  config: MotionConfig,
  onProgress?: (pct: number) => void
): Promise<void> {
  const dims = ASPECT_DIMENSIONS[config.aspectRatio];
  // Scale down slightly for fast, crisp GIF encoding
  const scale = 0.6;
  const w = Math.round(dims.width * scale);
  const h = Math.round(dims.height * scale);

  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  const svgImg =
    config.mode === "svg" ? await loadSvgImage(config.svgMarkup) : null;

  const fps = 24;
  const loopSec = Math.max(
    0.5,
    config.loopDurationSec / Math.max(0.2, config.speed)
  );
  const totalFrames = Math.max(12, Math.round(loopSec * fps));
  const delayMs = Math.round(1000 / fps);
  const isTransparent = config.bgColor === "transparent";

  const gif = GIFEncoder();

  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    renderMotionFrame(ctx, w, h, config, t, svgImg);
    const { data } = ctx.getImageData(0, 0, w, h);

    const palette = quantize(data, 256, {
      format: isTransparent ? "rgba4444" : "rgb565",
      oneBitAlpha: isTransparent,
    });
    const index = applyPalette(
      data,
      palette,
      isTransparent ? "rgba4444" : "rgb565"
    );

    const transparentIndex = isTransparent
      ? palette.findIndex((c) => c[3] === 0)
      : -1;

    gif.writeFrame(index, w, h, {
      palette,
      delay: delayMs,
      repeat: 0,
      transparent: isTransparent && transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
    });

    onProgress?.(Math.round(((i + 1) / totalFrames) * 100));
    // Yield to browser UI thread every 4 frames
    if (i % 4 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  gif.finish();
  const bytes = gif.bytes();
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "image/gif" });
  triggerDownload(blob, `typemotion-${config.template}.gif`);
}
