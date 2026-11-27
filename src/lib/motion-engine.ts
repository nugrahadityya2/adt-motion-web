import {
  MotionTemplate,
  TEMPLATE_CATEGORIES,
  TEMPLATE_META,
  type TemplateCategory,
} from "./motion-templates";
import type { ParsedSvg } from "./svg-parser";

export type { MotionTemplate, TemplateCategory };
export { TEMPLATE_META, TEMPLATE_CATEGORIES };

export type BuiltInFontOption =
  | "Outfit"
  | "Plus Jakarta Sans"
  | "JetBrains Mono"
  | "Space Grotesk"
  | "Instrument Serif"
  | "Syne"
  | "IBM Plex Mono"
  | "Bebas Neue"
  | "Playfair Display"
  | "Anton"
  | "DM Serif Display"
  | "Oswald"
  | "Bricolage Grotesque"
  | "Cormorant Garamond";

export type FontOption = BuiltInFontOption | (string & {});

export type FontWeightOption = "400" | "500" | "700" | "800";
export type FontStyleOption = "normal" | "italic";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5";
export type DirectionOption = "up" | "down" | "left" | "right";
export type EaseStyleOption = "linear" | "smooth" | "snappy";
export type PatternOption = "straight" | "circle";
export type WaveDensityOption = "loose" | "normal" | "tight";
export type JitterAxisOption = "x" | "y" | "spin" | "both";
export type ExportResolution = "240p" | "720p" | "1080p" | "4k";
export type ExportFps = 24 | 30 | 60;
export type BlendModeOption =
  | "source-over"
  | "difference"
  | "screen"
  | "multiply"
  | "overlay";

export type CursorModeOption = "off" | "magnetic" | "repel" | "tilt";

export interface StageBackdrop {
  useGradient: boolean;
  gradientA: string;
  gradientB: string;
  gradientAngle: number;
  animateGradient: boolean;
  grain: number; // 0..60
}

export interface FrameInteraction {
  audioEnergy?: number; // 0..1 from Web Audio AnalyserNode
  cursorMode?: CursorModeOption;
  cursorX?: number; // -1..1 normalized canvas coords
  cursorY?: number; // -1..1 normalized canvas coords
  cursorActive?: boolean;
}

export interface MotionConfig {
  mode: "text" | "svg";
  text: string;
  svgMarkup: string;
  svgFileName: string;
  font: FontOption;
  fontWeight: FontWeightOption;
  fontStyle: FontStyleOption;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  autoFit: boolean;
  template: MotionTemplate;
  speed: number;
  stagger: number;
  intensity: number;
  color: string;
  bgColor: string;
  bgImage?: string | null;
  offsetX?: number;
  offsetY?: number;
  aspectRatio: AspectRatio;
  circleRadius: number;
  loopDurationSec: number;
  startDelaySec?: number;
  opacity?: number;
  blendMode?: BlendModeOption;
  // Contextual motion tuning controls
  pattern: PatternOption;
  direction: DirectionOption;
  easeStyle: EaseStyleOption;
  circleDirection: "cw" | "ccw";
  arcCoverage: number;
  letterFacing: "outward" | "inward";
  waveDensity: WaveDensityOption;
  tilt: number;
  jitterAxis: JitterAxisOption;
}

