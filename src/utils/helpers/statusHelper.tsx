import { Tag } from "antd";

export const stateStatus = (statusId: number, status: string) => {
  return (
    <Tag
      className="text-sm! m-0!"
      variant="outlined"
      color={statusId === 1 ? "green" : "red"}
    >
      {status}
    </Tag>
  );
};
