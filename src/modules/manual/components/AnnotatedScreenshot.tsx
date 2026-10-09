import type { ManualScreenshot } from "../types";
import { colorOf } from "./markers";

/**
 * The page as it looks, with numbered markers on its fields and frames around them. Pointing
 * at a marker lights its row in the fields table below and the other way round; a click
 * takes the reader to the field's explanation.
 */
export default function AnnotatedScreenshot({
  shot,
  active,
  onActivate,
  onSelect,
}: {
  shot: ManualScreenshot;
  active: number | null;
  onActivate: (n: number | null) => void;
  onSelect: (n: number) => void;
}) {
  return (
    <figure className="m-0">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-secondary-foreground"
        style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
      >
        <img src={shot.src} alt={shot.alt} className="absolute inset-0 h-full w-full object-cover object-top" />
        {shot.markers.map((marker) => {
          const color = colorOf(marker.n, marker.color);
          const lit = active === marker.n;
          return (
            <div key={marker.n}>
              {marker.box && (
                <div
                  className="pointer-events-none absolute rounded-md transition-all"
                  style={{
                    left: `${marker.box[0]}%`,
                    top: `${marker.box[1]}%`,
                    width: `${marker.box[2]}%`,
                    height: `${marker.box[3]}%`,
                    border: `2px solid ${color.border}`,
                    background: lit ? `${color.bg}22` : "transparent",
                    boxShadow: lit ? `0 0 0 4px ${color.bg}33` : undefined,
                  }}
                />
              )}
              {marker.callout && (
                <div
                  className="pointer-events-none absolute z-10 max-w-[28%] rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium leading-snug text-gray-800 shadow-md"
                  style={{
                    border: `2px solid ${color.border}`,
                    ...calloutPosition(marker.x, marker.y, marker.calloutSide ?? "right"),
                  }}
                >
                  {marker.callout}
                </div>
              )}
              <button
                type="button"
                aria-label={`${marker.n}`}
                className="absolute z-20 flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md transition-transform"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  background: color.bg,
                  transform: `translate(-50%, -50%) scale(${lit ? 1.2 : 1})`,
                }}
                onMouseEnter={() => onActivate(marker.n)}
                onMouseLeave={() => onActivate(null)}
                onFocus={() => onActivate(marker.n)}
                onBlur={() => onActivate(null)}
                onClick={() => onSelect(marker.n)}
              >
                {marker.n}
              </button>
            </div>
          );
        })}
      </div>
      {shot.caption && <figcaption className="mt-2 text-xs text-secondary-text">{shot.caption}</figcaption>}
    </figure>
  );
}

const calloutPosition = (x: number, y: number, side: "left" | "right" | "top" | "bottom") => {
  switch (side) {
    case "left":
      return { right: `${100 - x + 2.2}%`, top: `${y}%`, transform: "translateY(-50%)" };
    case "top":
      return { left: `${x}%`, bottom: `${100 - y + 3.5}%`, transform: "translateX(-50%)" };
    case "bottom":
      return { left: `${x}%`, top: `${y + 3.5}%`, transform: "translateX(-50%)" };
    default:
      return { left: `${x + 2.2}%`, top: `${y}%`, transform: "translateY(-50%)" };
  }
};
