import { useCallback, useMemo } from "react";
import { Button, Col, Row, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { FormikProps } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { faAssetStatusIds } from "../../../shared/constants/statuses";
import type { FaMovementFormValues, FaMovementLineValues } from "../types/form";
import FaMovementRouteCard from "./FaMovementRouteCard";
import useFaMovementLookups, { faMovementAssetDisplayConfig } from "./useFaMovementLookups";

const emptyLine = (): FaMovementLineValues => ({ faAssetId: null, note: "" });
interface RowValue extends FaMovementLineValues { key: number; index: number }

export default function FaMovementFormFields({ formik, isDraft }: { formik: FormikProps<FaMovementFormValues>; isDraft: boolean }) {
  const { t } = useTranslation();
  const { getAsset, departmentLabel, userLabel } = useFaMovementLookups();
  const addLine = () => void formik.setFieldValue("lines", [...formik.values.lines, emptyLine()]);
  const removeLine = useCallback((index: number) => void formik.setFieldValue("lines", formik.values.lines.filter((_, i) => i !== index)), [formik]);
  const rows = useMemo<RowValue[]>(() => formik.values.lines.map((line, index) => ({ ...line, key: index, index })), [formik.values.lines]);
  const columns = useMemo<TableColumnsType<RowValue>>(() => [
    { title: t("common.rowNumber"), dataIndex: "index", width: 62, align: "center", render: (index: number) => index + 1 },
    { title: t("fa.fields.faAssetId"), minWidth: 320, render: (_, row) => <SelectCustom path={selectListEndpoints.faAssetsSelectList} queryParams={{ statusId: faAssetStatusIds.active }} displayConfig={faMovementAssetDisplayConfig} formik={formik} fieldName={`lines[${row.index}].faAssetId`} search required marginBottom="mb-0" /> },
    { title: t("fa.movement.currentDepartment"), minWidth: 190, render: (_, row) => <span className="text-sm text-secondary-text">{departmentLabel(getAsset(row.faAssetId)?.departmentId)}</span> },
    { title: t("fa.movement.currentResponsible"), minWidth: 200, render: (_, row) => <span className="text-sm text-secondary-text">{userLabel(getAsset(row.faAssetId)?.responsibleUserId)}</span> },
    { title: t("fa.fields.note"), minWidth: 280, render: (_, row) => <InputText formik={formik} fieldName={`lines[${row.index}].note`} /> },
    { dataIndex: "actions", width: 64, align: "center", render: (_, row) => isDraft && rows.length > 1 ? <Button type="text" danger icon={<Trash2 className="size-4" />} onClick={() => removeLine(row.index)} /> : null },
  ], [departmentLabel, formik, getAsset, isDraft, removeLine, rows.length, t, userLabel]);
  return <div className="space-y-3">
    <Card className="p-4"><Row gutter={[16, 0]}><Col xs={24} md={8}><SelectDate formik={formik} fieldName="docDate" label="fa.fields.docDate" required /></Col><Col xs={24} md={8}><SelectCustom path={selectListEndpoints.departmentsSelectList} formik={formik} fieldName="toDepartmentId" label="fa.fields.toDepartmentId" search clearable /></Col><Col xs={24} md={8}><SelectCustom path={selectListEndpoints.usersSelectList} formik={formik} fieldName="toResponsibleUserId" label="fa.fields.toResponsibleUserId" search clearable /></Col><Col span={24}><InputText formik={formik} fieldName="note" label="fa.movement.generalNote" /></Col></Row>{typeof formik.errors === "string" && <div className="text-sm text-red-500">{formik.errors}</div>}</Card>
    <FaMovementRouteCard previousLocation="" previousTitle={t("fa.movement.currentLocations")} destinationDepartment={departmentLabel(formik.values.toDepartmentId)} destinationUser={userLabel(formik.values.toResponsibleUserId)} />
    <Card className="overflow-hidden border border-border"><div className="flex items-start justify-between border-b border-border px-4 py-4"><div><div className="font-semibold text-heading">{t("fa.movement.assetsToMove")}</div><div className="mt-1 text-sm text-secondary-text">{t("fa.movement.assetsToMoveDescription")}</div></div>{isDraft && <Button type="primary" ghost icon={<Plus className="size-4" />} onClick={addLine}>{t("fa.actions.addAsset")}</Button>}</div><Table columns={columns} dataSource={rows} pagination={false} scroll={{ x: "max-content" }} /></Card>
  </div>;
}
