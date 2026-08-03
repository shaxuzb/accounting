import {
  Button,
  Col,
  Divider,
  Row,
  Typography,
  Card as AntdCard,
} from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Delete, Plus } from "lucide-react";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { FaMovementFormValues } from "../types/form";

const emptyLine = { faAssetId: null, note: "" };

export default function FaMovementFormFields({
  formik,
  isDraft,
}: {
  formik: FormikProps<FaMovementFormValues>;
  isDraft: boolean;
}) {
  const { t } = useTranslation();
  const handleAddLine = () => {
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      { ...emptyLine },
    ]);
  };
  const handleRemoveLine = (index: number) => {
    formik.setFieldValue(
      "lines",
      formik.values.lines.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  return (
    <>
      <Row gutter={[20, 8]}>
        <Col xs={24} md={12} xl={8}>
          <SelectDate
            formik={formik}
            fieldName="docDate"
            label="fa.fields.docDate"
            required
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <SelectCustom
            path={selectListEndpoints.departmentsSelectList}
            formik={formik}
            fieldName="toDepartmentId"
            label="fa.fields.toDepartmentId"
            search
            required
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <SelectCustom
            path={selectListEndpoints.usersSelectList}
            formik={formik}
            fieldName="toResponsibleUserId"
            label="fa.fields.toResponsibleUserId"
            search
            required
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <InputText
            formik={formik}
            fieldName="note"
            label="fa.fields.note"
          />
        </Col>
      </Row>

      <Divider className="my-4" />

      <div className="mb-4 flex justify-between items-center">
        <Typography.Text strong className="text-lg">
          {t("fa.sections.movementDetails")}
        </Typography.Text>
        {isDraft && (
          <Button
            type="dashed"
            icon={<Plus className="size-4" />}
            onClick={handleAddLine}
          >
            {t("common.add")}
          </Button>
        )}
      </div>

      {formik.values.lines.map((_, lineIndex) => (
        <AntdCard
          key={`line-${lineIndex}`}
          size="small"
          className="mb-4 bg-gray-50/50 border border-border shadow-sm"
          title={
            <div className="flex justify-between items-center mb-1">
              <Typography.Text strong>
                {t("fa.sections.lineNumber", { number: lineIndex + 1 })}
              </Typography.Text>
              {isDraft && formik.values.lines.length > 1 && (
                <Button
                  danger
                  size="small"
                  icon={<Delete className="size-4" />}
                  onClick={() => handleRemoveLine(lineIndex)}
                />
              )}
            </div>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <SelectCustom
                path={selectListEndpoints.faAssetsSelectList}
                formik={formik}
                fieldName={`lines[${lineIndex}].faAssetId`}
                label="fa.fields.faAssetId"
                search
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName={`lines[${lineIndex}].note`}
                label="fa.fields.note"
              />
            </Col>
          </Row>
        </AntdCard>
      ))}

      {typeof formik.errors.lines === "string" && (
        <div className="text-red-500 text-sm mt-2">
          {formik.errors.lines}
        </div>
      )}
    </>
  );
}
