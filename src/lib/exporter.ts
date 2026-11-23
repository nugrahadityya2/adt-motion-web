import { GIFEncoder, quantize, applyPalette } from "gifenc";
import {
  ASPECT_DIMENSIONS,
  ExportFps,
  ExportResolution,
  MotionConfig,
  renderMotionFrame,
} from "./motion-engine";
import { parseSvgToUnits } from "./svg-parser";

const RESOLUTION_SCALE: Record<ExportResolution, number> = {
  "240p": 0.3,
  "720p": 0.9,
  "1080p": 1.35,
  "4k": 2.4,
};

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

export async function exportMotionVideo(
  config: MotionConfig,
  format: "webm" | "mp4",
  resolution: ExportResolution = "1080p",
  fps: ExportFps = 30,
  onProgress?: (pct: number) => void
): Promise<{ actualFormat: "webm" | "mp4" }> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const baseDims = ASPECT_DIMENSIONS[config.aspectRatio];
  const mult = RESOLUTION_SCALE[resolution];
  const width = Math.round((baseDims.width * mult) / 2) * 2;
  const height = Math.round((baseDims.height * mult) / 2) * 2;

  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  const parsedSvg =
    config.mode === "svg" ? await parseSvgToUnits(config.svgMarkup) : null;

  let actualFormat: "webm" | "mp4" = format;
  let mimeType = "video/webm";

  if (format === "mp4") {
    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
      mimeType = "video/mp4;codecs=avc1";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
    } else {
      actualFormat = "webm";
      mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
    }
  } else {
    mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
  }

  const stream = offscreen.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: resolution === "4k" ? 14_000_000 : 8_000_000,
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
      renderMotionFrame(ctx, width, height, config, t % 1, parsedSvg);
      onProgress?.(Math.round(t * 100));

      if (elapsed < loopMs) {
        requestAnimationFrame(tick);
      } else {
        recorder.stop();
      }
    };
    requestAnimationFrame(tick);
  });

  const blob = new Blob(chunks, {
    type: actualFormat === "mp4" ? "video/mp4" : "video/webm",
  });
  triggerDownload(blob, `adt-motion-${config.template}.${actualFormat}`);
  return { actualFormat };
}

export async function exportToGif(
  config: MotionConfig,
  resolution: ExportResolution = "720p",
  fps: ExportFps = 24,
  onProgress?: (pct: number) => void
): Promise<void> {
  const baseDims = ASPECT_DIMENSIONS[config.aspectRatio];
  const mult = Math.min(1, RESOLUTION_SCALE[resolution] * 0.75);
  const w = Math.max(160, Math.round(baseDims.width * mult));
  const h = Math.max(160, Math.round(baseDims.height * mult));

  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  const parsedSvg =
    config.mode === "svg" ? await parseSvgToUnits(config.svgMarkup) : null;

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
    renderMotionFrame(ctx, w, h, config, t, parsedSvg);
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
  triggerDownload(blob, `adt-motion-${config.template}.gif`);
}
