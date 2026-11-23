import type { MotionConfig } from "./motion-engine";

export interface MotionPreset {
  id: string;
  title: string;
  category: "Logo motion" | "Web portfolio" | "Social media" | "Circular & kinetic";
  config: MotionConfig;
}

export const SAMPLE_SVGS: { id: string; label: string; markup: string }[] = [
  {
    id: "starburst",
    label: "Starburst Mark",
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <g fill="#141413">
    <polygon points="120,10 138,92 220,72 152,120 220,168 138,148 120,230 102,148 20,168 88,120 20,72 102,92" />
  </g>
</svg>`,
  },
  {
    id: "mono-badge",
    label: "TM Monogram",
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" width="280" height="140">
  <rect x="8" y="8" width="264" height="124" rx="16" fill="none" stroke="#141413" stroke-width="8"/>
  <path d="M44 42 H116 M80 42 V102 M140 102 V42 L176 82 L212 42 V102" fill="none" stroke="#2563EB" stroke-width="10" stroke-linecap="square" stroke-linejoin="miter"/>
</svg>`,
  },
];

export const DEFAULT_CONFIG: MotionConfig = {
  mode: "text",
  text: "50% OFF • SPECIAL PROMO",
  svgMarkup: SAMPLE_SVGS[0].markup,
  font: "IBM Plex Mono",
  fontSize: 64,
  letterSpacing: 2,
  template: "circle",
  speed: 1,
  stagger: 40,
  intensity: 100,
  color: "#141413",
  bgColor: "transparent",
  aspectRatio: "1:1",
  circleRadius: 185,
  loopDurationSec: 3,
};

export const SHOWCASE_PRESETS: MotionPreset[] = [
  {
    id: "circle-promo",
    title: "50% Off Orbital Stamp",
    category: "Circular & kinetic",
    config: {
      ...DEFAULT_CONFIG,
      text: "50% OFF • SPECIAL PROMO",
      font: "IBM Plex Mono",
      fontSize: 56,
      template: "circle",
      circleRadius: 185,
      color: "#141413",
      bgColor: "#FAF9F6",
    },
  },
  {
    id: "editorial-wave",
    title: "Type in Motion",
    category: "Web portfolio",
    config: {
      ...DEFAULT_CONFIG,
      text: "MOTION\nFIRST",
      font: "Instrument Serif",
      fontSize: 120,
      template: "wave",
      speed: 1.1,
      stagger: 65,
      intensity: 110,
      color: "#141413",
      bgColor: "#F5F3EE",
    },
  },
  {
    id: "atelier-rise",
    title: "Atelier Reveal",
    category: "Logo motion",
    config: {
      ...DEFAULT_CONFIG,
      text: "ATELIER\nSTUDIO",
      font: "Syne",
      fontSize: 96,
      template: "stagger-rise",
      speed: 0.9,
      stagger: 50,
      intensity: 100,
      color: "#2563EB",
      bgColor: "#141413",
    },
  },
  {
    id: "social-pop",
    title: "Drop 04 — Live Now",
    category: "Social media",
    config: {
      ...DEFAULT_CONFIG,
      text: "DROP 04\nLIVE NOW",
      font: "Bebas Neue",
      fontSize: 124,
      template: "elastic-pop",
      speed: 1.2,
      stagger: 70,
      intensity: 115,
      color: "#F5F3EE",
      bgColor: "#2563EB",
    },
  },
  {
    id: "stretch-type",
    title: "Kinetic Grotesk",
    category: "Web portfolio",
    config: {
      ...DEFAULT_CONFIG,
      text: "KINETIC\nSYSTEMS",
      font: "Space Grotesk",
      fontSize: 96,
      template: "kinetic-stretch",
      speed: 1.0,
      stagger: 45,
      intensity: 120,
      color: "#141413",
      bgColor: "#FFFFFF",
    },
  },
  {
    id: "split-ticker",
    title: "Dual Track Ribbon",
    category: "Social media",
    config: {
      ...DEFAULT_CONFIG,
      text: "NEW COLLECTION\nSUMMER 2026",
      font: "Playfair Display",
      fontSize: 82,
      template: "marquee-split",
      speed: 1.0,
      stagger: 30,
      intensity: 100,
      color: "#F5F3EE",
      bgColor: "#141413",
    },
  },
  {
    id: "svg-starburst",
    title: "Starburst SVG Mark",
    category: "Logo motion",
    config: {
      ...DEFAULT_CONFIG,
      mode: "svg",
      svgMarkup: SAMPLE_SVGS[0].markup,
      template: "circle",
      speed: 0.8,
      intensity: 110,
      bgColor: "#FAF9F6",
    },
  },
  {
    id: "circle-studio",
    title: "Design Engineering",
    category: "Circular & kinetic",
    config: {
      ...DEFAULT_CONFIG,
      text: "DESIGN • CODE • MOTION",
      font: "Space Grotesk",
      fontSize: 58,
      template: "circle",
      circleRadius: 195,
      speed: 0.9,
      intensity: 90,
      color: "#2563EB",
      bgColor: "#F5F3EE",
    },
  },
];

export function serializeConfigToParams(config: MotionConfig): string {
  const params = new URLSearchParams();
  params.set("mode", config.mode);
  params.set("text", config.text);
  params.set("font", config.font);
  params.set("fontSize", String(config.fontSize));
  params.set("template", config.template);
  params.set("speed", String(config.speed));
  params.set("stagger", String(config.stagger));
  params.set("intensity", String(config.intensity));
  params.set("color", config.color);
  params.set("bg", config.bgColor);
  params.set("ratio", config.aspectRatio);
  params.set("radius", String(config.circleRadius));
  return params.toString();
}
