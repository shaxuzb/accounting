import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import InputText from "@/components/fields/InputText";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import { openingBalancePermissions } from "@/modules/settings/pages/openingBalance/constants/permissions";
import FaAssetKindSwitch from "../../shared/components/FaAssetKindSwitch";
import useIntangibleSetup from "../../shared/hooks/useIntangibleSetup";
import useFaDocumentTypeIds from "../../shared/hooks/useFaDocumentTypeIds";
import { faDocumentAccountRoleCodes } from "../../shared/constants/documentAccounts";
import {
  faAssetKindLabels,
  faAssetKinds,
  faKindLabel,
  faKindRole,
  type FaAssetKindId,
} from "../../shared/constants/assetKinds";

interface FaOpeningAsset {
  id: number;
  assetKindId: number;
  inventoryNumber: string;
  name: string;
  groupName?: string | null;
  assetAccountNumber?: string | null;
  initialCost: number;
  accumulatedDepreciation: number;
  accumulatedDepreciationAccountNumber?: string | null;
  usefulLifeMonths?: number | null;
  deprStartDate?: string | null;
  openingDate?: string | null;
  inUse: boolean;
}

interface FaOpeningAssetValues {
  assetKindId: FaAssetKindId;
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
  departmentId: number | null;
  assetAccountId: number | null;
  initialCost: number | null;
  accumulatedDepreciation: number | null;
  depreciationMethodId: number | null;
  usefulLifeMonths: number | null;
  deprStartDate: string;
  salvageValue: number | null;
  accumulatedDepreciationAccountId: number | null;
  depreciationExpenseAccountId: number | null;
}

const endpoint = "fa-opening-assets";
const queryKey = ["fa", "opening-assets"];

const emptyValues = (kind: FaAssetKindId): FaOpeningAssetValues => ({
  assetKindId: kind,
  inventoryNumber: "",
  name: "",
  faGroupId: null,
  okofId: null,
  departmentId: null,
  assetAccountId: null,
  initialCost: null,
  accumulatedDepreciation: 0,
  depreciationMethodId: null,
  // NSBU 7 item 46: an intangible asset whose life cannot be told takes five years
  usefulLifeMonths: kind === faAssetKinds.intangible ? 60 : null,
  deprStartDate: dayjs().startOf("month").format("YYYY-MM-DDT00:00:00"),
  salvageValue: 0,
  accumulatedDepreciationAccountId: null,
  depreciationExpenseAccountId: null,
});

/**
 * 1C «Ввод начальных остатков» — ОС, НМА: an asset already in use, with its cost and the
 * depreciation charged until the cut-over, posted on the opening balance date against 0000.
 */
