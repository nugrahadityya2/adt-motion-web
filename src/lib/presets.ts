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
  <g fill="#FF6D29">
    <polygon points="120,10 138,92 220,72 152,120 220,168 138,148 120,230 102,148 20,168 88,120 20,72 102,92" />
  </g>
</svg>`,
  },
  {
    id: "adt-badge",
    label: "ADT Monogram",
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140" width="280" height="140">
  <rect x="8" y="8" width="264" height="124" rx="24" fill="#161316" stroke="#FF6D29" stroke-width="6"/>
  <text x="140" y="86" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="56" fill="#F5F6F8" letter-spacing="4">ADT</text>
</svg>`,
  },
];

export const DEFAULT_CONFIG: MotionConfig = {
  mode: "text",
  text: "ADT MOTION • DESIGN STUDIO",
  svgMarkup: SAMPLE_SVGS[0].markup,
  font: "JetBrains Mono",
  fontSize: 58,
  letterSpacing: 2,
  template: "circle",
  speed: 1,
  stagger: 40,
  intensity: 100,
  color: "#FF6D29",
  bgColor: "transparent",
  aspectRatio: "1:1",
  circleRadius: 185,
  loopDurationSec: 3,
};

export const SHOWCASE_PRESETS: MotionPreset[] = [
  {
    id: "circle-promo",
    title: "ADT Orbital Stamp",
    category: "Circular & kinetic",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT MOTION • DESIGN STUDIO",
      font: "JetBrains Mono",
      fontSize: 54,
      template: "circle",
      circleRadius: 185,
      color: "#F5F6F8",
      bgColor: "#161316",
    },
  },
  {
    id: "editorial-wave",
    title: "Motion First",
    category: "Web portfolio",
    config: {
      ...DEFAULT_CONFIG,
      text: "MOTION\nFIRST",
      font: "Outfit",
      fontSize: 120,
      template: "wave",
      speed: 1.1,
      stagger: 65,
      intensity: 110,
      color: "#F5F6F8",
      bgColor: "#1E1A1D",
    },
  },
  {
    id: "atelier-rise",
    title: "ADT Studio Reveal",
    category: "Logo motion",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT\nSTUDIO",
      font: "Outfit",
      fontSize: 116,
      template: "stagger-rise",
      speed: 0.9,
      stagger: 50,
      intensity: 100,
      color: "#FF6D29",
      bgColor: "#161316",
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
      color: "#161316",
      bgColor: "#FF6D29",
    },
  },
  {
    id: "stretch-type",
    title: "Kinetic Systems",
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
      color: "#0F1117",
      bgColor: "#F5F6F8",
    },
  },
  {
    id: "split-ticker",
    title: "Dual Track Ribbon",
    category: "Social media",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT DESIGN\nMOTION LAB",
      font: "Outfit",
      fontSize: 84,
      template: "marquee-split",
      speed: 1.0,
      stagger: 30,
      intensity: 100,
      color: "#F5F6F8",
      bgColor: "#161316",
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
      bgColor: "#161316",
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
      color: "#FF6D29",
      bgColor: "#1E1A1D",
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
