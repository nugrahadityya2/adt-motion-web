import {
  FONT_MAP,
  getEffectiveLoopSec,
  MotionConfig,
} from "./motion-engine";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getKeyframesForTemplate(config: MotionConfig): string {
  const intensity = config.intensity / 100;
  const dist = Math.round(32 * intensity);
  const scalePop = (1 + 0.25 * intensity).toFixed(2);

  switch (config.template) {
    case "stagger-fade":
      return `@keyframes adt-motion {
  0%, 100% { opacity: 0.15; }
  45%, 80% { opacity: 1; }
}`;
    case "slide-fade":
    case "staggered-blur-up":
      return `@keyframes adt-motion {
  0% { opacity: 0; transform: translateY(${dist}px); filter: blur(${config.template === "staggered-blur-up" ? Math.round(8 * intensity) : 0}px); }
  45%, 85% { opacity: 1; transform: translateY(0); filter: blur(0); }
  100% { opacity: 0; transform: translateY(-${Math.round(dist * 0.5)}px); }
}`;
    case "wave":
    case "kinetic-wave-loop":
      return `@keyframes adt-motion {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-${dist}px) rotate(-4deg); }
  75% { transform: translateY(${dist}px) rotate(4deg); }
}`;
    case "elastic-stretch":
    case "accent-pop":
    case "beat-pulse":
      return `@keyframes adt-motion {
  0%, 100% { transform: scale(0.92); }
  40% { transform: scale(${scalePop}); }
  65% { transform: scale(0.98); }
}`;
    case "glitch-rgb-split":
    case "glitch-snap":
      return `@keyframes adt-motion {
  0%, 88%, 100% { transform: translate(0, 0); text-shadow: none; }
  20% { transform: translate(-4px, 2px); text-shadow: -4px 0 #ff3b30, 4px 0 #00c7be; }
  35% { transform: translate(3px, -2px); text-shadow: 3px 0 #ff3b30, -3px 0 #00c7be; }
  50% { transform: translate(0, 0); text-shadow: none; }
}`;
    case "neon-flicker":
    case "signal-scan":
      return `@keyframes adt-motion {
  0%, 100% { opacity: 0.35; text-shadow: none; }
  45%, 60% { opacity: 1; text-shadow: 0 0 ${Math.round(18 * intensity)}px currentColor; }
}`;
    case "card-flip-cascade":
      return `@keyframes adt-motion {
  0% { transform: rotateY(90deg); opacity: 0; }
  45%, 85% { transform: rotateY(0deg); opacity: 1; }
  100% { transform: rotateY(-90deg); opacity: 0; }
}`;
    case "gravity-bounce":
      return `@keyframes adt-motion {
  0% { transform: translateY(-${dist * 2}px); opacity: 0; }
  50% { transform: translateY(0); opacity: 1; }
  65% { transform: translateY(-${Math.round(dist * 0.5)}px); }
  80%, 100% { transform: translateY(0); opacity: 1; }
}`;
    default:
      return `@keyframes adt-motion {
  0% { opacity: 0; transform: translateY(${dist}px); }
  40%, 85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-${Math.round(dist * 0.4)}px); }
}`;
  }
}

export function generateHtmlCssEmbed(config: MotionConfig): string {
  const duration = getEffectiveLoopSec(config).toFixed(2);
  const staggerMs = config.stagger;
  const text = config.text.trim() || "ADT MOTION";
  const bgRule =
    config.bgColor && config.bgColor !== "transparent"
      ? config.bgColor
      : "transparent";

  const fontQuery = config.font.replace(/\s+/g, "+");

  if (config.mode === "svg") {
    return `<!-- ADT Motion SVG Embed -->
<style>
  .adt-svg-stage {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: ${bgRule};
  }
  .adt-svg-stage svg {
    max-width: 320px;
    height: auto;
    animation: adt-motion ${duration}s ease-in-out infinite;
  }
  ${getKeyframesForTemplate(config)}
  @media (prefers-reduced-motion: reduce) {
    .adt-svg-stage svg { animation: none; }
  }
</style>
<div class="adt-svg-stage">
  ${config.svgMarkup.trim()}
</div>`;
  }

  const lines = text.split("\n");
  let charIdx = 0;
  const htmlLines = lines
    .map((line) => {
      const spans = Array.from(line)
        .map((ch) => {
          const delay = charIdx++ * staggerMs;
          const display = ch === " " ? "&nbsp;" : escapeHtml(ch);
          return `    <span style="--d:${delay}ms">${display}</span>`;
        })
        .join("\n");
      return `  <div class="adt-line">\n${spans}\n  </div>`;
    })
    .join("\n");

  const isBuiltIn = config.font in FONT_MAP;
  const fontHeader = isBuiltIn
    ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fontQuery}:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700&display=swap" />`
    : `<!-- Custom font "${config.font}": load your .woff2/.ttf via @font-face in your CSS -->`;

  return `<!-- ADT Motion HTML + CSS Embed -->
${fontHeader}
<style>
  .adt-motion {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: ${bgRule};
    color: ${config.color};
    font-family: '${config.font}', sans-serif;
    font-weight: ${config.fontWeight};
    font-style: ${config.fontStyle};
    font-size: ${config.fontSize}px;
    letter-spacing: ${config.letterSpacing}px;
    line-height: ${config.lineHeight};
  }
  .adt-line {
    display: flex;
  }
  .adt-motion span {
    display: inline-block;
    animation: adt-motion ${duration}s ease-in-out infinite;
    animation-delay: var(--d, 0ms);
  }
  ${getKeyframesForTemplate(config)}
  @media (prefers-reduced-motion: reduce) {
    .adt-motion span { animation: none; }
  }
</style>
<div class="adt-motion" aria-label="${escapeHtml(text.replace(/\n/g, " "))}">
${htmlLines}
</div>`;
}
