import { Form } from "antd";
import type { FormikProps } from "formik";
import type { RentalAccrualDetail } from "../types/type";
import type { RentalAccrualForm } from "../types/form";
import AccrualEditForm from "./AccrualEditForm";
import AccrualItemsTable from "./AccrualItemsTable";
import AccrualSummaryCard from "./AccrualSummaryCard";
import AccrualReadonlyView from "./readonly/AccrualReadonlyView";

interface AccrualDetailContentProps {
  data: RentalAccrualDetail;
  formik?: FormikProps<RentalAccrualForm>;
}

export default function AccrualDetailContent({
  data,
  formik,
}: AccrualDetailContentProps) {
  if (!formik) return <AccrualReadonlyView data={data} />;

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <div className="space-y-4">
        <AccrualSummaryCard data={data} />
        <AccrualEditForm formik={formik} />
        <AccrualItemsTable data={data} formik={formik} />
      </div>
    </Form>
  );
}
