import { useId } from "react";
import { cn } from "@/lib/utils";

export function stripSvgWhiteBackground(svgRaw) {
  return svgRaw
    .replace(/<rect[^>]*fill="#ffffff"[^>]*\/>/i, "")
    .replace(/<g><path fill="#ffffff" stroke="#ffffff" stroke-width="0\.5" d="M 0,0[\s\S]*?<\/g>/i, "");
}

export function prepareIllustrationSvg(svgRaw) {
  let svg = stripSvgWhiteBackground(svgRaw);
  if (!/viewBox=/i.test(svg)) {
    svg = svg.replace(/width="(\d+)px" height="(\d+)px"/i, 'viewBox="0 0 $1 $2" width="100%" height="100%"');
  }
  return svg;
}

/** Wrap a raw SVG string (Vite `?raw` import) as a React icon component. */
export function createSvgIcon(svgRaw, displayName) {
  function SvgIcon({ className, ...props }) {
    return (
      <span
        className={cn("inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-full", className)}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: svgRaw }}
        {...props}
      />
    );
  }

  SvgIcon.displayName = displayName;
  return SvgIcon;
}

/** Full-bleed repeating pattern backdrop from a tiled SVG definition. */
export function createPatternBackdrop(tiles) {
  function PatternBackdrop({ className = "", variant = "mandala" }) {
    const uid = useId().replace(/:/g, "");
    const patternId = `pat-${variant}-${uid}`;
    const tile = tiles[variant] ?? tiles.mandala;
    const defs = tile.replace(/id="pat-[^"]+"/, `id="${patternId}"`);

    return (
      <span
        className={cn("pointer-events-none absolute inset-0 block h-full w-full", className)}
        aria-hidden
        dangerouslySetInnerHTML={{
          __html: `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" preserveAspectRatio="none">${defs}<rect width="100%" height="100%" fill="url(#${patternId})"/></svg>`,
        }}
      />
    );
  }

  PatternBackdrop.displayName = "PatternBackdrop";
  return PatternBackdrop;
}