export default function FaOpeningAssetPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () =>
      (await $axiosPrivate.get<FaOpeningAsset[]>(endpoint)).data,
  });
  const remove = useMutation({
    mutationFn: (id: number) => $axiosPrivate.delete(`${endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const columns: TableColumnsType<FaOpeningAsset> = [
    {
      dataIndex: "assetKindId",
      title: t("fa.kinds.title"),
      width: 170,
      render: (value: number) => (
        <Tag color={value === faAssetKinds.intangible ? "purple" : "blue"}>
          {t(faAssetKindLabels[value])}
        </Tag>
      ),
    },
    {
      dataIndex: "inventoryNumber",
      title: t("fa.fields.inventoryNumber"),
      width: 140,
    },
    { dataIndex: "name", title: t("fa.fields.name") },
    {
      dataIndex: "assetAccountNumber",
      title: t("fa.opening.account"),
      width: 100,
    },
    {
      dataIndex: "initialCost",
      title: t("fa.fields.initialCost"),
      align: "right",
      width: 160,
      render: (value: number) => numberSpacing(value),
    },
    {
      dataIndex: "accumulatedDepreciation",
      title: t("fa.opening.accumulated"),
      align: "right",
      width: 180,
      render: (value: number, record) =>
        `${numberSpacing(value)}${record.accumulatedDepreciationAccountNumber ? ` (${record.accumulatedDepreciationAccountNumber})` : ""}`,
    },
    {
      dataIndex: "usefulLifeMonths",
      title: t("fa.fields.usefulLifeMonths"),
      align: "right",
      width: 130,
    },
    {
      dataIndex: "deprStartDate",
      title: t("fa.fields.deprStartDate"),
      width: 150,
      render: (value?: string | null) =>
        value ? dayjs(value).format("DD.MM.YYYY") : "-",
    },
    {
      key: "actions",
      width: 60,
      render: (_, record) =>
        permissions.includes(openingBalancePermissions.delete) &&
        !record.inUse ? (
          <Popconfirm
            title={t("fa.opening.deleteConfirm")}
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              void remove
                .mutateAsync(record.id)
                .then(() => toast.success(t("fa.opening.deleted")))
                .catch(errorHandlers)
            }
          >
            <Button type="text" danger icon={<Trash2 className="size-4" />} />
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div className="w-full space-y-3">
      <Alert showIcon type="info" message={t("fa.opening.hint")} />
      <div className="flex justify-end">
        <PermissionCard permission={openingBalancePermissions.create}>
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setOpen(true)}
          >
            {t("fa.opening.add")}
          </Button>
        </PermissionCard>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<FaOpeningAsset>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>
      {open && (
        <FaOpeningAssetModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey });
          }}
        />
      )}
    </div>
  );
}

function FaOpeningAssetModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const documentTypeIds = useFaDocumentTypeIds();
  // the accounts follow the commissioning's options, as the server checks them
  const documentTypeId = documentTypeIds.commissioning;
  const save = useMutation({
    mutationFn: (values: FaOpeningAssetValues) =>
      $axiosPrivate.post(endpoint, {
        assets: [
          {
            ...values,
            okofId:
              values.assetKindId === faAssetKinds.intangible
                ? null
                : values.okofId,
            initialCost: Number(values.initialCost),
            accumulatedDepreciation: Number(
              values.accumulatedDepreciation ?? 0,
            ),
            salvageValue: Number(values.salvageValue ?? 0),
          },
        ],
      }),
  });
  const required = t("common.requiredFields");
  const formik = useFormik<FaOpeningAssetValues>({
    initialValues: emptyValues(faAssetKinds.fixed),
    validationSchema: Yup.object({
      inventoryNumber: Yup.string().trim().required(required),
      name: Yup.string().trim().required(required),
      faGroupId: Yup.number().nullable().required(required),
      assetAccountId: Yup.number().nullable().required(required),
      initialCost: Yup.number()
        .nullable()
        .moreThan(0, required)
        .required(required),
      accumulatedDepreciation: Yup.number().nullable().min(0),
      depreciationMethodId: Yup.number().nullable().required(required),
      usefulLifeMonths: Yup.number().nullable().min(1).required(required),
      deprStartDate: Yup.string().required(required),
      accumulatedDepreciationAccountId: Yup.number()
        .nullable()
        .required(required),
      depreciationExpenseAccountId: Yup.number().nullable().required(required),
    }),
    onSubmit: async (values) => {
      try {
        await save.mutateAsync(values);
        toast.success(t("fa.opening.saved"));
        onSaved();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });
  const kind = formik.values.assetKindId;
  const kindReady = useIntangibleSetup(kind);
  const accountsEnabled = Boolean(documentTypeId) && kindReady;

  const changeKind = (next: FaAssetKindId) =>
    void formik.setValues({
      ...emptyValues(next),
      inventoryNumber: formik.values.inventoryNumber,
      name: formik.values.name,
      initialCost: formik.values.initialCost,
      accumulatedDepreciation: formik.values.accumulatedDepreciation,
      deprStartDate: formik.values.deprStartDate,
      departmentId: formik.values.departmentId,
    });

  return (
    <Modal
      open
      width={980}
      title={t("fa.opening.add")}
      okText={t("common.save")}
      confirmLoading={save.isPending}
      onOk={() => void formik.submitForm()}
      onCancel={onClose}
      destroyOnHidden
      // a half-filled card is not lost to a click beside the window
      maskClosable={false}
    >
      <div className="mb-3">
        <FaAssetKindSwitch value={kind} onChange={changeKind} />
      </div>
      <Form layout="vertical" component="div">
        <Row gutter={[16, 0]}>
          <Col span={6}>
            <InputText
              formik={formik}
              fieldName="inventoryNumber"
              label="fa.fields.inventoryNumber"
              required
            />
          </Col>
          <Col span={10}>
            <InputText
              formik={formik}
              fieldName="name"
              label="fa.fields.name"
              required
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              formik={formik}
              fieldName="faGroupId"
              label={faKindLabel(kind, "fa.fields.faGroupId")}
              path={selectListEndpoints.faGroupsSelectList}
              queryParams={{ assetKindId: kind }}
              enabled={kindReady}
              search
              required
            />
          </Col>
          {kind !== faAssetKinds.intangible && (
            <Col span={8}>
              <SelectCustom
                formik={formik}
                fieldName="okofId"
                label="fa.fields.okofId"
                path={selectListEndpoints.okofsSelectList}
                search
                clearable
              />
            </Col>
          )}
          <Col span={8}>
            <SelectCustom
              formik={formik}
              fieldName="departmentId"
              label="fa.fields.department"
              path={selectListEndpoints.departmentsSelectList}
              search
              clearable
            />
          </Col>
          <Col span={8}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={faKindRole(
                kind,
                faDocumentAccountRoleCodes.fixedAsset,
              )}
              formik={formik}
              fieldName="assetAccountId"
              label={faKindLabel(kind, "fa.fields.assetAccount")}
              search
              required
              enabled={accountsEnabled}
            />
          </Col>
          <Col span={8}>
            <InputNumber
              formik={formik}
              fieldName="initialCost"
              label="fa.fields.initialCost"
              min={0}
              required
            />
          </Col>
          <Col span={8}>
            <InputNumber
              formik={formik}
              fieldName="accumulatedDepreciation"
              label="fa.opening.accumulated"
              min={0}
            />
          </Col>
          <Col span={8}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={faKindRole(
                kind,
                faDocumentAccountRoleCodes.accumulatedDepreciation,
              )}
              formik={formik}
              fieldName="accumulatedDepreciationAccountId"
              label="fa.fields.accumulatedDepreciationAccount"
              search
              required
              enabled={accountsEnabled}
            />
          </Col>
          <Col span={8}>
            <SelectCustom
              formik={formik}
              fieldName="depreciationMethodId"
              label="fa.fields.depreciationMethod"
              path={selectListEndpoints.depreciationMethodsSelectList}
              required
            />
          </Col>
          <Col span={8}>
            <InputNumber
              formik={formik}
              fieldName="usefulLifeMonths"
              label="fa.fields.usefulLifeMonths"
              min={1}
              precision={0}
              required
            />
          </Col>
          <Col span={8}>
            <SelectDate
              formik={formik}
              fieldName="deprStartDate"
              label="fa.opening.deprStartDate"
              required
            />
          </Col>
          <Col span={8}>
            <InputNumber
              formik={formik}
              fieldName="salvageValue"
              label="fa.fields.salvageValue"
              min={0}
            />
          </Col>
          <Col span={8}>
            <DocumentAccountSelect
              documentTypeId={documentTypeId ?? 0}
              documentRoleCode={faDocumentAccountRoleCodes.depreciationExpense}
              formik={formik}
              fieldName="depreciationExpenseAccountId"
              label="fa.fields.depreciationExpenseAccount"
              search
              required
              enabled={accountsEnabled}
            />
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
