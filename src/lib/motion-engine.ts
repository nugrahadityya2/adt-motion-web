export type MotionTemplate =
  | "circle"
  | "wave"
  | "stagger-rise"
  | "elastic-pop"
  | "kinetic-stretch"
  | "marquee-split";

export type FontOption =
  | "Outfit"
  | "JetBrains Mono"
  | "Space Grotesk"
  | "Instrument Serif"
  | "Syne"
  | "IBM Plex Mono"
  | "Bebas Neue"
  | "Playfair Display";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5";

export interface MotionConfig {
  mode: "text" | "svg";
  text: string;
  svgMarkup: string;
  font: FontOption;
  fontSize: number;
  letterSpacing: number;
  template: MotionTemplate;
  speed: number;
  stagger: number;
  intensity: number;
  color: string;
  bgColor: string;
  aspectRatio: AspectRatio;
  circleRadius: number;
  loopDurationSec: number;
}

export const ASPECT_DIMENSIONS: Record<
  AspectRatio,
  { width: number; height: number; label: string }
> = {
  "1:1": { width: 800, height: 800, label: "1:1 Square" },
  "16:9": { width: 960, height: 540, label: "16:9 Landscape" },
  "9:16": { width: 540, height: 960, label: "9:16 Vertical" },
  "4:5": { width: 640, height: 800, label: "4:5 Portrait" },
};

export const FONT_MAP: Record<FontOption, string> = {
  Outfit: "var(--font-display), 'Outfit', sans-serif",
  "JetBrains Mono": "var(--font-mono), 'JetBrains Mono', monospace",
  "Space Grotesk": "var(--font-grotesk), 'Space Grotesk', sans-serif",
  "Instrument Serif": "var(--font-serif), 'Instrument Serif', serif",
  Syne: "var(--font-syne), 'Syne', sans-serif",
  "IBM Plex Mono": "var(--font-mono), 'IBM Plex Mono', monospace",
  "Bebas Neue": "var(--font-bebas), 'Bebas Neue', sans-serif",
  "Playfair Display": "var(--font-playfair), 'Playfair Display', serif",
};

export const TEMPLATE_META: {
  id: MotionTemplate;
  name: string;
  tag: string;
  description: string;
}[] = [
  {
    id: "circle",
    name: "Circle Orbit",
    tag: "01",
    description: "Text arranged on a rotating orbital ring with radial pulse.",
  },
  {
    id: "wave",
    name: "Kinetic Wave",
    tag: "02",
    description: "Fluid per-glyph sine wave with configurable phase stagger.",
  },
  {
    id: "stagger-rise",
    name: "Stagger Rise",
    tag: "03",
    description: "Editorial masked reveal sliding cleanly into place.",
  },
  {
    id: "elastic-pop",
    name: "Elastic Pop",
    tag: "04",
    description: "Spring-eased scale and tilt impulse across characters.",
  },
  {
    id: "kinetic-stretch",
    name: "Type Stretch",
    tag: "05",
    description: "Rhythmic vertical/horizontal compression and shear.",
  },
  {
    id: "marquee-split",
    name: "Split Ribbon",
    tag: "06",
    description: "Dual-track opposing kinetic ticker with smooth wrap.",
  },
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return (
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  );
}

function resolveCanvasFont(font: FontOption, sizePx: number): string {
  // Read computed font-family from document if available so next/font variables resolve
  let family: string = font;
  if (typeof document !== "undefined") {
    const varName =
      font === "Outfit"
        ? "--font-display"
        : font === "JetBrains Mono" || font === "IBM Plex Mono"
          ? "--font-mono"
          : font === "Space Grotesk"
            ? "--font-grotesk"
            : font === "Instrument Serif"
              ? "--font-serif"
              : font === "Syne"
                ? "--font-syne"
                : font === "Bebas Neue"
                  ? "--font-bebas"
                  : "--font-playfair";
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (computed) {
      family = computed;
    }
  }
  const weight =
    font === "Outfit" || font === "Syne" || font === "Playfair Display"
      ? "700"
      : "500";
  return `${weight} ${sizePx}px ${family}, sans-serif`;
}

