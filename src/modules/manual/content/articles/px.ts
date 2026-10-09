import type { ManualMarker } from "../../types";

/**
 * Markers by the screenshot's pixels (the shots are 1568 px wide), turned into percent: a
 * marker's centre, the frame around its field as [left, top, right, bottom] and its extras.
 */
export const px =
  (w: number, h: number) =>
  (n: number, x: number, y: number, box?: [number, number, number, number], extra?: Partial<ManualMarker>): ManualMarker => ({
    n,
    x: (x / w) * 100,
    y: (y / h) * 100,
    box: box && [(box[0] / w) * 100, (box[1] / h) * 100, ((box[2] - box[0]) / w) * 100, ((box[3] - box[1]) / h) * 100],
    ...extra,
  });
