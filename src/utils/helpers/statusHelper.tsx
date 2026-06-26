import { Tag } from "antd";

export const stateStatus = (stateId?: number | null, stateName?: string | null) => {
  return (
    <Tag
      className="text-sm! m-0!"
      variant="outlined"
      color={stateId === 1 ? "green" : "red"}
    >
      {stateName || "-"}
    </Tag>
  );
};
