import type { MarkerColor } from "../types";

/** Marker colours of the design, in order; a marker without one takes the next by its number. */
export const markerColors: Record<MarkerColor, { bg: string; border: string; text: string }> = {
  blue: { bg: "#1677ff", border: "#1677ff", text: "#1677ff" },
  green: { bg: "#16a34a", border: "#16a34a", text: "#16a34a" },
  orange: { bg: "#f97316", border: "#f97316", text: "#f97316" },
  purple: { bg: "#9333ea", border: "#9333ea", text: "#9333ea" },
  red: { bg: "#e11d48", border: "#e11d48", text: "#e11d48" },
  yellow: { bg: "#eab308", border: "#eab308", text: "#ca8a04" },
  pink: { bg: "#db2777", border: "#db2777", text: "#db2777" },
  teal: { bg: "#0d9488", border: "#0d9488", text: "#0d9488" },
};

const order: MarkerColor[] = ["blue", "green", "orange", "purple", "red", "yellow", "pink", "teal"];

export const colorOf = (n: number, color?: MarkerColor) => markerColors[color ?? order[(n - 1) % order.length]];
