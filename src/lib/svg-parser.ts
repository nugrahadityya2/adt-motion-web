export interface SvgUnit {
  id: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
  img: HTMLImageElement;
}

export interface ParsedSvg {
  viewBoxWidth: number;
  viewBoxHeight: number;
  units: SvgUnit[];
  fullImage: HTMLImageElement | null;
}

const SHAPE_SELECTOR = "path, circle, rect, polygon, ellipse, polyline";

export async function parseSvgToUnits(
  svgMarkup: string,
  overrideColor?: string
): Promise<ParsedSvg> {
  if (typeof window === "undefined" || !svgMarkup.trim()) {
    return { viewBoxWidth: 240, viewBoxHeight: 240, units: [], fullImage: null };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) {
    return { viewBoxWidth: 240, viewBoxHeight: 240, units: [], fullImage: null };
  }

  // Determine viewBox
  const vbAttr = svgEl.getAttribute("viewBox");
  let vbX = 0;
  let vbY = 0;
  let vbW = Number(svgEl.getAttribute("width")?.replace(/px/gi, "")) || 240;
  let vbH = Number(svgEl.getAttribute("height")?.replace(/px/gi, "")) || 240;

  if (vbAttr) {
    const parts = vbAttr
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      [vbX, vbY, vbW, vbH] = parts;
    }
  }

  const shapes = Array.from(svgEl.querySelectorAll(SHAPE_SELECTOR));
  const fullImg = await loadSvgStringAsImage(
    overrideColor ? applyColorToSvgString(svgMarkup, overrideColor) : svgMarkup
  );

  if (shapes.length <= 1) {
    return {
      viewBoxWidth: vbW,
      viewBoxHeight: vbH,
      units: fullImg
        ? [
            {
              id: 0,
              cx: vbW / 2,
              cy: vbH / 2,
              width: vbW,
              height: vbH,
              img: fullImg,
            },
          ]
        : [],
      fullImage: fullImg,
    };
  }

  // Render each shape into its own image preserving the root viewBox
  const units: SvgUnit[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const clone = shapes[i].cloneNode(true) as Element;
    if (overrideColor) {
      const fill = clone.getAttribute("fill");
      const stroke = clone.getAttribute("stroke");
      if (fill !== "none") clone.setAttribute("fill", overrideColor);
      if (stroke && stroke !== "none") clone.setAttribute("stroke", overrideColor);
      if (!fill && !stroke) clone.setAttribute("fill", overrideColor);
    }

    const singleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}">${clone.outerHTML}</svg>`;
    const img = await loadSvgStringAsImage(singleSvg);
    if (img) {
      units.push({
        id: i,
        cx: vbW / 2,
        cy: vbH / 2,
        width: vbW,
        height: vbH,
        img,
      });
    }
  }

  return {
    viewBoxWidth: vbW,
    viewBoxHeight: vbH,
    units,
    fullImage: fullImg,
  };
}

function applyColorToSvgString(markup: string, color: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");
  const shapes = doc.querySelectorAll(SHAPE_SELECTOR);
  shapes.forEach((el) => {
    const fill = el.getAttribute("fill");
    const stroke = el.getAttribute("stroke");
    if (fill !== "none") el.setAttribute("fill", color);
    if (stroke && stroke !== "none") el.setAttribute("stroke", color);
    if (!fill && !stroke) el.setAttribute("fill", color);
  });
  return doc.documentElement.outerHTML;
}

export async function loadSvgStringAsImage(
  svgString: string
): Promise<HTMLImageElement | null> {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG load failed"));
      img.src = url;
    });
    return img;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