export function renderMotionFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  normalizedTime: number, // 0..1 seamless loop
  svgImage?: HTMLImageElement | null
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (config.bgColor && config.bgColor !== "transparent") {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  const intensityFactor = config.intensity / 100;
  const staggerFactor = config.stagger / 100; // 0..2
  const phase = (normalizedTime * Math.PI * 2) % (Math.PI * 2);

  if (config.mode === "svg" && svgImage && svgImage.complete && svgImage.naturalWidth > 0) {
    renderSvgMotion(ctx, width, height, config, normalizedTime, phase, intensityFactor, svgImage);
    ctx.restore();
    return;
  }

  const rawText = config.text.trim() || "ADT MOTION";
  ctx.fillStyle = config.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  if (config.template === "circle") {
    renderCircleTemplate(ctx, width, height, config, rawText, normalizedTime, phase, intensityFactor, staggerFactor);
  } else if (config.template === "marquee-split") {
    renderMarqueeSplitTemplate(ctx, width, height, config, rawText, normalizedTime, intensityFactor);
  } else {
    renderGlyphGridTemplate(ctx, width, height, config, rawText, normalizedTime, phase, intensityFactor, staggerFactor);
  }

  ctx.restore();
}

function renderCircleTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number,
  phase: number,
  intensityFactor: number,
  staggerFactor: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(16, config.fontSize * 0.72 * scale);
  ctx.font = resolveCanvasFont(config.font, fontSize);

  const singleLine = rawText.replace(/\n+/g, " • ") + " • ";
  const chars = Array.from(singleLine);
  const count = chars.length;
  const baseRadius = config.circleRadius * scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * Math.PI * 2);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const pulse =
      Math.sin(phase * 2 - i * 0.25 * (0.5 + staggerFactor)) *
      14 *
      intensityFactor *
      scale;
    const r = baseRadius + pulse;
    const charScale =
      1 +
      Math.sin(phase * 2 - i * 0.3 * (0.5 + staggerFactor)) *
        0.12 *
        intensityFactor;

    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -r);
    ctx.scale(charScale, charScale);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function renderMarqueeSplitTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number,
  intensityFactor: number
) {
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(20, config.fontSize * 0.9 * scale);
  ctx.font = resolveCanvasFont(config.font, fontSize);

  const lines = rawText.split("\n").filter(Boolean);
  const displayLines = lines.length > 1 ? lines : [rawText, rawText];
  const lineHeight = fontSize * 1.25;
  const totalHeight = displayLines.length * lineHeight;
  const startY = height / 2 - totalHeight / 2 + lineHeight / 2;

  displayLines.forEach((line, rowIdx) => {
    const chunk = `${line}   ✦   `;
    const metrics = ctx.measureText(chunk);
    const chunkWidth = Math.max(80, metrics.width + config.letterSpacing * chunk.length);
    const dir = rowIdx % 2 === 0 ? 1 : -1;
    const offset = ((t * chunkWidth * dir) % chunkWidth + chunkWidth) % chunkWidth;
    const y = startY + rowIdx * lineHeight;
    const skew = Math.sin(t * Math.PI * 2) * 0.14 * intensityFactor * dir;

    ctx.save();
    ctx.translate(0, y);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.textAlign = "left";

    for (let x = -chunkWidth + offset; x < width + chunkWidth; x += chunkWidth) {
      ctx.fillText(chunk, x, 0);
    }
    ctx.restore();
  });
}

function renderGlyphGridTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number,
  phase: number,
  intensityFactor: number,
  staggerFactor: number
) {
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(20, config.fontSize * scale);
  ctx.font = resolveCanvasFont(config.font, fontSize);

  const lines = rawText.split("\n");
  const lineHeight = fontSize * 1.18;
  const totalHeight = lines.length * lineHeight;
  const startY = height / 2 - totalHeight / 2 + lineHeight / 2;

  let globalGlyphIndex = 0;

  lines.forEach((line, lineIdx) => {
    const chars = Array.from(line);
    const widths = chars.map((ch) => ctx.measureText(ch).width + config.letterSpacing * scale);
    const totalLineWidth = widths.reduce((acc, w) => acc + w, 0);
    let cursorX = width / 2 - totalLineWidth / 2;
    const baseY = startY + lineIdx * lineHeight;

    chars.forEach((ch, idx) => {
      const charW = widths[idx];
      const cx = cursorX + charW / 2;
      cursorX += charW;

      const gIdx = globalGlyphIndex++;
      const delay = gIdx * 0.055 * (0.35 + staggerFactor);
      const localT = (t - delay + 10) % 1;

      ctx.save();

      if (config.template === "wave") {
        const yOff =
          Math.sin(phase - gIdx * 0.45 * (0.4 + staggerFactor)) *
          28 *
          intensityFactor *
          scale;
        const rot =
          Math.cos(phase - gIdx * 0.45 * (0.4 + staggerFactor)) *
          0.12 *
          intensityFactor;
        ctx.translate(cx, baseY + yOff);
        ctx.rotate(rot);
        ctx.fillText(ch, 0, 0);
      } else if (config.template === "stagger-rise") {
        // Clip each character's line box for editorial masked reveal
        const clipTop = baseY - lineHeight * 0.55;
        ctx.beginPath();
        ctx.rect(0, clipTop, width, lineHeight * 1.1);
        ctx.clip();

        let yOff = 0;
        let alpha = 1;
        if (localT < 0.35) {
          const p = easeInOutCubic(localT / 0.35);
          yOff = (1 - p) * lineHeight * 0.9 * intensityFactor;
          alpha = p;
        } else if (localT > 0.78) {
          const p = easeInOutCubic((localT - 0.78) / 0.22);
          yOff = -p * lineHeight * 0.9 * intensityFactor;
          alpha = 1 - p;
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(cx, baseY + yOff);
        ctx.fillText(ch, 0, 0);
      } else if (config.template === "elastic-pop") {
        const cycle = localT < 0.5 ? easeOutElastic(localT / 0.5) : 1 - easeInOutCubic((localT - 0.5) / 0.5) * 0.25;
        const s = 0.65 + cycle * 0.45 * intensityFactor;
        const rot = Math.sin(localT * Math.PI * 2) * 0.16 * intensityFactor;
        ctx.translate(cx, baseY);
        ctx.rotate(rot);
        ctx.scale(s, s);
        ctx.fillText(ch, 0, 0);
      } else if (config.template === "kinetic-stretch") {
        const wave = Math.sin(phase - gIdx * 0.35 * (0.4 + staggerFactor));
        const sx = 1 + wave * 0.28 * intensityFactor;
        const sy = 1 - wave * 0.22 * intensityFactor;
        ctx.translate(cx, baseY);
        ctx.scale(sx, sy);
        ctx.fillText(ch, 0, 0);
      }

      ctx.restore();
    });
  });
}

function renderSvgMotion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  t: number,
  phase: number,
  intensityFactor: number,
  svgImage: HTMLImageElement
) {
  const maxDim = Math.min(width, height) * 0.56;
  const aspect = svgImage.naturalWidth / Math.max(1, svgImage.naturalHeight);
  const drawW = aspect >= 1 ? maxDim : maxDim * aspect;
  const drawH = aspect >= 1 ? maxDim / aspect : maxDim;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  if (config.template === "circle") {
    ctx.rotate(t * Math.PI * 2);
    const pulse = 1 + Math.sin(phase * 2) * 0.08 * intensityFactor;
    ctx.scale(pulse, pulse);
    ctx.drawImage(svgImage, -drawW / 2, -drawH / 2, drawW, drawH);
  } else if (config.template === "wave") {
    // Slice SVG into vertical strips for fluid wave motion
    const slices = 18;
    const sliceW = drawW / slices;
    const srcSliceW = svgImage.naturalWidth / slices;
    for (let i = 0; i < slices; i++) {
      const yOff = Math.sin(phase - i * 0.35) * 20 * intensityFactor;
      ctx.drawImage(
        svgImage,
        i * srcSliceW,
        0,
        srcSliceW,
        svgImage.naturalHeight,
        -drawW / 2 + i * sliceW,
        -drawH / 2 + yOff,
        sliceW + 0.5,
        drawH
      );
    }
  } else if (config.template === "stagger-rise") {
    const p = t < 0.5 ? easeInOutCubic(t / 0.5) : 1 - easeInOutCubic((t - 0.5) / 0.5) * 0.2;
    const yOff = (1 - p) * 60 * intensityFactor;
    ctx.globalAlpha = Math.min(1, p * 1.4);
    ctx.translate(0, yOff);
    ctx.drawImage(svgImage, -drawW / 2, -drawH / 2, drawW, drawH);
  } else if (config.template === "elastic-pop") {
    const s = 0.75 + easeOutElastic(t < 0.6 ? t / 0.6 : 1) * 0.3 * intensityFactor;
    ctx.scale(s, s);
    ctx.drawImage(svgImage, -drawW / 2, -drawH / 2, drawW, drawH);
  } else if (config.template === "kinetic-stretch") {
    const wave = Math.sin(phase);
    ctx.scale(1 + wave * 0.22 * intensityFactor, 1 - wave * 0.18 * intensityFactor);
    ctx.drawImage(svgImage, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    const xOff = Math.sin(phase) * 90 * intensityFactor;
    ctx.translate(xOff, 0);
    ctx.drawImage(svgImage, -drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore();
}
