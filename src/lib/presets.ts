import type { MotionConfig } from "./motion-engine";

export interface MotionPreset {
  id: string;
  title: string;
  category: "Logo motion" | "Web portfolio" | "Social media" | "Circular & kinetic";
  config: MotionConfig;
}

export const SAMPLE_SVGS: { id: string; label: string; markup: string }[] = [
  {
    id: "adt-mark",
    label: "ADT Multi-Unit Mark",
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">
  <rect x="10" y="20" width="60" height="80" rx="12" fill="#FF6D29"/>
  <circle cx="110" cy="60" r="32" fill="#F5F6F8"/>
  <polygon points="165,20 205,100 125,100" fill="#FF6D29"/>
  <rect x="215" y="20" width="22" height="80" rx="6" fill="#F5F6F8"/>
  <rect x="247" y="20" width="22" height="80" rx="6" fill="#FF6D29"/>
</svg>`,
  },
  {
    id: "starburst",
    label: "Starburst Mark",
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <polygon points="120,10 138,92 220,72 152,120 220,168 138,148 120,230 102,148 20,168 88,120 20,72 102,92" fill="#FF6D29" />
  <circle cx="120" cy="120" r="24" fill="#161316" />
</svg>`,
  },
];

export const DEFAULT_CONFIG: MotionConfig = {
  mode: "text",
  text: "ADT MOTION • DESIGN STUDIO",
  svgMarkup: SAMPLE_SVGS[0].markup,
  svgFileName: "ADT-MARK.svg",
  font: "JetBrains Mono",
  fontWeight: "700",
  fontStyle: "normal",
  fontSize: 58,
  letterSpacing: 2,
  lineHeight: 1.18,
  autoFit: true,
  template: "circle",
  speed: 1,
  stagger: 60,
  intensity: 100,
  color: "#FF6D29",
  bgColor: "transparent",
  aspectRatio: "1:1",
  circleRadius: 185,
  loopDurationSec: 3,
  pattern: "straight",
  direction: "up",
  easeStyle: "smooth",
  circleDirection: "cw",
  arcCoverage: 100,
  letterFacing: "outward",
  waveDensity: "normal",
  tilt: 50,
  jitterAxis: "both",
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
    id: "stagger-blur-up",
    title: "Staggered Blur-Up",
    category: "Web portfolio",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT\nDESIGN",
      font: "Outfit",
      fontSize: 120,
      template: "staggered-blur-up",
      speed: 1.0,
      stagger: 70,
      intensity: 110,
      color: "#F5F6F8",
      bgColor: "#1E1A1D",
    },
  },
  {
    id: "rgb-glitch",
    title: "Glitch RGB Split",
    category: "Social media",
    config: {
      ...DEFAULT_CONFIG,
      text: "SIGNAL\nERROR",
      font: "Syne",
      fontSize: 104,
      template: "glitch-rgb-split",
      speed: 1.1,
      stagger: 50,
      intensity: 130,
      color: "#F5F6F8",
      bgColor: "#161316",
    },
  },
  {
    id: "elastic-stretch",
    title: "Elastic Stretch",
    category: "Social media",
    config: {
      ...DEFAULT_CONFIG,
      text: "DROP 04\nLIVE NOW",
      font: "Bebas Neue",
      fontSize: 124,
      template: "elastic-stretch",
      speed: 1.1,
      stagger: 65,
      intensity: 115,
      color: "#161316",
      bgColor: "#FF6D29",
    },
  },
  {
    id: "neon-flicker",
    title: "Neon Flicker-On",
    category: "Logo motion",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT\nSTUDIO",
      font: "Outfit",
      fontSize: 116,
      template: "neon-flicker",
      speed: 1.0,
      stagger: 55,
      intensity: 120,
      color: "#FF6D29",
      bgColor: "#161316",
    },
  },
  {
    id: "marquee-3d",
    title: "Marquee 3D Ribbon",
    category: "Web portfolio",
    config: {
      ...DEFAULT_CONFIG,
      text: "ADT DESIGN\nMOTION LAB",
      font: "Outfit",
      fontSize: 84,
      template: "marquee-3d",
      speed: 1.0,
      stagger: 30,
      intensity: 100,
      color: "#F5F6F8",
      bgColor: "#161316",
    },
  },
  {
    id: "svg-multi-unit",
    title: "ADT Multi-Unit SVG",
    category: "Logo motion",
    config: {
      ...DEFAULT_CONFIG,
      mode: "svg",
      svgMarkup: SAMPLE_SVGS[0].markup,
      template: "gravity-bounce",
      speed: 1.0,
      stagger: 80,
      intensity: 100,
      bgColor: "#161316",
    },
  },
  {
    id: "wave-text-flow",
    title: "Wave Text Flow",
    category: "Circular & kinetic",
    config: {
      ...DEFAULT_CONFIG,
      text: "DESIGN • CODE • MOTION",
      font: "Space Grotesk",
      fontSize: 64,
      template: "wave",
      speed: 1.0,
      stagger: 45,
      intensity: 110,
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
