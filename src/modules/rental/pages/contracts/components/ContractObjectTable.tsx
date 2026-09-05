import { useState } from "react";
import dayjs from "dayjs";
import { Button, Col, Collapse, Row } from "antd";
import type { CollapseProps } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import { Building2, Plus, Trash2 } from "lucide-react";
import InputNumber from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import InputTextArea from "@/components/fields/InputTextArea";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectStatic from "@/components/fields/SelectStatic";
import SelectDate from "@/components/fields/SelectDate";
import { chartAccountSelectDisplayConfig } from "@/shared/constants/selectLists";
import SectionCard from "@/components/ui/card/SectionCard";
import type {
  RentalContractObjectForm,
  RentalContractForm,
} from "../types/form";
import { emptyObject } from "../utils/defaults";
import {
  appendRentalContractObject,
  removeRentalContractObject,
} from "../utils/objectEditor";
import RentalUtilityServiceCards from "./RentalUtilityServiceCards";

const periodOptions = [
  { value: "MONTH", label: "rental.period.month" },
  { value: "DAY", label: "rental.period.day" },
] as const;

interface ContractObjectTableProps {
  formik: FormikProps<RentalContractForm>;
  disabled?: boolean;
}

export default function ContractObjectTable({
  formik,
  disabled = false,
}: ContractObjectTableProps) {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState<string[]>(["object-0"]);
  const objects = formik.values.objects ?? [];

  const addObject = () => {
    const object = emptyObject(formik.values.startDate, formik.values.endDate);
    void formik.setFieldValue(
      "objects",
      appendRentalContractObject(objects, object),
      true,
    );
    setActiveKeys((keys) => [...keys, `object-${objects.length}`]);
  };

  const removeObject = (index: number) => {
    void formik.setFieldValue(
      "objects",
      removeRentalContractObject(objects, index),
      true,
    );
    setActiveKeys(["object-0"]);
  };

  const renderObjectFields = (objectIndex: number) => {
    const object = objects[objectIndex];
    if (!object) return null;

    return (
      <div className="rounded-xl border border-border/60 bg-background/40 p-2 sm:p-3 ">
      <Row gutter={[20, 0]}>
        <Col span={4}>
          <SelectCustom
            formik={formik as FormikProps<object>}
            fieldName={`objects[${objectIndex}].rentalObjectTypeId`}
            path="manuals/rental-object-types"
            label="rental.fields.objectType"
            search
            required
          />
        </Col>
        <Col span={4}>
          <InputText
            formik={formik}
            fieldName={`objects[${objectIndex}].objectName`}
            label="rental.fields.objectName"
            required
          />
        </Col>
        <Col span={4}>
          <InputNumber
            formik={formik}
            fieldName={`objects[${objectIndex}].totalArea`}
            label="rental.fields.totalArea"
            min={0}
            precision={4}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            formik={formik}
            fieldName={`objects[${objectIndex}].rentedArea`}
            label="rental.fields.rentedArea"
            min={0}
            precision={4}
          />
        </Col>
        <Col span={4}>
          <InputText
            formik={formik}
            fieldName={`objects[${objectIndex}].objectIdentifier`}
            label="rental.fields.identifier"
          />
        </Col>

        <Col span={4}>
          <InputNumber
            formik={formik}
            fieldName={`objects[${objectIndex}].periodAmount`}
            label="rental.fields.periodAmount"
            min={1}
            precision={2}
            required
            disabled={disabled || formik.values.isFreeOfCharge}
          />
        </Col>
        <Col span={4}>
          <SelectStatic
            formik={formik as FormikProps<object>}
            fieldName={`objects[${objectIndex}].periodUnit`}
            options={periodOptions}
            label="rental.fields.periodUnit"
            required
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik as FormikProps<object>}
            fieldName={`objects[${objectIndex}].expenseAccountId`}
            label="rental.fields.expenseAccount"
            path="manuals/chart-accounts"
            search
            displayConfig={chartAccountSelectDisplayConfig}
            required={!formik.values.isFreeOfCharge}
            disabled={disabled || formik.values.isFreeOfCharge}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            formik={formik}
            fieldName={`objects[${objectIndex}].taxBaseAmount`}
            label="rental.fields.taxBaseAmount"
            min={0}
            required
            disabled={disabled || formik.values.isFreeOfCharge}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            formik={formik}
            fieldName={`objects[${objectIndex}].taxRate`}
            label="rental.fields.taxRate"
            min={0}
            max={100}
            required
            disabled={disabled || formik.values.isFreeOfCharge}
          />
        </Col>
        <Col span={4}>
          <SelectDate
            formik={formik as FormikProps<object>}
            fieldName={`objects[${objectIndex}].startDate`}
            label="rental.fields.startDate"
            valueFormat="YYYY-MM-DD"
            minDate={
              formik.values.startDate
                ? dayjs(formik.values.startDate)
                : undefined
            }
            maxDate={
              formik.values.endDate ? dayjs(formik.values.endDate) : undefined
            }
            required
          />
        </Col>
        <Col span={4}>
          <SelectDate
            formik={formik as FormikProps<object>}
            fieldName={`objects[${objectIndex}].endDate`}
            label="rental.fields.endDate"
            valueFormat="YYYY-MM-DD"
            minDate={object.startDate ? dayjs(object.startDate) : undefined}
            maxDate={
              formik.values.endDate ? dayjs(formik.values.endDate) : undefined
            }
            clearable
          />
        </Col>
        <Col span={24}>
          <InputTextArea
            formik={formik}
            fieldName={`objects[${objectIndex}].objectAddress`}
            label="rental.fields.address"
            // rows={2}
            // maxLength={500}
          />
        </Col>
        <Col span={24}>
          <RentalUtilityServiceCards
            formik={formik}
            objectIndex={objectIndex}
            disabled={disabled}
          />
        </Col>
      </Row>
      </div>
    );
  };

  const objectItems: CollapseProps["items"] = objects.map(
    (object: RentalContractObjectForm, objectIndex) => ({
      key: `object-${objectIndex}`,
      label: (
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-semibold">
            {t("rental.contracts.objectNumber", { number: objectIndex + 1 })}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {object.objectName || t("rental.contracts.newObject")}
          </span>
        </div>
      ),
      extra:
        !disabled && objects.length > 1 ? (
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 className="size-4" />}
            onClick={(event) => {
              event.stopPropagation();
              removeObject(objectIndex);
            }}
            aria-label={t("common.delete")}
          >
            {t("common.delete")}
          </Button>
        ) : null,
      children: renderObjectFields(objectIndex),
    }),
  );

  return (
    <SectionCard
      title={t("rental.contracts.objects")}
      icon={<Building2 className="size-4" />}
      bodyClassName="p-5! sm:p-6!"
      extra={
        !disabled && (
          <Button
            type="primary"
            ghost
            size="small"
            icon={<Plus className="size-4" />}
            onClick={addObject}
          >
            {t("common.add")}
          </Button>
        )
      }
    >
      <div className="mb-4 text-sm text-muted-foreground">
        {t("rental.contracts.objectsDescription")}
      </div>
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys : [keys])}
        items={objectItems}
        className="bg-transparent"
      />
      {!objects.length && (
        <div className="pt-3 text-sm text-muted-foreground">
          {t("rental.contracts.noObjects")}
        </div>
      )}
    </SectionCard>
  );
}
