export const IN_OUT_DIRECTION_OPTIONS = [
  { value: 1, label: "common.income" },
  { value: -1, label: "common.expense" },
] as const;

export const directionLabelKey = (directionId: number | null | undefined) =>
  directionId === 1 ? "common.income" : "common.expense";
