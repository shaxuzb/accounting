import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { CounterpartybankaccountForm } from "../types/form";
import { useGetDetailCounterpartybankaccount } from "../hooks";
import { useCreateCounterpartybankaccount } from "../hooks";
import { useUpdateCounterpartybankaccount } from "../hooks";
import { counterpartybankaccountSchema } from "../types/schema";

const defaultValues: CounterpartybankaccountForm = {
  organizationId: null,
  counterpartyId: null,
  bankId: null,
  accountNumber: null,
  currencyId: null,
  isMain: null,
  stateId: null,
};

interface counterpartybankaccountModalProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function CounterPartyBankAccountAddPage({
  open,
  onClose,
  id,
}: counterpartybankaccountModalProps) {
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: counterpartybankaccount, isLoading: isOrgonizationsLoading } =
    useGetDetailCounterpartybankaccount(editId ?? "");
  const createMutation = useCreateCounterpartybankaccount();
  const updateMutation = useUpdateCounterpartybankaccount();

  const formik = useFormik<CounterpartybankaccountForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
      isMain: true
    },
    enableReinitialize: true,
    validationSchema: counterpartybankaccountSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success("Tashkilot muvaffaqiyatli o'zgartirildi");
        } else {
          await createMutation.mutateAsync(values);
          toast.success("Tashkilot muvaffaqiyatli yaratildi");
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (counterpartybankaccount && isEdit) {
      formik.setValues({
        organizationId: counterpartybankaccount.organizationId ?? null,
        counterpartyId: counterpartybankaccount.counterpartyId ?? null,
        bankId: counterpartybankaccount.bankId ?? null,
        accountNumber: counterpartybankaccount.accountNumber ?? null,
        currencyId: counterpartybankaccount.currencyId ?? null,
        isMain: counterpartybankaccount.isMain ?? true,
        stateId: counterpartybankaccount.stateId ?? null,
      });
    }
  }, [counterpartybankaccount, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={isEdit ? "Tashkilotni tahrirlash" : "Yangi tashkilot qo'shish"}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={450}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <SelectCustom
            formik={formik}
            fieldName="counterpartyId"
            label="counterpartyId"
            path={selectListEndpoints.counterparty}
          />
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
             <SelectCustom
            formik={formik}
            fieldName="bankId"
            label="Bank"
            path={selectListEndpoints.banksSelectList}
          />


          <InputText
            formik={formik}
            fieldName="accountNumber"
            label="accountNumber"
          />
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label="currencyId"
            path={selectListEndpoints.currenciesSelectList}
          />

          {isEdit && (
            <SelectCustom
              formik={formik}
              fieldName="stateId"
              label="Holati"
              path={selectListEndpoints.statesSelectList}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >
            Yakunlash
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
