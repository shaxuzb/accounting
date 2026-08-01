import {
  Button,
  Col,
  Form,
  Row,
  Spin,
  Divider,
  Typography,
  Card as AntdCard,
} from "antd";
import { useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import {
  Calendar,
  CheckCircle2,
  CircleX,
  Delete,
  Plus,
  Save,
} from "lucide-react";

import InputText from "@/components/fields/InputText";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import InputNumber from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";

import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate } from "@/utils/utils";

import { faReceiptSchema } from "../types/schema";
import type { FaReceiptFormValues } from "../types/form";
import {
  useCancelFaReceipt,
  useConfirmFaReceipt,
  useCreateFaReceipt,
  useGetDetailFaReceipt,
  useUpdateFaReceipt,
} from "../hooks";
import { faReceiptPermissions } from "../constants/permissions";

const { Text } = Typography;

const defaultValues: FaReceiptFormValues = {
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  counterpartyId: null as unknown as number,
  warehouseId: null as unknown as number,
  currencyId: null as unknown as number,
  receiptType: "",
  supplierAccountId: null,
  lines: [
    {
      sourceProductId: null as unknown as number,
      name: "",
      quantity: 1,
      price: 0,
      vatRateId: null as unknown as number,
      capitalInvestmentAccountId: null,
      vatAccountId: null,
      assets: [
        {
          inventoryNumber: "",
          name: "",
          initialCost: 0,
          salvageValue: 0,
          usefulLifeMonths: 1,
          depreciationMethodId: null as unknown as number,
          faGroupId: null as unknown as number,
          okofId: null as unknown as number,
          commissioningDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          deprStartDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          plannedUnitsTotal: 0,
          departmentId: null as unknown as number,
          responsibleUserId: null as unknown as number,
          assetAccountId: null,
          accumulatedDepreciationAccountId: null,
          depreciationExpenseAccountId: null,
        },
      ],
    },
  ],
};

