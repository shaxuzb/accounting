import { useCallback, useEffect, useMemo } from "react";
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
import type {
  FaMovementFormValues,
  FaMovementLineValues,
} from "../types/form";
import FaMovementRouteCard from "./FaMovementRouteCard";
import useFaMovementLookups, {
  faMovementAssetDisplayConfig,
} from "./useFaMovementLookups";

const createEmptyLine = (
  currentUserId: number | null,
): FaMovementLineValues => ({
  faAssetId: null,
  fromDepartmentId: null,
  fromResponsibleUserId: currentUserId,
  note: "",
});

interface MovementLineRow extends FaMovementLineValues {
  key: number;
  index: number;
}

export default function FaMovementFormFields({
  formik,
  isDraft,
  currentUserId,
}: {
  formik: FormikProps<FaMovementFormValues>;
  isDraft: boolean;
  currentUserId: number | null;
}) {
  const { t } = useTranslation();
  const lookups = useFaMovementLookups();
  const { assets, getAsset, departmentLabel, userLabel } = lookups;

  useEffect(() => {
    if (!isDraft || !assets.length) return;

    let hasChanges = false;
    const nextLines = formik.values.lines.map((line) => {
      if (line.faAssetId == null) return line;

      const asset = getAsset(line.faAssetId);
      if (!asset) return line;

      const fromDepartmentId =
        line.fromDepartmentId ?? asset.departmentId ?? null;
      const fromResponsibleUserId = currentUserId;

      if (
        fromDepartmentId === line.fromDepartmentId &&
        fromResponsibleUserId === line.fromResponsibleUserId
      ) {
        return line;
      }

      hasChanges = true;
      return {
        ...line,
        fromDepartmentId,
        fromResponsibleUserId,
      };
    });

    if (hasChanges) {
      void formik.setFieldValue("lines", nextLines, false);
    }
  }, [assets.length, currentUserId, formik, getAsset, isDraft]);

  const handleAddLine = () => {
    formik.setFieldValue("lines", [
      ...formik.values.lines,
      createEmptyLine(currentUserId),
    ]);
  };

  const handleRemoveLine = useCallback(
    (index: number) => {
      formik.setFieldValue(
        "lines",
        formik.values.lines.filter((_, lineIndex) => lineIndex !== index),
      );
    },
    [formik],
  );

  const handleAssetChange = useCallback(
    (index: number, value: unknown) => {
      const faAssetId = value == null ? null : Number(value);
      const asset = getAsset(faAssetId);

      void formik.setValues(
        (currentValues) => ({
          ...currentValues,
          lines: currentValues.lines.map((line, lineIndex) =>
            lineIndex === index
              ? {
                  ...line,
                  faAssetId,
                  fromDepartmentId: asset?.departmentId ?? null,
                  fromResponsibleUserId: currentUserId,
                }
              : line,
          ),
        }),
        false,
      );
    },
    [currentUserId, formik, getAsset],
  );

  const rows = useMemo<MovementLineRow[]>(
    () =>
      formik.values.lines.map((line, index) => ({
        ...line,
        key: index,
        index,
      })),
    [formik.values.lines],
  );

  const columns = useMemo<TableColumnsType<MovementLineRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
        align: "center",
        width: 62,
        render: (index: number) => index + 1,
      },
      {
        title: t("fa.fields.faAssetId"),
        dataIndex: "faAssetId",
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.faAssetsSelectList}
              displayConfig={faMovementAssetDisplayConfig}
              value={row.faAssetId}
              onChange={(value) => handleAssetChange(row.index, value)}
              search
              required
              marginBottom="mb-0"
            />
          </div>
        ),
      },
      {
        title: t("fa.movement.currentDepartment"),
        dataIndex: "currentDepartment",
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.departmentsSelectList}
              formik={formik}
              fieldName={`lines[${row.index}].fromDepartmentId`}
              search
              required
              marginBottom="mb-0"
            />
          </div>
        ),
      },
      {
        title: t("fa.movement.currentResponsible"),
        dataIndex: "currentResponsible",
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <SelectCustom
              path={selectListEndpoints.usersSelectList}
              formik={formik}
              fieldName={`lines[${row.index}].fromResponsibleUserId`}
              search
              required
              marginBottom="mb-0"
              disabled
            />
          </div>
        ),
      },
      {
        title: t("fa.fields.note"),
        dataIndex: "note",
        minWidth: 240,
        render: (_, row) => (
          <div className="[&_.ant-form-item]:mb-0!">
            <InputText
              formik={formik}
              fieldName={`lines[${row.index}].note`}
            />
          </div>
        ),
      },
      {
        dataIndex: "actions",
        align: "center",
        width: 64,
        render: (_, row) =>
          isDraft && formik.values.lines.length > 1 ? (
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4" />}
              aria-label={t("common.delete")}
              onClick={() => handleRemoveLine(row.index)}
            />
          ) : null,
      },
    ],
    [formik, handleAssetChange, handleRemoveLine, isDraft, t],
  );

  const destinationDepartment = departmentLabel(formik.values.toDepartmentId);
  const destinationUser = userLabel(formik.values.toResponsibleUserId);

  return (
    <div className="min-w-0 space-y-4">
      <Card className=" p-3 ">
        <Row gutter={[16, 0]}>
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
          <Col span={24}>
            <InputText
              formik={formik}
              fieldName="note"
              label="fa.movement.generalNote"
            />
          </Col>
        </Row>
      </Card>

      <FaMovementRouteCard
        previousLocation=""
        previousTitle={t("fa.movement.currentLocations")}
        destinationDepartment={destinationDepartment}
        destinationUser={destinationUser}
      />

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <div className="text-base font-semibold text-heading">
              {t("fa.movement.assetsToMove")}
            </div>
            <div className="mt-1 text-sm text-secondary-text">
              {t("fa.movement.assetsToMoveDescription")}
            </div>
          </div>
          {isDraft && (
            <Button
              type="primary"
              ghost
              icon={<Plus className="size-4" />}
              onClick={handleAddLine}
            >
              {t("fa.actions.addAsset")}
            </Button>
          )}
        </div>

        <Table<MovementLineRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />

        <div className="border-t border-border px-4 py-3 text-sm text-secondary-text sm:px-5">
          {t("fa.movement.selectedAssets", {
            count: formik.values.lines.length,
          })}
        </div>

        {typeof formik.errors.lines === "string" && (
          <div className="border-t border-border px-4 py-3 text-sm text-red-500">
            {formik.errors.lines}
          </div>
        )}
      </Card>
    </div>
  );
}
