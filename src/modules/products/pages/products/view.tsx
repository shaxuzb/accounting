import { useParams } from "react-router";
import { Card, Descriptions, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useGetDetailProducts } from "../../hooks/useGetDetailProducts";

export default function ProductsViewPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data, isLoading } = useGetDetailProducts(id);

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <Card title="View Products">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{data?.id}</Descriptions.Item>
        <Descriptions.Item label={t("common.name", "Name")}>{data?.name}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