export default function FaReceiptFormPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.user.permissions ?? [];
  const canView =
    permissions.includes(faReceiptPermissions.view) ||
    permissions.includes(faReceiptPermissions.detail);
  const canCreate = permissions.includes(faReceiptPermissions.create);
  const canUpdate = permissions.includes(faReceiptPermissions.update);
  const canSubmit = isCreate ? canCreate : canUpdate;

  const detailQuery = useGetDetailFaReceipt(id);
  const createMutation = useCreateFaReceipt();
  const updateMutation = useUpdateFaReceipt();
  const confirmMutation = useConfirmFaReceipt(id);
  const cancelMutation = useCancelFaReceipt(id);

  const record = detailQuery.data;
  const statusId = record?.statusId ?? 1;
  const isDraft = isCreate || statusId === 1;

  const initialValues = useMemo<FaReceiptFormValues>(
    () => ({
      docDate: record?.docDate ?? defaultValues.docDate,
      counterpartyId: record?.counterpartyId ?? defaultValues.counterpartyId,
      warehouseId: record?.warehouseId ?? defaultValues.warehouseId,
      currencyId: record?.currencyId ?? defaultValues.currencyId,
      receiptType: record?.receiptType ?? defaultValues.receiptType,
      supplierAccountId:
        record?.supplierAccountId ?? defaultValues.supplierAccountId,
      lines: record?.lines?.length ? record.lines : defaultValues.lines,
    }),
    [record],
  );

  const formik = useFormik<FaReceiptFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: faReceiptSchema(t),
    onSubmit: async (values) => {
      try {
        const payload = {
          docDate: values.docDate,
          counterpartyId: Number(values.counterpartyId),
          warehouseId: Number(values.warehouseId),
          currencyId: Number(values.currencyId),
          receiptType: values.receiptType,
          supplierAccountId: Number(values.supplierAccountId),
          lines: values.lines.map((line) => ({
            ...line,
            sourceProductId: Number(line.sourceProductId),
            quantity: Number(line.quantity),
            price: Number(line.price),
            vatRateId: Number(line.vatRateId),
            capitalInvestmentAccountId: Number(
              line.capitalInvestmentAccountId,
            ),
            vatAccountId: Number(line.vatAccountId),
            assets: line.assets.map((asset) => ({
              ...asset,
              initialCost: Number(asset.initialCost),
              salvageValue: Number(asset.salvageValue),
              usefulLifeMonths: Number(asset.usefulLifeMonths),
              depreciationMethodId: Number(asset.depreciationMethodId),
              faGroupId: Number(asset.faGroupId),
              okofId: Number(asset.okofId),
              plannedUnitsTotal: Number(asset.plannedUnitsTotal),
              departmentId: Number(asset.departmentId),
              responsibleUserId: Number(asset.responsibleUserId),
              assetAccountId: Number(asset.assetAccountId),
              accumulatedDepreciationAccountId: Number(
                asset.accumulatedDepreciationAccountId,
              ),
              depreciationExpenseAccountId: Number(
                asset.depreciationExpenseAccountId,
              ),
            })),
          })),
        };

        if (!isCreate && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
          navigate(`/main/fa/receipts/edit/${id}`, { replace: true });
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
          navigate(`/main/fa/receipts/edit/${created.id}`, { replace: true });
        }
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  const saveDraft = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      toast.error(t("common.requiredFields"));
      return false;
    }
    await formik.submitForm();
    return true;
  };

  const ensureSavedBeforeAction = async () => {
    if (!formik.dirty) return true;
    return saveDraft();
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const handleAddLine = () => {
    const newLines = [...formik.values.lines, { ...defaultValues.lines[0] }];
    formik.setFieldValue("lines", newLines);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = formik.values.lines.filter((_, i) => i !== index);
    formik.setFieldValue("lines", newLines);
  };

  const handleAddAsset = (lineIndex: number) => {
    const newAssets = [
      ...formik.values.lines[lineIndex].assets,
      { ...defaultValues.lines[0].assets[0] },
    ];
    formik.setFieldValue(`lines[${lineIndex}].assets`, newAssets);
  };

  const handleRemoveAsset = (lineIndex: number, assetIndex: number) => {
    const newAssets = formik.values.lines[lineIndex].assets.filter(
      (_, i) => i !== assetIndex,
    );
    formik.setFieldValue(`lines[${lineIndex}].assets`, newAssets);
  };

  if (!canView) {
    return null;
  }

  if (detailQuery.isLoading && !isCreate) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("app.routes.faReceipts")}
            </div>
            <div className="text-lg font-semibold">
              {isCreate
                ? t("fa.form.create")
                : `${t("fa.form.edit")} №${record?.id ?? id}`}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("fa.fields.docDate")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.docDate ?? defaultValues.docDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <ProcessStatusBadge
                statusId={record?.statusId}
                statusName={record?.statusName}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr]">
        <Card className="p-4">
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <fieldset disabled={!isDraft} className="group">
              <Row gutter={[20, 8]}>
                <Col span={8}>
                  <SelectDate
                    formik={formik}
                    fieldName="docDate"
                    label="fa.fields.docDate"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.counterpartiesSelectList}
                    formik={formik}
                    fieldName="counterpartyId"
                    label="fa.fields.counterpartyId"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.warehousesSelectList}
                    formik={formik}
                    fieldName="warehouseId"
                    label="fa.fields.warehouseId"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.currenciesSelectList}
                    formik={formik}
                    fieldName="currencyId"
                    label="fa.fields.currencyId"
                  />
                </Col>
                <Col span={8}>
                  <InputText
                    formik={formik}
                    fieldName="receiptType"
                    label="fa.fields.receiptType"
                  />
                </Col>
                <Col span={8}>
                  <SelectCustom
                    path={selectListEndpoints.chartAccountsSelectList}
                    displayConfig={chartAccountSelectDisplayConfig}
                    formik={formik}
                    fieldName="supplierAccountId"
                    label="fa.fields.supplierAccount"
                    search
                    required
                  />
                </Col>
              </Row>

              <Divider className="my-4" />

              <div className="mb-4 flex justify-between items-center">
                <Text strong className="text-lg">
                  {t("fa.sections.productsAndServices")}
                </Text>
                {isDraft && (
                  <Button
                    type="dashed"
                    icon={<Plus className="size-4" />}
                    onClick={handleAddLine}
                  >
                    {t("common.add")}</Button>
                )}
              </div>

              {formik.values.lines.map((line, lineIndex) => (
                <AntdCard
                  key={`line-${lineIndex}`}
                  size="small"
                  className="mb-6 bg-gray-50/50 border border-border shadow-sm"
                  title={
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{t("fa.sections.productNumber", { number: lineIndex + 1 })}</Text>
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
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.sourceProductTablesSelectList}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].sourceProductId`}
                        label="fa.fields.sourceProductId"
                      />
                    </Col>
                    <Col span={8}>
                      <InputText
                        formik={formik}
                        fieldName={`lines[${lineIndex}].name`}
                        label="fa.fields.name"
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        formik={formik}
                        fieldName={`lines[${lineIndex}].quantity`}
                        label="fa.fields.quantity"
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        formik={formik}
                        fieldName={`lines[${lineIndex}].price`}
                        label="fa.fields.price"
                      />
                    </Col>
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.vatRatesSelectList}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].vatRateId`}
                        label="fa.fields.vatRateId"
                      />
                    </Col>
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.chartAccountsSelectList}
                        displayConfig={chartAccountSelectDisplayConfig}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].capitalInvestmentAccountId`}
                        label="fa.fields.capitalInvestmentAccount"
                        search
                        required
                      />
                    </Col>
                    <Col span={8}>
                      <SelectCustom
                        path={selectListEndpoints.chartAccountsSelectList}
                        displayConfig={chartAccountSelectDisplayConfig}
                        formik={formik}
                        fieldName={`lines[${lineIndex}].vatAccountId`}
                        label="fa.fields.vatAccount"
                        search
                        required
                      />
                    </Col>
                  </Row>

                  <Divider className="my-4 border-dashed" />

                  <div className="mb-4 flex justify-between items-center">
                    <Text strong className="text-md text-gray-600">
                      {t("fa.title")}</Text>
                    {isDraft && (
                      <Button
                        type="dashed"
                        size="small"
                        icon={<Plus className="size-4" />}
                        onClick={() => handleAddAsset(lineIndex)}
                      >
                        {t("common.add")}</Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {line.assets.map((_, assetIndex) => (
                      <div
                        key={`asset-${lineIndex}-${assetIndex}`}
                        className="p-4 bg-white rounded-md border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <Text type="secondary" className="text-xs">
                            {t("fa.sections.assetNumber", { number: assetIndex + 1 })}
                          </Text>
                          {isDraft &&
                            formik.values.lines[lineIndex].assets.length >
                              1 && (
                              <Button
                                danger
                                type="text"
                                size="small"
                                icon={<Delete className="size-4" />}
                                onClick={() =>
                                  handleRemoveAsset(lineIndex, assetIndex)
                                }
                              />
                            )}
                        </div>
                        <Row gutter={[16, 16]}>
                          <Col span={6}>
                            <InputText
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].inventoryNumber`}
                              label="fa.fields.inventoryNumber"
                            />
                          </Col>
                          <Col span={6}>
                            <InputText
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].name`}
                              label="fa.fields.name"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].initialCost`}
                              label="fa.fields.initialCost"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].salvageValue`}
                              label="fa.fields.salvageValue"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].usefulLifeMonths`}
                              label="fa.fields.usefulLifeMonths"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectCustom
                              path={
                                selectListEndpoints.depreciationMethodsSelectList
                              }
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].depreciationMethodId`}
                              label="fa.fields.depreciationMethodId"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectCustom
                              path={selectListEndpoints.faGroupsSelectList}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].faGroupId`}
                              label="fa.fields.faGroupId"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectCustom
                              path={selectListEndpoints.okofsSelectList}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].okofId`}
                              label="fa.fields.okofId"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectDate
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].commissioningDate`}
                              label="fa.fields.commissioningDate"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectDate
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].deprStartDate`}
                              label="fa.fields.deprStartDate"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].plannedUnitsTotal`}
                              label="fa.fields.plannedUnitsTotal"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectCustom
                              path={selectListEndpoints.departmentsSelectList}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].departmentId`}
                              label="fa.fields.departmentId"
                            />
                          </Col>
                          <Col span={6}>
                            <SelectCustom
                              path={selectListEndpoints.usersSelectList}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].responsibleUserId`}
                              label="fa.fields.responsibleUserId"
                            />
                          </Col>
                          <Col span={8}>
                            <SelectCustom
                              path={selectListEndpoints.chartAccountsSelectList}
                              displayConfig={chartAccountSelectDisplayConfig}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].assetAccountId`}
                              label="fa.fields.assetAccount"
                              search
                              required
                            />
                          </Col>
                          <Col span={8}>
                            <SelectCustom
                              path={selectListEndpoints.chartAccountsSelectList}
                              displayConfig={chartAccountSelectDisplayConfig}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].accumulatedDepreciationAccountId`}
                              label="fa.fields.accumulatedDepreciationAccount"
                              search
                              required
                            />
                          </Col>
                          <Col span={8}>
                            <SelectCustom
                              path={selectListEndpoints.chartAccountsSelectList}
                              displayConfig={chartAccountSelectDisplayConfig}
                              formik={formik}
                              fieldName={`lines[${lineIndex}].assets[${assetIndex}].depreciationExpenseAccountId`}
                              label="fa.fields.depreciationExpenseAccount"
                              search
                              required
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                  {typeof (
                    formik.errors.lines?.[lineIndex] as Record<string, unknown>
                  )?.assets === "string" && (
                    <div className="text-red-500 text-sm mt-2">
                      {
                        (
                          formik.errors.lines?.[lineIndex] as Record<
                            string,
                            unknown
                          >
                        )?.assets as string
                      }
                    </div>
                  )}
                </AntdCard>
              ))}

              {typeof formik.errors.lines === "string" && (
                <div className="text-red-500 text-sm mt-2">
                  {formik.errors.lines}
                </div>
              )}
            </fieldset>
          </Form>
        </Card>

        {/* Right Column - Actions */}
        <div className="flex flex-col gap-4">
          <Card className="space-y-3 p-4">
            <div className="text-sm font-semibold">{t("common.actions")}</div>
            {isDraft && canSubmit && (
              <>
                <Button
                  block
                  icon={<Save className="size-4" />}
                  onClick={() => void saveDraft()}
                  loading={isSubmitting}
                >
                  {t("common.save")}
                </Button>
                {!isCreate && (
                  <>
                    <Button
                      type="primary"
                      block
                      icon={<CheckCircle2 className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await confirmMutation.mutateAsync();
                          toast.success(
                            t("actions.confirmSuccess", {
                              id: record?.id ?? id,
                            }),
                          );
                          navigate("/main/fa/receipts", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={confirmMutation.isPending}
                    >
                      {t("common.confirm")}
                    </Button>
                    <Button
                      danger
                      block
                      icon={<CircleX className="size-4" />}
                      onClick={async () => {
                        const ready = await ensureSavedBeforeAction();
                        if (!ready) return;

                        try {
                          await cancelMutation.mutateAsync();
                          toast.success(
                            t("actions.cancelSuccess", {
                              id: record?.id ?? id,
                            }),
                          );
                          navigate("/main/fa/receipts", { replace: true });
                        } catch (error) {
                          errorHandlers(error);
                        }
                      }}
                      loading={cancelMutation.isPending}
                    >
                      {t("common.cancel")}
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
