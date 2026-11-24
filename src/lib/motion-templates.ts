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

export type TemplateCategory =
  | "Entrances"
  | "Loops"
  | "Glitch"
  | "Editorial"
  | "Physics";

export interface TemplateDefinition {
  id: MotionTemplate;
  category: TemplateCategory;
  name: string;
  description: string;
  detailType: DetailSectionType;
}

export const TEMPLATE_CATEGORIES: ("All" | TemplateCategory)[] = [
  "All",
  "Entrances",
  "Loops",
  "Glitch",
  "Editorial",
  "Physics",
];

export const TEMPLATE_META: TemplateDefinition[] = [
  // Entrances
  {
    id: "stagger-fade",
    category: "Entrances",
    name: "Sequential Fade",
    description: "Soft opacity cascade across every glyph",
    detailType: "pattern",
  },
  {
    id: "slide-fade",
    category: "Entrances",
    name: "Directional Glide",
    description: "Smooth positional drift paired with fade-in",
    detailType: "slide",
  },
  {
    id: "letter-reveal",
    category: "Entrances",
    name: "Masked Wipe",
    description: "Precision clip-path unveil per character",
    detailType: "reveal",
  },
  {
    id: "curtain-rise",
    category: "Entrances",
    name: "Stage Lift",
    description: "Clean vertical mask reveal from baseline",
    detailType: "reveal",
  },
  {
    id: "staggered-blur-up",
    category: "Entrances",
    name: "Soft Focus Rise",
    description: "Defocused upward drift resolving into sharp type",
    detailType: "slide",
  },
  {
    id: "zoom-blur-pop",
    category: "Entrances",
    name: "Lens Drop",
    description: "Oversized soft-focus pull down to final scale",
    detailType: "none",
  },
  {
    id: "depth-stack",
    category: "Entrances",
    name: "Horizon Approach",
    description: "Emerges forward from distant soft depth",
    detailType: "none",
  },
  {
    id: "optical-focus",
    category: "Entrances",
    name: "Rack Focus",
    description: "Cinema-style sharpness pull across each glyph",
    detailType: "none",
  },
  {
    id: "serif-bloom",
    category: "Entrances",
    name: "Graceful Bloom",
    description: "Subtle editorial scale expansion with gentle settle",
    detailType: "none",
  },

  // Loops
  {
    id: "circle",
    category: "Loops",
    name: "Orbital Ring",
    description: "Continuous circular stamp rotation with pulse",
    detailType: "circle",
  },
  {
    id: "wave",
    category: "Loops",
    name: "Sine Ribbon",
    description: "Fluid harmonic ripple moving across the baseline",
    detailType: "wave",
  },
  {
    id: "kinetic-wave-loop",
    category: "Loops",
    name: "Endless Swell",
    description: "Perpetual organic oscillation that never stops",
    detailType: "wave",
  },
  {
    id: "liquid-wave",
    category: "Loops",
    name: "Fluid Shear",
    description: "Continuous italic slant wave across characters",
    detailType: "wave",
  },
  {
    id: "breathing-pulse",
    category: "Loops",
    name: "Ambient Breathe",
    description: "Calm rhythmic scale and opacity modulation",
    detailType: "none",
  },
  {
    id: "beat-pulse",
    category: "Loops",
    name: "Tempo Thump",
    description: "Synced rhythmic beat impulse per unit",
    detailType: "none",
  },
  {
    id: "signal-scan",
    category: "Loops",
    name: "Luminous Sweep",
    description: "Traveling highlight beam activating glyphs in order",
    detailType: "none",
  },

  // Editorial & 3D
  {
    id: "marquee-3d",
    category: "Editorial",
    name: "Tilted Ticker",
    description: "Infinite kinetic banner with perspective slant",
    detailType: "marquee",
  },
  {
    id: "marquee-vertical",
    category: "Editorial",
    name: "Credit Roll",
    description: "Seamless vertical stream inspired by film titles",
    detailType: "marquee",
  },
  {
    id: "marquee-depth",
    category: "Editorial",
    name: "Echo Stream",
    description: "Dual-depth ticker with soft background parallax",
    detailType: "marquee",
  },
  {
    id: "typewriter",
    category: "Editorial",
    name: "Terminal Type",
    description: "Crisp step-by-step character appearance",
    detailType: "none",
  },
  {
    id: "typewriter-caret",
    category: "Editorial",
    name: "Console Cursor",
    description: "Stepwise typing accompanied by a blinking caret",
    detailType: "none",
  },
  {
    id: "card-flip-cascade",
    category: "Editorial",
    name: "Split-Flap Flip",
    description: "Sequential horizontal hinge rotation per unit",
    detailType: "none",
  },
  {
    id: "ribbon-cascade",
    category: "Editorial",
    name: "Arc Sweep",
    description: "Sweeping lateral entrance along a curved path",
    detailType: "slide",
  },
  {
    id: "skew-swoosh",
    category: "Editorial",
    name: "Broadcast Slant",
    description: "High-speed diagonal entry with kinetic skew",
    detailType: "slide",
  },
  {
    id: "slant-momentum",
    category: "Editorial",
    name: "Italic Swing",
    description: "Energetic oblique lean with crisp rebound",
    detailType: "slide",
  },

  // Glitch & Signal
  {
    id: "glitch-rgb-split",
    category: "Glitch",
    name: "Chromatic Split",
    description: "Red/cyan channel separation snapping into alignment",
    detailType: "glitch",
  },
  {
    id: "glitch-snap",
    category: "Glitch",
    name: "Signal Jitter",
    description: "Sharp micro-displacement bursts before locking",
    detailType: "glitch",
  },
  {
    id: "glitch-stutter",
    category: "Glitch",
    name: "Frame Stepped",
    description: "Quantized width stutter with abrupt locking",
    detailType: "glitch",
  },
  {
    id: "neon-flicker",
    category: "Glitch",
    name: "Tube Ignition",
    description: "Intermittent electric glow flicker powering on",
    detailType: "none",
  },
  {
    id: "shockwave-ripple",
    category: "Glitch",
    name: "Impact Tremor",
    description: "Decaying vibration shockwave across the line",
    detailType: "glitch",
  },
  {
    id: "turbulent-shake",
    category: "Glitch",
    name: "Static Rumble",
    description: "Rapid in-place turbulence settling to stillness",
    detailType: "glitch",
  },

  // Physics & Pop
  {
    id: "elastic-stretch",
    category: "Physics",
    name: "Rubber Squash",
    description: "Spring-loaded squash and stretch settlement",
    detailType: "pattern",
  },
  {
    id: "accent-pop",
    category: "Physics",
    name: "Overshoot Pop",
    description: "Punchy scale-up with tactile spring rebound",
    detailType: "pattern",
  },
  {
    id: "gravity-bounce",
    category: "Physics",
    name: "Floor Drop",
    description: "Gravity-driven fall with elastic floor bounces",
    detailType: "none",
  },
  {
    id: "whiplash-snap",
    category: "Physics",
    name: "Whip Brake",
    description: "High-velocity entry braking sharply on arrival",
    detailType: "slide",
  },
  {
    id: "chaos-converge",
    category: "Physics",
    name: "Scatter Assemble",
    description: "Dispersed glyphs converging from random vectors",
    detailType: "pattern",
  },
  {
    id: "magnetic-slam",
    category: "Physics",
    name: "Magnet Lock",
    description: "Off-axis units snapping together with recoil",
    detailType: "pattern",
  },
];
