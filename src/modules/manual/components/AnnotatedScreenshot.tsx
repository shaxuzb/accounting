import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ManualField, ManualScreenshot } from "../types";
import { colorOf } from "./markers";

/**
 * The page as it looks, with numbered markers on its fields and frames around them. Pointing
 * at a marker shows that field's explanation right beside it, so the reader learns the page
 * without leaving the picture; a click pins the explanation until it is closed or another
 * marker is chosen. The fields table below lights the same row.
 */
export default function AnnotatedScreenshot({
  shot,
  fields,
  active,
  onActivate,
}: {
  shot: ManualScreenshot;
  /** The article's fields by marker number. */
  fields: Map<number, ManualField>;
  active: number | null;
  onActivate: (n: number | null) => void;
}) {
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // a click outside the picture or Escape lets the pinned explanation go
  useEffect(() => {
    if (pinned === null) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPinned(null);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPinned(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  const shown = hovered ?? pinned;
  const shownMarker = shot.markers.find((marker) => marker.n === shown);
  const shownField = shown !== null ? fields.get(shown) : undefined;

  return (
    <figure className="m-0">
      {/* a narrow shot (a dialog) keeps its own size instead of being blown up to the column */}
      <div
        ref={rootRef}
        className="relative mx-auto w-full"
        style={{ aspectRatio: `${shot.width} / ${shot.height}`, maxWidth: shot.width }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-secondary-foreground">
          <img src={shot.src} alt={shot.alt} className="h-full w-full object-cover object-top" />
        </div>
        {shot.markers.map((marker) => {
          const color = colorOf(marker.n, marker.color);
          const lit = active === marker.n || shown === marker.n;
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
              {marker.callout && shown !== marker.n && (
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
                className="absolute z-20 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md transition-transform"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  background: color.bg,
                  transform: `translate(-50%, -50%) scale(${lit ? 1.2 : 1})`,
                  outline: pinned === marker.n ? `3px solid ${color.bg}66` : undefined,
                }}
                onMouseEnter={() => {
                  setHovered(marker.n);
                  onActivate(marker.n);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  onActivate(null);
                }}
                onFocus={() => onActivate(marker.n)}
                onBlur={() => onActivate(null)}
                onClick={() => setPinned((current) => (current === marker.n ? null : marker.n))}
              >
                {marker.n}
              </button>
            </div>
          );
        })}

        {shownMarker && shownField && (
          <div
            className="absolute z-30 w-[min(360px,90%)] rounded-xl border bg-primary-bg p-3 text-sm shadow-xl"
            style={{ borderColor: colorOf(shownMarker.n, shownMarker.color).border, ...cardPosition(shownMarker.x, shownMarker.y) }}
            // the card stays while the pointer moves onto it
            onMouseEnter={() => setHovered(shownMarker.n)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mb-2 flex items-start gap-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: colorOf(shownMarker.n, shownMarker.color).bg }}
              >
                {shownMarker.n}
              </span>
              <div className="min-w-0 flex-1 font-semibold text-primary-text">
                {shownField.name}
                {shownField.required && (
                  <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">majburiy</span>
                )}
              </div>
              {pinned === shownMarker.n && (
                <button
                  type="button"
                  aria-label="Yopish"
                  className="cursor-pointer rounded p-0.5 text-secondary-text hover:bg-secondary-foreground"
                  onClick={() => setPinned(null)}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <dl className="m-0 space-y-1.5 text-[13px] leading-snug">
              <FieldLine label="Nima kiritiladi" text={shownField.enter} />
              <FieldLine label="O'zgartirilsa" text={shownField.onChange} />
              <FieldLine label="Ta'siri" text={shownField.affects} />
            </dl>
          </div>
        )}
      </div>
      {shot.caption && <figcaption className="mt-2 text-xs text-secondary-text">{shot.caption}</figcaption>}
    </figure>
  );
}

function FieldLine({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-secondary-text">{label}</dt>
      <dd className="m-0 text-primary-text">{text}</dd>
    </div>
  );
}

/** Beside the marker, on the side with more room, so the card never hides its own field. */
const cardPosition = (x: number, y: number) => {
  const horizontal = x > 55 ? { right: `${100 - x + 2.5}%` } : { left: `${x + 2.5}%` };
  const vertical = y > 50 ? { bottom: `${100 - y - 3}%` } : { top: `${Math.max(y - 3, 0)}%` };
  return { ...horizontal, ...vertical };
};

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