export interface MotionLayer {
  id: string;
  name: string;
  visible: boolean;
  config: MotionConfig;
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

export const FONT_MAP: Record<BuiltInFontOption, string> = {
  Outfit: "var(--font-display), 'Outfit', sans-serif",
  "Plus Jakarta Sans": "var(--font-sans), 'Plus Jakarta Sans', sans-serif",
  "JetBrains Mono": "var(--font-mono), 'JetBrains Mono', monospace",
  "Space Grotesk": "var(--font-grotesk), 'Space Grotesk', sans-serif",
  "Instrument Serif": "var(--font-serif), 'Instrument Serif', serif",
  Syne: "var(--font-syne), 'Syne', sans-serif",
  "IBM Plex Mono": "var(--font-mono), 'IBM Plex Mono', monospace",
  "Bebas Neue": "var(--font-bebas), 'Bebas Neue', sans-serif",
  "Playfair Display": "var(--font-playfair), 'Playfair Display', serif",
  Anton: "var(--font-anton), 'Anton', sans-serif",
  "DM Serif Display": "var(--font-dm-serif), 'DM Serif Display', serif",
  Oswald: "var(--font-oswald), 'Oswald', sans-serif",
  "Bricolage Grotesque": "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
  "Cormorant Garamond": "var(--font-cormorant), 'Cormorant Garamond', serif",
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function easeBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

function applyEase(t: number, style: EaseStyleOption): number {
  if (style === "linear") return t;
  if (style === "snappy") return easeOutBack(Math.min(1, Math.max(0, t)));
  return easeInOutCubic(Math.min(1, Math.max(0, t)));
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function resolveCanvasFont(
  font: FontOption,
  sizePx: number,
  fontWeight: FontWeightOption = "500",
  fontStyle: FontStyleOption = "normal"
): string {
  let family: string = `"${font}"`;
  if (typeof document !== "undefined") {
    const varMap: Record<BuiltInFontOption, string> = {
      Outfit: "--font-display",
      "Plus Jakarta Sans": "--font-sans",
      "JetBrains Mono": "--font-mono",
      "Space Grotesk": "--font-grotesk",
      "Instrument Serif": "--font-serif",
      Syne: "--font-syne",
      "IBM Plex Mono": "--font-mono",
      "Bebas Neue": "--font-bebas",
      "Playfair Display": "--font-playfair",
      Anton: "--font-anton",
      "DM Serif Display": "--font-dm-serif",
      Oswald: "--font-oswald",
      "Bricolage Grotesque": "--font-bricolage",
      "Cormorant Garamond": "--font-cormorant",
    };
    const varName = varMap[font as BuiltInFontOption];
    if (varName) {
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (computed) family = computed;
    }
  }
  return `${fontStyle} ${fontWeight} ${sizePx}px ${family}, sans-serif`;
}

interface UnitTransform {
  dx: number;
  dy: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  skewX: number;
  alpha: number;
  blur: number;
  rgbSplit: number;
  clipProgress: number; // 0..1 (1 = unclipped)
  glow: number;
  visible: boolean;
}

function computeUnitTransform(
  template: MotionTemplate,
  gIdx: number,
  totalUnits: number,
  t: number, // 0..1
  scale: number,
  config: MotionConfig
): UnitTransform {
  const intensity = config.intensity / 100;
  const staggerNorm = (config.stagger / 100) * 0.045;
  const delay = gIdx * staggerNorm;
  // Normalize entrance progress in 0..0.75, hold 0.75..1.0 so loops feel intentional
  const rawPhase = (t - delay + 10) % 1;
  const enter = Math.min(1, rawPhase / 0.55);
  const eased = applyEase(enter, config.easeStyle);
  const phase = t * Math.PI * 2;

  const dirVec =
    config.direction === "up"
      ? { x: 0, y: 1 }
      : config.direction === "down"
        ? { x: 0, y: -1 }
        : config.direction === "left"
          ? { x: 1, y: 0 }
          : { x: -1, y: 0 };

  const out: UnitTransform = {
    dx: 0,
    dy: 0,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    skewX: 0,
    alpha: 1,
    blur: 0,
    rgbSplit: 0,
    clipProgress: 1,
    glow: 0,
    visible: true,
  };

  switch (template) {
    case "stagger-fade": {
      out.alpha = eased;
      break;
    }
    case "slide-fade": {
      const dist = 48 * intensity * scale;
      out.dx = (1 - eased) * dist * dirVec.x;
      out.dy = (1 - eased) * dist * dirVec.y;
      out.alpha = eased;
      break;
    }
    case "typewriter":
    case "typewriter-caret": {
      const stepIndex = Math.floor(t * (totalUnits + 2));
      out.visible = gIdx < stepIndex;
      break;
    }
    case "letter-reveal":
    case "curtain-rise": {
      out.clipProgress = eased;
      out.dy = (1 - eased) * 26 * intensity * scale * dirVec.y;
      out.dx = (1 - eased) * 26 * intensity * scale * dirVec.x;
      break;
    }
    case "glitch-snap": {
      const snap = enter < 0.75 ? Math.sin(t * 95 + gIdx * 7.3) : 0;
      const amp = (1 - enter) * 24 * intensity * scale;
      if (config.jitterAxis === "x" || config.jitterAxis === "both")
        out.dx = snap * amp;
      if (config.jitterAxis === "y" || config.jitterAxis === "both")
        out.dy = Math.cos(t * 80 + gIdx * 5) * amp;
      if (config.jitterAxis === "spin") out.rotate = snap * 0.35 * intensity;
      out.alpha = enter < 0.2 ? 0.3 : 1;
      break;
    }
    case "skew-swoosh": {
      out.dx = (1 - eased) * 90 * intensity * scale * (dirVec.x || 1);
      out.dy = (1 - eased) * 20 * intensity * scale * dirVec.y;
      out.skewX = (1 - eased) * 0.45 * intensity;
      out.alpha = Math.min(1, eased * 1.4);
      break;
    }
    case "chaos-converge":
    case "magnetic-slam": {
      const rx = (pseudoRandom(gIdx + 1) - 0.5) * 260 * intensity * scale;
      const ry = (pseudoRandom(gIdx + 41) - 0.5) * 220 * intensity * scale;
      const rr = (pseudoRandom(gIdx + 99) - 0.5) * 1.6 * intensity;
      const p = template === "magnetic-slam" ? easeOutBack(enter) : eased;
      out.dx = (1 - p) * rx;
      out.dy = (1 - p) * ry;
      out.rotate = (1 - p) * rr;
      out.alpha = Math.min(1, enter * 1.6);
      break;
    }
    case "ribbon-cascade": {
      const p = easeOutCubic(enter);
      out.dx = (1 - p) * 140 * intensity * scale * (dirVec.x || -1);
      out.dy = Math.sin(p * Math.PI) * -28 * intensity * scale;
      out.rotate = (1 - p) * 0.28 * intensity;
      out.alpha = Math.min(1, enter * 1.5);
      break;
    }
    case "zoom-blur-pop": {
      const p = easeOutCubic(enter);
      const s = 1 + (1 - p) * 1.3 * intensity;
      out.scaleX = s;
      out.scaleY = s;
      out.blur = (1 - p) * 12 * intensity;
      out.alpha = Math.min(1, p * 1.3);
      break;
    }
    case "staggered-blur-up": {
      const p = easeOutCubic(enter);
      out.dy = (1 - p) * 38 * intensity * scale * (dirVec.y || 1);
      out.blur = (1 - p) * 10 * intensity;
      out.alpha = p;
      break;
    }
    case "kinetic-wave-loop":
    case "wave": {
      const freq =
        config.waveDensity === "loose"
          ? 0.28
          : config.waveDensity === "tight"
            ? 0.72
            : 0.45;
      const dirSign = config.direction === "left" ? -1 : 1;
      const w = Math.sin(phase - gIdx * freq * dirSign);
      out.dy = w * 28 * intensity * scale;
      out.rotate =
        Math.cos(phase - gIdx * freq * dirSign) *
        0.12 *
        intensity *
        (config.tilt / 50);
      break;
    }
    case "elastic-stretch": {
      const p = easeOutElastic(enter);
      out.scaleX = 0.6 + p * 0.4;
      out.scaleY = 1.4 - p * 0.4;
      break;
    }
    case "glitch-rgb-split": {
      const burst = enter < 0.7 ? Math.sin(t * 70 + gIdx * 3) : 0;
      out.rgbSplit = (1 - enter) * 14 * intensity * scale * (0.5 + Math.abs(burst));
      out.dx = burst * 6 * intensity * scale * (1 - enter);
      break;
    }
    case "breathing-pulse": {
      const s = 1 + Math.sin(phase - gIdx * 0.2) * 0.14 * intensity;
      out.scaleX = s;
      out.scaleY = s;
      out.alpha = 0.75 + 0.25 * Math.cos(phase - gIdx * 0.2);
      break;
    }
    case "slant-momentum": {
      const p = easeOutBack(enter);
      out.skewX = (1 - p) * -0.55 * intensity;
      out.dx = (1 - p) * 50 * intensity * scale;
      out.alpha = Math.min(1, enter * 1.5);
      break;
    }
    case "optical-focus": {
      const focusCurve = Math.abs(Math.sin(phase * 0.5 - gIdx * 0.15));
      out.blur = (1 - enter) * 14 * intensity + focusCurve * 2 * intensity;
      out.scaleX = 1 + (1 - enter) * 0.2 * intensity;
      out.scaleY = out.scaleX;
      out.alpha = Math.min(1, enter * 1.4);
      break;
    }
    case "glitch-stutter": {
      const quant = Math.floor(enter * 5) / 5;
      out.scaleX = 0.2 + quant * 0.8;
      out.visible = quant > 0.05;
      break;
    }
    case "liquid-wave": {
      const freq =
        config.waveDensity === "loose"
          ? 0.25
          : config.waveDensity === "tight"
            ? 0.65
            : 0.4;
      const w = Math.sin(phase - gIdx * freq);
      out.skewX = w * 0.3 * intensity;
      out.dy = Math.cos(phase - gIdx * freq) * 14 * intensity * scale;
      break;
    }
    case "accent-pop":
    case "serif-bloom": {
      const p =
        template === "accent-pop"
          ? easeOutBack(enter)
          : easeOutCubic(enter) * (1 + Math.sin(enter * Math.PI) * 0.08);
      const s = 0.4 + p * 0.6;
      out.scaleX = s;
      out.scaleY = s;
      out.alpha = Math.min(1, enter * 1.5);
      break;
    }
    case "card-flip-cascade": {
      const p = easeInOutCubic(enter);
      out.scaleX = Math.max(0.05, Math.abs(Math.cos((1 - p) * Math.PI * 0.5)));
      out.alpha = p;
      break;
    }
    case "neon-flicker": {
      const flicker =
        enter < 0.75
          ? pseudoRandom(Math.floor(t * 45) + gIdx * 13) > 0.38
            ? 1
            : 0.15
          : 1;
      out.alpha = flicker;
      out.glow = flicker > 0.5 ? 14 * intensity : 0;
      break;
    }
    case "gravity-bounce": {
      const b = easeBounce(enter);
      out.dy = -(1 - b) * 150 * intensity * scale;
      out.alpha = Math.min(1, enter * 2);
      break;
    }
    case "shockwave-ripple": {
      const decay = Math.max(0, 1 - enter);
      const shake = Math.sin(t * 110 + gIdx * 2.5) * decay;
      out.dx = shake * 22 * intensity * scale;
      out.dy = Math.cos(t * 95 + gIdx * 2.5) * decay * 14 * intensity * scale;
      out.rotate = shake * 0.18 * intensity;
      break;
    }
    case "depth-stack": {
      const p = easeOutCubic(enter);
      const s = 0.35 + p * 0.65;
      out.scaleX = s;
      out.scaleY = s;
      out.blur = (1 - p) * 10 * intensity;
      out.alpha = 0.15 + p * 0.85;
      break;
    }
    case "beat-pulse": {
      const beat = Math.pow(Math.max(0, Math.sin(phase * 2 - gIdx * 0.3)), 4);
      const s = 1 + beat * 0.32 * intensity;
      out.scaleX = s;
      out.scaleY = s;
      break;
    }
    case "signal-scan": {
      const scanPos = t * totalUnits;
      const dist = Math.abs(gIdx - scanPos);
      const active = Math.max(0, 1 - dist / 2.2);
      out.glow = active * 22 * intensity;
      out.scaleX = 1 + active * 0.18 * intensity;
      out.scaleY = out.scaleX;
      out.alpha = 0.45 + active * 0.55;
      break;
    }
    case "whiplash-snap": {
      const p = easeOutBack(enter);
      out.dx = (1 - p) * -180 * intensity * scale;
      out.skewX = (1 - p) * 0.65 * intensity;
      out.alpha = Math.min(1, enter * 1.8);
      break;
    }
    case "turbulent-shake": {
      const decay = Math.max(0, 1 - enter);
      out.dx = Math.sin(t * 130 + gIdx * 9) * decay * 18 * intensity * scale;
      out.dy = Math.cos(t * 120 + gIdx * 7) * decay * 18 * intensity * scale;
      out.rotate = Math.sin(t * 100 + gIdx) * decay * 0.25 * intensity;
      break;
    }
    case "vhs-drift": {
      const band = Math.sin(t * 36 + gIdx * 0.8) > 0.72 ? 1 : 0;
      out.dx =
        Math.sin(phase * 2 + gIdx * 0.3) * 6 * intensity * scale +
        band * Math.sin(t * 90 + gIdx) * 16 * intensity * scale;
      out.rgbSplit = band * 8 * intensity * scale;
      out.alpha = 0.85 + Math.sin(t * 60 + gIdx) * 0.15;
      break;
    }
    case "pendulum-swing": {
      const freq =
        config.waveDensity === "loose"
          ? 0.25
          : config.waveDensity === "tight"
            ? 0.65
            : 0.4;
      out.rotate = Math.sin(phase - gIdx * freq) * 0.38 * intensity;
      break;
    }
    default:
      break;
  }

  return out;
}

export type BgMediaElement = HTMLImageElement | HTMLVideoElement | null;

export function getEffectiveLoopSec(config: MotionConfig): number {
  return Math.max(0.5, config.loopDurationSec / Math.max(0.2, config.speed));
}

export function renderMotionFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  normalizedTime: number,
  parsedSvg?: ParsedSvg | null,
  bgMediaEl?: BgMediaElement,
  skipBackground = false
): void {
  ctx.save();
  if (!skipBackground) {
    ctx.clearRect(0, 0, width, height);

    if (config.bgColor && config.bgColor !== "transparent") {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (bgMediaEl) {
      drawCoverMedia(ctx, bgMediaEl, width, height);
    }

    if (config.opacity !== undefined && config.opacity < 100) {
      ctx.globalAlpha = Math.max(0, Math.min(1, config.opacity / 100));
    }
    if (config.blendMode && config.blendMode !== "source-over") {
      ctx.globalCompositeOperation = config.blendMode;
    }
  }

  const ox = (config.offsetX ?? 0) * (width / 800);
  const oy = (config.offsetY ?? 0) * (height / 800);
  if (ox !== 0 || oy !== 0) {
    ctx.translate(ox, oy);
  }

  if (config.mode === "svg" && parsedSvg && parsedSvg.units.length > 0) {
    renderSvgUnitsFrame(ctx, width, height, config, normalizedTime, parsedSvg);
    ctx.restore();
    return;
  }

  const rawText = config.text.trim() || "ADT MOTION";
  ctx.fillStyle = config.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  if (config.template === "circle" || config.pattern === "circle") {
    renderCircleTemplate(ctx, width, height, config, rawText, normalizedTime);
  } else if (config.template === "cylinder-spin") {
    renderCylinderSpinTemplate(ctx, width, height, config, rawText, normalizedTime);
  } else if (config.template === "echo-trail") {
    renderEchoTrailTemplate(ctx, width, height, config, rawText, normalizedTime);
  } else if (
    config.template === "marquee-3d" ||
    config.template === "marquee-vertical" ||
    config.template === "marquee-depth"
  ) {
    renderMarqueeTemplate(ctx, width, height, config, rawText, normalizedTime);
  } else {
    renderGlyphTemplate(ctx, width, height, config, rawText, normalizedTime);
  }

  ctx.restore();
}

let cachedGrainCanvas: HTMLCanvasElement | null = null;

function getGrainCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  if (cachedGrainCanvas) return cachedGrainCanvas;
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const gctx = c.getContext("2d");
  if (!gctx) return null;
  const img = gctx.createImageData(160, 160);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  gctx.putImageData(img, 0, 0);
  cachedGrainCanvas = c;
  return c;
}

function drawStageBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor: string,
  bgMediaEl: BgMediaElement,
  backdrop?: StageBackdrop | null,
  elapsedSec = 0
) {
  if (backdrop?.useGradient) {
    const angleDeg =
      backdrop.gradientAngle + (backdrop.animateGradient ? elapsedSec * 36 : 0);
    const rad = (angleDeg * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.hypot(width, height) / 2;
    const grad = ctx.createLinearGradient(
      cx - Math.cos(rad) * r,
      cy - Math.sin(rad) * r,
      cx + Math.cos(rad) * r,
      cy + Math.sin(rad) * r
    );
    grad.addColorStop(0, backdrop.gradientA);
    grad.addColorStop(1, backdrop.gradientB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  if (bgMediaEl) {
    drawCoverMedia(ctx, bgMediaEl, width, height);
  }
}

function drawFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grain: number,
  elapsedSec: number
) {
  if (grain <= 0) return;
  const grainCanvas = getGrainCanvas();
  if (!grainCanvas) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.45, (grain / 100) * 0.55);
  ctx.globalCompositeOperation = "overlay";
  const ox = Math.floor((elapsedSec * 97) % 160);
  const oy = Math.floor((elapsedSec * 61) % 160);
  for (let x = -ox; x < width; x += 160) {
    for (let y = -oy; y < height; y += 160) {
      ctx.drawImage(grainCanvas, x, y);
    }
  }
  ctx.restore();
}

export function renderCompositeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layers: MotionLayer[],
  bgColor: string,
  bgMediaEl: BgMediaElement,
  elapsedSec: number,
  parsedSvgsMap: Map<string, ParsedSvg | null>,
  backdrop?: StageBackdrop | null,
  interaction?: FrameInteraction
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  drawStageBackdrop(ctx, width, height, bgColor, bgMediaEl, backdrop, elapsedSec);

  const audioBoost = interaction?.audioEnergy ?? 0;
  const cursorMode = interaction?.cursorMode ?? "off";
  const cActive = interaction?.cursorActive ?? false;
  const cxNorm = interaction?.cursorX ?? 0;
  const cyNorm = interaction?.cursorY ?? 0;

  for (const layer of layers) {
    if (!layer.visible) continue;
    const delay = layer.config.startDelaySec ?? 0;
    const loopSec = getEffectiveLoopSec(layer.config);
    const cycleElapsed = elapsedSec % Math.max(loopSec, delay + loopSec);
    if (delay > 0 && cycleElapsed < delay) continue;

    const activeElapsed = Math.max(0, cycleElapsed - delay);
    const t = (activeElapsed / loopSec) % 1;

    ctx.save();
    if (layer.config.opacity !== undefined && layer.config.opacity < 100) {
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.config.opacity / 100));
    }
    if (layer.config.blendMode && layer.config.blendMode !== "source-over") {
      ctx.globalCompositeOperation = layer.config.blendMode;
    }

