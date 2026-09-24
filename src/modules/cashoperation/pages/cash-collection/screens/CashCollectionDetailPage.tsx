import { useState } from "react";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import { Calendar, CheckCircle2, CircleX, Save } from "lucide-react";
import { useFormik } from "formik";
import dayjs from "@/config/dayjs";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { customDate, numberSpacing } from "@/utils/utils";
import CashCollectionReadonlyDetailsCard from "@/modules/cashoperation/components/CashCollectionReadonlyDetailsCard";
import {
  useCancelCashCollection,
  useCreateCashCollection,
  useGetCashCollection,
  useSendCashCollectionToBank,
  useUpdateCashCollection,
} from "../hooks";
import { toCashCollectionPayload } from "../utils/payload";
import type { CashCollectionForm } from "../types/form";
import { cashCollectionSchema } from "../types/schema";

const createEmptyValues = (): CashCollectionForm => ({
  cashBoxId: null,
  bankAccountId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  exchangeRate: 1,
  cashChartAccountId: null,
  cashInTransitAccountId: null,
  bankChartAccountId: null,
  comment: "",
});

interface CashCollectionDetailPageProps {
  open?: boolean;
  onClose?: () => void;
  id?: number | null;
}

export default function CashCollectionDetailPage({
  open,
  onClose,
  id,
}: CashCollectionDetailPageProps) {
  // Taken once when the form opens; the factory reads the clock.
  const [openedDefaults] = useState(createEmptyValues);
  const { t } = useTranslation();
  const routeParams = useParams();
  const navigate = useNavigate();
  const isModal = open !== undefined;
  const collectionId = isModal ? (id ?? "") : (routeParams.id ?? "");
  const isCreate = !collectionId;
  const detail = useGetCashCollection(collectionId);
  const record = detail.data;
  const create = useCreateCashCollection();
  const update = useUpdateCashCollection(collectionId);
  const sendToBank = useSendCashCollectionToBank(collectionId);
  const cancel = useCancelCashCollection(collectionId);

  const formik = useFormik<CashCollectionForm>({
    initialValues: record ? { ...openedDefaults, ...record } : openedDefaults,
    enableReinitialize: true,
    validationSchema: cashCollectionSchema(t),
    onSubmit: async (values) => {
      try {
        if (isCreate) {
          await create.mutateAsync(toCashCollectionPayload(values));
          toast.success(t("cash.collection.created"));
        } else {
          await update.mutateAsync(toCashCollectionPayload(values));
          toast.success(t("cash.collection.saved"));
        }
        if (isModal) onClose?.();
        else navigate("..");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const isDraft = isCreate || record?.statusId === 1;
  const isBusy =
    detail.isLoading ||
    create.isPending ||
    update.isPending ||
    sendToBank.isPending ||
    cancel.isPending;

  const close = () => {
    formik.resetForm();
    if (isModal) onClose?.();
    else navigate("..");
  };

  const submitAction = async (action: "send" | "cancel") => {
    try {
      if (action === "send") {
        const errors = await formik.validateForm();
        if (
          Object.keys(errors).length ||
          !formik.values.cashChartAccountId ||
          !formik.values.cashInTransitAccountId ||
          !formik.values.bankChartAccountId
        ) {
          toast.error(t("cash.messages.fillRequired"));
          return;
        }
        await sendToBank.mutateAsync();
      } else {
        await cancel.mutateAsync();
      }
      toast.success(
        t(
          action === "send"
            ? "cash.collection.sent"
            : "cash.collection.cancelled",
        ),
      );
      close();
    } catch (error) {
      errorHandlers(error);
    }
  };

  const form = (withActions = true) => (
    <Form layout="vertical" onFinish={formik.handleSubmit}>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <SelectCustom
            formik={formik}
            fieldName="cashBoxId"
            label="settings.entities.cashBox"
            path={selectListEndpoints.cashBoxesSelectList}
            required
            disabled={!isDraft}
          />
        </Col>
        <Col span={12}>
          <SelectCustom
            formik={formik}
            fieldName="bankAccountId"
            label="bank.fields.bankAccount"
            path={selectListEndpoints.orgBankAccountsSelectList}
            required
            disabled={!isDraft}
          />
        </Col>
        <Col span={12}>
          <SelectDate
            formik={formik}
            fieldName="docDate"
            label="bank.fields.date"
            disabled={!isDraft}
          />
        </Col>
        <Col span={12}>
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label="settings.fields.currency"
            path={selectListEndpoints.currenciesSelectList}
            required
            disabled={!isDraft}
          />
        </Col>
        <Col span={12}>
          <InputNumberFormat
            formik={formik}
            fieldName="amount"
            label="bank.fields.amount"
            min={0}
            precision={2}
            disabled={!isDraft}
          />
        </Col>
        <Col span={12}>
          <InputNumberFormat
            formik={formik}
            fieldName="exchangeRate"
            label="cash.fields.exchangeRate"
            min={0}
            precision={6}
            disabled={!isDraft}
          />
        </Col>
        <Col span={8}>
          <SelectCustom
            formik={formik}
            fieldName="cashChartAccountId"
            label="cash.fields.cashChartAccount"
            path={selectListEndpoints.chartAccountsSelectList}
            displayConfig={chartAccountSelectDisplayConfig}
            search
            disabled={!isDraft}
          />
        </Col>
        <Col span={8}>
          <SelectCustom
            formik={formik}
            fieldName="cashInTransitAccountId"
            label="cash.collection.cashInTransitAccount"
            path={selectListEndpoints.chartAccountsSelectList}
            displayConfig={chartAccountSelectDisplayConfig}
            search
            disabled={!isDraft}
          />
        </Col>
        <Col span={8}>
          <SelectCustom
            formik={formik}
            fieldName="bankChartAccountId"
            label="cash.collection.bankChartAccount"
            path={selectListEndpoints.chartAccountsSelectList}
            displayConfig={chartAccountSelectDisplayConfig}
            search
            disabled={!isDraft}
          />
        </Col>
        <Col span={24}>
          <InputText
            formik={formik}
            fieldName="comment"
            label="bank.fields.comment"
            disabled={!isDraft}
          />
        </Col>
      </Row>
      {withActions && <div className="flex justify-end gap-2">
        <Button onClick={close}>{t("common.cancel")}</Button>
        {isDraft && (
          <Button
            type="primary"
            htmlType="submit"
            loading={create.isPending || update.isPending}
          >
            {t("common.save")}
          </Button>
        )}
        {!isCreate && isDraft && (
          <Button
            onClick={() => void submitAction("send")}
            loading={sendToBank.isPending}
          >
            {t("cash.collection.sendToBank")}
          </Button>
        )}
        {!isCreate && record && [1, 5].includes(record.statusId) && (
          <Button
            danger
            onClick={() => void submitAction("cancel")}
            loading={cancel.isPending}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>}
    </Form>
  );

  if (isModal) {
    return (
      <Modal
        maskClosable={false}
        title={
          isCreate ? t("cash.collection.create") : t("cash.collection.title")
        }
        open={Boolean(open)}
        onCancel={close}
        footer={null}
        centered
        width={900}
        destroyOnHidden
      >
        <Spin spinning={isBusy}>
          {detail.isError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {t("error.title")}
            </div>
          )}
          {form()}
        </Spin>
      </Modal>
    );
  }

  if (!isCreate && (detail.isLoading || !record)) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isDraft && <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("cash.collection.title")}
            </div>
            <div className="text-lg font-semibold">
              {record?.docNumber ?? t("cash.collection.create")}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span className="font-semibold">{t("cash.fields.date")}</span>
            </div>
            <p className="font-semibold text-foreground">
              {customDate(record?.docDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreate && record && (
              <ProcessStatusBadge
                statusId={record.statusId}
                statusName={record.statusName}
              />
            )}
          </div>
        </div>
      </Card>}
      <div className={isDraft ? "grid gap-4 lg:grid-cols-[1.7fr_0.9fr]" : ""}>
        {isDraft ? (
          <Card className="p-4">{form(false)}</Card>
        ) : (
          record && <CashCollectionReadonlyDetailsCard record={record} />
        )}
        {isDraft && <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">{t("common.actions")}</div>
          <Button
            block
            icon={<Save className="size-4" />}
            onClick={() => void formik.submitForm()}
            loading={create.isPending || update.isPending}
          >
            {t("common.save")}
          </Button>
          {!isCreate && (
            <Button
              type="primary"
              block
              icon={<CheckCircle2 className="size-4" />}
              onClick={() => void submitAction("send")}
              loading={sendToBank.isPending}
            >
              {t("cash.collection.sendToBank")}
            </Button>
          )}
          {!isCreate && record && [1, 5].includes(record.statusId) && (
            <Button
              danger
              block
              icon={<CircleX className="size-4" />}
              onClick={() => void submitAction("cancel")}
              loading={cancel.isPending}
            >
              {t("common.cancel")}
            </Button>
          )}
          {record?.statusName && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              {t("cash.fields.currentStatus")}: {" "}
              <span className="font-semibold">{record.statusName}</span>
            </div>
          )}
          {record?.amount != null && (
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              {t("cash.fields.amount")}: {" "}
              <span className="font-semibold">
                {numberSpacing(record.amount)} {record.currencyName ?? ""}
              </span>
            </div>
          )}
        </Card>}
      </div>
    </div>
  );
}
