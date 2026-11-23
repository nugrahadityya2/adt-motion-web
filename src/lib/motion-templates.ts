export type MotionTemplate =
  | "stagger-fade"
  | "slide-fade"
  | "typewriter"
  | "letter-reveal"
  | "glitch-snap"
  | "skew-swoosh"
  | "curtain-rise"
  | "chaos-converge"
  | "ribbon-cascade"
  | "zoom-blur-pop"
  | "staggered-blur-up"
  | "kinetic-wave-loop"
  | "typewriter-caret"
  | "elastic-stretch"
  | "glitch-rgb-split"
  | "marquee-3d"
  | "marquee-vertical"
  | "marquee-depth"
  | "breathing-pulse"
  | "slant-momentum"
  | "optical-focus"
  | "glitch-stutter"
  | "liquid-wave"
  | "accent-pop"
  | "card-flip-cascade"
  | "neon-flicker"
  | "circle"
  | "wave"
  | "gravity-bounce"
  | "shockwave-ripple"
  | "depth-stack"
  | "beat-pulse"
  | "serif-bloom"
  | "signal-scan"
  | "whiplash-snap"
  | "turbulent-shake"
  | "magnetic-slam";

export type DetailSectionType =
  | "pattern"
  | "slide"
  | "reveal"
  | "glitch"
  | "marquee"
  | "circle"
  | "wave"
  | "none";

export interface TemplateDefinition {
  id: MotionTemplate;
  tag: string;
  name: string;
  description: string;
  detailType: DetailSectionType;
}