    // Apply Audio-Reactive bass scale pulse & Cursor-Reactive transform around center
    if (audioBoost > 0.01 || (cActive && cursorMode !== "off")) {
      ctx.translate(width / 2, height / 2);
      if (audioBoost > 0.01) {
        const s = 1 + audioBoost * 0.24;
        ctx.scale(s, s);
      }
      if (cActive && cursorMode === "magnetic") {
        ctx.translate(cxNorm * width * 0.14, cyNorm * height * 0.14);
      } else if (cActive && cursorMode === "repel") {
        ctx.translate(-cxNorm * width * 0.16, -cyNorm * height * 0.16);
      } else if (cActive && cursorMode === "tilt") {
        ctx.transform(1, cyNorm * 0.16, cxNorm * 0.22, 1, 0, 0);
        ctx.rotate(cxNorm * 0.08);
      }
      ctx.translate(-width / 2, -height / 2);
    }

    const effectiveConfig =
      audioBoost > 0.02
        ? {
            ...layer.config,
            intensity: Math.min(240, layer.config.intensity + audioBoost * 95),
          }
        : layer.config;

    renderMotionFrame(
      ctx,
      width,
      height,
      effectiveConfig,
      t,
      parsedSvgsMap.get(layer.id) ?? null,
      null,
      true
    );
    ctx.restore();
  }

  if (backdrop && backdrop.grain > 0) {
    drawFilmGrain(ctx, width, height, backdrop.grain, elapsedSec);
  }

  ctx.restore();
}

