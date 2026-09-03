import { Form } from "antd";
import type { FormikProps } from "formik";
import type { ReactNode } from "react";
import type { RentalAccrualDetail } from "../types/type";
import type { RentalAccrualForm } from "../types/form";
import AccrualEditForm from "./AccrualEditForm";
import AccrualItemsTable from "./AccrualItemsTable";
import AccrualSummaryCard from "./AccrualSummaryCard";
import AccrualReadonlyView from "./readonly/AccrualReadonlyView";

interface AccrualDetailContentProps {
  data: RentalAccrualDetail;
  formik?: FormikProps<RentalAccrualForm>;
  disabled?: boolean;
  actions?: ReactNode;
}

export default function AccrualDetailContent({
  data,
  formik,
  disabled = false,
  actions,
}: AccrualDetailContentProps) {
  if (!formik) return <AccrualReadonlyView data={data} actions={actions} />;

  return (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <div className="space-y-2">
        <AccrualSummaryCard data={data} />
        <AccrualEditForm formik={formik} disabled={disabled} />
        <AccrualItemsTable data={data} formik={formik} disabled={disabled} />
        {actions}
      </div>
    </Form>
  );
}