export const TEMPLATE_META: TemplateDefinition[] = [
  {
    id: "stagger-fade",
    tag: "#1",
    name: "Stagger fade",
    description: "Clean, safe default — letters fade in sequentially",
    detailType: "pattern",
  },
  {
    id: "slide-fade",
    tag: "#2",
    name: "Slide + fade",
    description: "Gentle directional slide + fade-in",
    detailType: "slide",
  },
  {
    id: "typewriter",
    tag: "#3",
    name: "Typewriter",
    description: "Instant per-letter reveal, like text being typed",
    detailType: "none",
  },
  {
    id: "letter-reveal",
    tag: "#4",
    name: "Letter reveal",
    description: "Masked clip reveal per letter with directional wipe",
    detailType: "reveal",
  },
  {
    id: "glitch-snap",
    tag: "#5",
    name: "Glitch snap",
    description: "Sharp erratic snaps with energetic jitter",
    detailType: "glitch",
  },
  {
    id: "skew-swoosh",
    tag: "#6",
    name: "Skew swoosh",
    description: "Diagonal slide-in with skew, broadcast-style energy",
    detailType: "slide",
  },
  {
    id: "curtain-rise",
    tag: "#7",
    name: "Curtain rise",
    description: "Clip-rect reveal like a curtain lifting",
    detailType: "reveal",
  },
  {
    id: "chaos-converge",
    tag: "#8",
    name: "Chaos converge",
    description: "Letters fly in from random positions with rotation",
    detailType: "pattern",
  },
  {
    id: "ribbon-cascade",
    tag: "#9",
    name: "Ribbon cascade",
    description: "Long horizontal flowing entrance with subtle rotation",
    detailType: "slide",
  },
  {
    id: "zoom-blur-pop",
    tag: "#10",
    name: "Zoom blur pop",
    description: "Scale down from oversized + blurred into focus",
    detailType: "none",
  },
  {
    id: "staggered-blur-up",
    tag: "#11",
    name: "Staggered Blur-Up",
    description: "Sleek premium reveal — blur, lift and fade in together",
    detailType: "slide",
  },
  {
    id: "kinetic-wave-loop",
    tag: "#12",
    name: "Kinetic Wave Loop",
    description: "Continuous organic wave that never settles",
    detailType: "wave",
  },
  {
    id: "typewriter-caret",
    tag: "#13",
    name: "Typewriter + Caret",
    description: "Instant per-letter reveal with a blinking cursor",
    detailType: "none",
  },
  {
    id: "elastic-stretch",
    tag: "#14",
    name: "Elastic Stretch",
    description: "Bouncy squash-and-stretch pop, springy settle",
    detailType: "pattern",
  },
  {
    id: "glitch-rgb-split",
    tag: "#15",
    name: "Glitch RGB Split",
    description: "Chromatic aberration snaps — red/blue ghost layers",
    detailType: "glitch",
  },
  {
    id: "marquee-3d",
    tag: "#16",
    name: "Marquee 3D",
    description: "Infinite scrolling banner with tilted perspective lean",
    detailType: "marquee",
  },
  {
    id: "marquee-vertical",
    tag: "#17",
    name: "Marquee Vertical",
    description: "Infinite vertical scroll, like film credits",
    detailType: "marquee",
  },
  {
    id: "marquee-depth",
    tag: "#18",
    name: "Marquee Depth Field",
    description: "Scrolling banner with blurred background echo layer",
    detailType: "marquee",
  },
  {
    id: "breathing-pulse",
    tag: "#19",
    name: "Breathing Pulse",
    description: "Continuous subtle scale & opacity breathing",
    detailType: "none",
  },
  {
    id: "slant-momentum",
    tag: "#20",
    name: "Slant Momentum",
    description: "Fast italic-lean swing with a crisp rebound settle",
    detailType: "slide",
  },
  {
    id: "optical-focus",
    tag: "#21",
    name: "Optical Focus",
    description: "Cinematic focus pull — letters rack sharply into view",
    detailType: "none",
  },
  {
    id: "glitch-stutter",
    tag: "#22",
    name: "Glitch Stutter",
    description: "Pure geometric stutter — width snaps in place",
    detailType: "glitch",
  },
  {
    id: "liquid-wave",
    tag: "#23",
    name: "Liquid Wave",
    description: "Continuous slant ripple across letters",
    detailType: "wave",
  },
  {
    id: "accent-pop",
    tag: "#24",
    name: "Accent Pop",
    description: "Bold elastic scale-up + overshoot bounce",
    detailType: "pattern",
  },
  {
    id: "card-flip-cascade",
    tag: "#25",
    name: "Card Flip Cascade",
    description: "3D card-flip reveal across the word",
    detailType: "none",
  },
  {
    id: "neon-flicker",
    tag: "#26",
    name: "Neon Flicker-On",
    description: "Electric neon sign buzzing to life",
    detailType: "none",
  },
  {
    id: "circle",
    tag: "#27",
    name: "Circle Rotate Text",
    description: "Wraps text into a ring and spins — badge or stamp style",
    detailType: "circle",
  },
  {
    id: "wave",
    tag: "#28",
    name: "Wave Text Flow",
    description: "Letters ripple along a flowing sine wave",
    detailType: "wave",
  },
  {
    id: "gravity-bounce",
    tag: "#29",
    name: "Gravity Bounce Drop",
    description: "Letters fall from above and bounce on a floor",
    detailType: "none",
  },
  {
    id: "shockwave-ripple",
    tag: "#30",
    name: "Shockwave Ripple",
    description: "Decaying shake ripple across letters",
    detailType: "glitch",
  },
  {
    id: "depth-stack",
    tag: "#31",
    name: "Depth Stack",
    description: "Letters arrive from a distance — small, blurred, dim",
    detailType: "none",
  },
  {
    id: "beat-pulse",
    tag: "#32",
    name: "Beat Pulse",
    description: "Rhythmic per-letter bounce on a synchronized beat",
    detailType: "none",
  },
  {
    id: "serif-bloom",
    tag: "#33",
    name: "Serif Bloom",
    description: "Letters scale up slow with gentle overshoot",
    detailType: "none",
  },
  {
    id: "signal-scan",
    tag: "#34",
    name: "Signal Scan",
    description: "Letters activate in sequence with a bright glow burst",
    detailType: "none",
  },
  {
    id: "whiplash-snap",
    tag: "#35",
    name: "Whiplash Snap",
    description: "Skewed entrance from off-screen with a sharp snap",
    detailType: "slide",
  },
  {
    id: "turbulent-shake",
    tag: "#36",
    name: "Turbulent Shake-In",
    description: "Letters land in place, shaking rapidly then settling",
    detailType: "glitch",
  },
  {
    id: "magnetic-slam",
    tag: "#37",
    name: "Magnetic Slam",
    description: "Letters lock in from scattered positions with a bounce",
    detailType: "pattern",
  },
];
