import type { ComponentProps } from "react";
import SelectStatic from "./SelectStatic";
import { IN_OUT_DIRECTION_OPTIONS } from "./directionOptions";

type InOutSelectProps = Omit<ComponentProps<typeof SelectStatic>, "options">;

export default function InOutSelect(props: InOutSelectProps) {
  return <SelectStatic {...props} options={IN_OUT_DIRECTION_OPTIONS} />;
}