function drawCoverMedia(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement,
  w: number,
  h: number
) {
  let mediaW = 0;
  let mediaH = 0;
  if (media instanceof HTMLVideoElement) {
    if (media.readyState < 2) return;
    mediaW = media.videoWidth;
    mediaH = media.videoHeight;
  } else {
    if (!media.complete) return;
    mediaW = media.naturalWidth;
    mediaH = media.naturalHeight;
  }
  if (mediaW <= 0 || mediaH <= 0) return;

  const imgRatio = mediaW / mediaH;
  const canvasRatio = w / Math.max(1, h);
  let drawW = w;
  let drawH = h;
  let dx = 0;
  let dy = 0;
  if (imgRatio > canvasRatio) {
    drawW = h * imgRatio;
    dx = (w - drawW) / 2;
  } else {
    drawH = w / imgRatio;
    dy = (h - drawH) / 2;
  }
  ctx.drawImage(media, dx, dy, drawW, drawH);
}

function renderCylinderSpinTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(18, config.fontSize * 0.9 * scale);
  ctx.font = resolveCanvasFont(
    config.font,
    fontSize,
    config.fontWeight,
    config.fontStyle
  );

  const singleLine = rawText.replace(/\n+/g, " • ") + " • ";
  const chars = Array.from(singleLine);
  const count = chars.length;
  const radiusX = width * 0.36;
  const intensity = config.intensity / 100;

  // Depth-sort glyphs so front glyphs draw over back glyphs
  const items = chars.map((ch, i) => {
    const theta = (i / count) * Math.PI * 2 + t * Math.PI * 2;
    const depth = Math.cos(theta); // -1 (back) .. 1 (front)
    return { ch, theta, depth };
  });
  items.sort((a, b) => a.depth - b.depth);

  for (const item of items) {
    const x = cx + Math.sin(item.theta) * radiusX;
    const y = cy + Math.sin(item.theta * 2) * 14 * intensity * scale;
    const scaleX = Math.max(0.08, Math.abs(item.depth));
    const scaleY = 0.72 + ((item.depth + 1) / 2) * 0.36;
    const alpha = 0.12 + ((item.depth + 1) / 2) * 0.88;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scaleX * (item.depth < 0 ? -1 : 1), scaleY);
    ctx.fillStyle = config.color;
    ctx.fillText(item.ch, 0, 0);
    ctx.restore();
  }
}

function renderEchoTrailTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number
) {
  const scale = Math.min(width, height) / 800;
  let fontSize = Math.max(18, config.fontSize * scale);
  ctx.font = resolveCanvasFont(
    config.font,
    fontSize,
    config.fontWeight,
    config.fontStyle
  );

  const lines = rawText.split("\n");
  if (config.autoFit) {
    const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width), 1);
    const maxAllowed = width * 0.8;
    if (maxW > maxAllowed) {
      fontSize = Math.max(14, fontSize * (maxAllowed / maxW));
      ctx.font = resolveCanvasFont(
        config.font,
        fontSize,
        config.fontWeight,
        config.fontStyle
      );
    }
  }

  const intensity = config.intensity / 100;
  const lineH = fontSize * config.lineHeight;
  const totalH = lines.length * lineH;
  const startY = height / 2 - totalH / 2 + lineH / 2;
  const copies = 5;

  for (let c = copies; c >= 0; c--) {
    const laggedT = (t - c * 0.045 + 1) % 1;
    const phase = laggedT * Math.PI * 2;
    const dx = Math.sin(phase) * 34 * intensity * scale;
    const dy = Math.cos(phase * 2) * 26 * intensity * scale;
    const alpha = c === 0 ? 1 : 0.14 + ((copies - c) / copies) * 0.26;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = Math.max(1.2, fontSize * 0.025);
    lines.forEach((line, idx) => {
      const y = startY + idx * lineH + dy;
      if (c === 0) {
        ctx.fillText(line, width / 2 + dx, y);
      } else {
        ctx.strokeText(line, width / 2 + dx, y);
      }
    });
    ctx.restore();
  }
}

function renderCircleTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(16, config.fontSize * 0.72 * scale);
  ctx.font = resolveCanvasFont(
    config.font,
    fontSize,
    config.fontWeight,
    config.fontStyle
  );

  const singleLine = rawText.replace(/\n+/g, " • ") + " • ";
  const chars = Array.from(singleLine);
  const count = chars.length;
  const baseRadius = config.circleRadius * scale;
  const dirSign = config.circleDirection === "ccw" ? -1 : 1;
  const arcSpan = (config.arcCoverage / 100) * Math.PI * 2;
  const intensity = config.intensity / 100;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * Math.PI * 2 * dirSign);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * arcSpan;
    const pulse =
      Math.sin(t * Math.PI * 4 - i * 0.25) * 12 * intensity * scale;
    const r = baseRadius + pulse;

    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -r);
    if (config.letterFacing === "inward") {
      ctx.rotate(Math.PI);
    }
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function renderMarqueeTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number
) {
  const scale = Math.min(width, height) / 800;
  const fontSize = Math.max(20, config.fontSize * 0.9 * scale);
  ctx.font = resolveCanvasFont(
    config.font,
    fontSize,
    config.fontWeight,
    config.fontStyle
  );
  const intensity = config.intensity / 100;

  const lines = rawText.split("\n").filter(Boolean);
  const displayLines = lines.length > 1 ? lines : [rawText, rawText];
  const lineHeight = fontSize * 1.25;

  if (config.template === "marquee-vertical") {
    const totalH = displayLines.length * lineHeight * 2;
    const offsetY = (t * totalH) % totalH;
    ctx.save();
    ctx.textAlign = "center";
    for (let y = -totalH + offsetY; y < height + totalH; y += lineHeight * 1.4) {
      const idx = Math.abs(Math.round(y / lineHeight)) % displayLines.length;
      ctx.fillText(displayLines[idx], width / 2, y);
    }
    ctx.restore();
    return;
  }

  const totalHeight = displayLines.length * lineHeight;
  const startY = height / 2 - totalHeight / 2 + lineHeight / 2;

  displayLines.forEach((line, rowIdx) => {
    const chunk = `${line}   ✦   `;
    const chunkWidth = Math.max(80, ctx.measureText(chunk).width + config.letterSpacing * chunk.length);
    const dir = config.direction === "right" ? 1 : rowIdx % 2 === 0 ? -1 : 1;
    const offset = ((t * chunkWidth * dir) % chunkWidth + chunkWidth) % chunkWidth;
    const y = startY + rowIdx * lineHeight;

    // Depth echo layer for marquee-depth
    if (config.template === "marquee-depth") {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.filter = `blur(${6 * intensity}px)`;
      ctx.translate(0, y - 14 * scale);
      ctx.scale(0.92, 0.92);
      ctx.textAlign = "left";
      for (let x = -chunkWidth + offset * 0.6; x < width + chunkWidth; x += chunkWidth) {
        ctx.fillText(chunk, x, 0);
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, y);
    if (config.template === "marquee-3d") {
      const skew = Math.sin(t * Math.PI * 2) * 0.22 * intensity * dir;
      ctx.transform(1, 0.06 * dir * intensity, skew, 1, 0, 0);
    }
    ctx.textAlign = "left";
    for (let x = -chunkWidth + offset; x < width + chunkWidth; x += chunkWidth) {
      ctx.fillText(chunk, x, 0);
    }
    ctx.restore();
  });
}

function renderGlyphTemplate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  rawText: string,
  t: number
) {
  const scale = Math.min(width, height) / 800;
  let fontSize = Math.max(16, config.fontSize * scale);
  const intensity = config.intensity / 100;
  const trackingBoost =
    config.template === "tracking-breathe"
      ? (Math.sin(t * Math.PI * 2) * 0.5 + 0.5) * 26 * intensity * scale
      : 0;
  let kerning = config.letterSpacing * scale + trackingBoost;
  ctx.font = resolveCanvasFont(
    config.font,
    fontSize,
    config.fontWeight,
    config.fontStyle
  );

  const lines = rawText.split("\n");

  // Auto-fit: scale down fontSize & kerning proportionally if any line exceeds 86% of canvas width
  if (config.autoFit) {
    let maxLineWidth = 0;
    for (const line of lines) {
      const chars = Array.from(line);
      const w = chars.reduce(
        (acc, ch) => acc + ctx.measureText(ch).width + kerning,
        0
      );
      if (w > maxLineWidth) maxLineWidth = w;
    }
    const maxAllowed = width * 0.86;
    if (maxLineWidth > maxAllowed && maxLineWidth > 0) {
      const fitRatio = maxAllowed / maxLineWidth;
      fontSize = Math.max(12, fontSize * fitRatio);
      kerning = kerning * fitRatio;
      ctx.font = resolveCanvasFont(
        config.font,
        fontSize,
        config.fontWeight,
        config.fontStyle
      );
    }
  }

  const lineHeight = fontSize * config.lineHeight;
  const totalHeight = lines.length * lineHeight;
  const startY = height / 2 - totalHeight / 2 + lineHeight / 2;
  const totalUnits = Math.max(1, rawText.replace(/\n/g, "").length);

  let globalIdx = 0;

  lines.forEach((line, lineIdx) => {
    const chars = Array.from(line);
    const widths = chars.map((ch) => ctx.measureText(ch).width + kerning);
    const totalLineWidth = widths.reduce((acc, w) => acc + w, 0);
    let cursorX = width / 2 - totalLineWidth / 2;
    const baseY = startY + lineIdx * lineHeight;

    // Highlighter Wipe: draw sweeping editorial marker behind the line
    if (config.template === "highlighter-wipe") {
      const wipeT = easeInOutCubic(Math.min(1, ((t * 1.4 - lineIdx * 0.12 + 1) % 1) / 0.7));
      const padX = 14 * scale;
      const barH = fontSize * 1.04;
      ctx.save();
      ctx.fillStyle = "#FF6D29";
      ctx.globalAlpha = 0.28;
      ctx.fillRect(
        width / 2 - totalLineWidth / 2 - padX,
        baseY - barH / 2,
        (totalLineWidth + padX * 2) * wipeT,
        barH
      );
      ctx.restore();
    }

    const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*";

    chars.forEach((ch, idx) => {
      const charW = widths[idx];
      const cx = cursorX + charW / 2;
      cursorX += charW;

      const gIdx = globalIdx++;
      const tr = computeUnitTransform(
        config.template,
        gIdx,
        totalUnits,
        t,
        scale,
        config
      );

      if (!tr.visible) return;

      // Special per-glyph templates: cipher-decode, slot-roll, outline-sweep, pendulum-swing
      if (config.template === "cipher-decode") {
        const delay = (gIdx / Math.max(1, totalUnits)) * 0.45;
        const localT = (t - delay + 1) % 1;
        const locked = localT > 0.35 && localT < 0.92;
        const displayChar =
          locked || ch === " "
            ? ch
            : CIPHER_CHARS[
                Math.floor(t * 28 + gIdx * 7) % CIPHER_CHARS.length
              ];
        ctx.save();
        ctx.fillStyle = config.color;
        ctx.globalAlpha = locked ? 1 : 0.72;
        ctx.fillText(displayChar, cx, baseY);
        ctx.restore();
        return;
      }

      if (config.template === "slot-roll") {
        const delay = (gIdx / Math.max(1, totalUnits)) * 0.35;
        const localT = Math.min(1, ((t - delay + 1) % 1) / 0.55);
        const easedRoll = easeOutCubic(localT);
        const offsetSteps = (1 - easedRoll) * 3;
        const stepFrac = offsetSteps % 1;
        const altChar =
          ch === " "
            ? " "
            : CIPHER_CHARS[
                (Math.floor(offsetSteps) + gIdx * 5) % CIPHER_CHARS.length
              ];
        ctx.save();
        ctx.beginPath();
        ctx.rect(
          cx - charW * 0.75,
          baseY - lineHeight * 0.52,
          charW * 1.5,
          lineHeight * 1.04
        );
        ctx.clip();
        ctx.fillStyle = config.color;
        ctx.fillText(ch, cx, baseY - stepFrac * lineHeight);
        if (offsetSteps > 0.02) {
          ctx.globalAlpha = 0.6;
          ctx.fillText(altChar, cx, baseY + (1 - stepFrac) * lineHeight);
        }
        ctx.restore();
        return;
      }

      if (config.template === "outline-sweep") {
        const sweepX =
          width / 2 - totalLineWidth / 2 + totalLineWidth * easeInOutCubic(t);
        ctx.save();
        ctx.lineWidth = Math.max(1.5, fontSize * 0.04);
        ctx.strokeStyle = config.color;
        ctx.strokeText(ch, cx, baseY);
        ctx.beginPath();
        ctx.rect(0, baseY - lineHeight, sweepX, lineHeight * 2);
        ctx.clip();
        ctx.fillStyle = config.color;
        ctx.fillText(ch, cx, baseY);
        ctx.restore();
        return;
      }

      if (config.template === "pendulum-swing") {
        const pivotY = baseY - fontSize * 0.45;
        ctx.save();
        ctx.translate(cx, pivotY);
        ctx.rotate(tr.rotate);
        ctx.fillStyle = config.color;
        ctx.fillText(ch, 0, fontSize * 0.45);
        ctx.restore();
        return;
      }

      ctx.save();

      if (tr.clipProgress < 1) {
        const clipH = lineHeight * 1.1 * tr.clipProgress;
        ctx.beginPath();
        ctx.rect(
          cx - charW * 0.7,
          baseY + lineHeight * 0.55 - clipH,
          charW * 1.4,
          clipH
        );
        ctx.clip();
      }

      if (tr.blur > 0.2) {
        ctx.filter = `blur(${tr.blur.toFixed(1)}px)`;
      }

      if (tr.glow > 0.5) {
        ctx.shadowColor = config.color;
        ctx.shadowBlur = tr.glow;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, tr.alpha));

      if (tr.rgbSplit > 0.5) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = "#FF3B30";
        ctx.translate(cx + tr.dx - tr.rgbSplit, baseY + tr.dy);
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = "#00C7BE";
        ctx.translate(cx + tr.dx + tr.rgbSplit, baseY + tr.dy);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      }

      ctx.translate(cx + tr.dx, baseY + tr.dy);
      if (tr.rotate !== 0) ctx.rotate(tr.rotate);
      if (tr.skewX !== 0) ctx.transform(1, 0, tr.skewX, 1, 0, 0);
      if (tr.scaleX !== 1 || tr.scaleY !== 1) ctx.scale(tr.scaleX, tr.scaleY);

      ctx.fillStyle = config.color;
      ctx.fillText(ch, 0, 0);

      ctx.restore();
    });

    // Blinking caret for typewriter-caret
    if (config.template === "typewriter-caret" && lineIdx === lines.length - 1) {
      const showCaret = Math.floor(t * 10) % 2 === 0;
      if (showCaret) {
        ctx.save();
        ctx.fillStyle = config.color;
        ctx.fillRect(cursorX + 4 * scale, baseY - fontSize * 0.45, 4 * scale, fontSize * 0.9);
        ctx.restore();
      }
    }
  });
}

function renderSvgUnitsFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: MotionConfig,
  t: number,
  parsedSvg: ParsedSvg
) {
  const maxDim = Math.min(width, height) * 0.62;
  const aspect =
    parsedSvg.viewBoxWidth / Math.max(1, parsedSvg.viewBoxHeight);
  const drawW = aspect >= 1 ? maxDim : maxDim * aspect;
  const drawH = aspect >= 1 ? maxDim / aspect : maxDim;
  const scale = Math.min(width, height) / 800;
  const totalUnits = parsedSvg.units.length;
  const cx = width / 2;
  const cy = height / 2;

  parsedSvg.units.forEach((unit, idx) => {
    if (!unit.img.complete) return;

    if (config.template === "circle") {
      ctx.save();
      ctx.translate(cx, cy);
      const dirSign = config.circleDirection === "ccw" ? -1 : 1;
      ctx.rotate(t * Math.PI * 2 * dirSign + (idx * 0.12));
      const pulse = 1 + Math.sin(t * Math.PI * 4 - idx * 0.4) * 0.06 * (config.intensity / 100);
      ctx.scale(pulse, pulse);
      ctx.drawImage(unit.img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      return;
    }

    const tr = computeUnitTransform(
      config.template,
      idx,
      totalUnits,
      t,
      scale,
      config
    );
    if (!tr.visible) return;

    ctx.save();
    if (tr.blur > 0.2) ctx.filter = `blur(${tr.blur.toFixed(1)}px)`;
    if (tr.glow > 0.5) {
      ctx.shadowColor = config.color;
      ctx.shadowBlur = tr.glow;
    }
    ctx.globalAlpha = Math.max(0, Math.min(1, tr.alpha));
    ctx.translate(cx + tr.dx, cy + tr.dy);
    if (tr.rotate !== 0) ctx.rotate(tr.rotate);
    if (tr.skewX !== 0) ctx.transform(1, 0, tr.skewX, 1, 0, 0);
    if (tr.scaleX !== 1 || tr.scaleY !== 1) ctx.scale(tr.scaleX, tr.scaleY);

    ctx.drawImage(unit.img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  });
}
