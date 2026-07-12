import { useState } from "react";
import type { FormikProps } from "formik";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { formatDateWithOutTime } from "@/utils/helpers";
import type { SaleDocForm } from "../types/form";

interface Props {
  formik: FormikProps<SaleDocForm>;
  isEdit: boolean;
}

export default function SaleDocumentFormFields({ formik, isEdit }: Props) {
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleContractCreated = (contract: Contract) => {
    formik.setFieldValue("contractId", contract.id, true);
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

  return (
    <div className="grid gap-x-3 border-b border-border pb-1 sm:grid-cols-2 xl:grid-cols-4">
      <SelectDate
        label="Sana"
        fieldName="docDate"
        formik={formik}
        required
      />
      <SelectCustom
        label="Mijoz"
        fieldName="counterpartyId"
        path={selectListEndpoints.clients}
        formik={formik}
        search
        required
        addOption={{
          bool: true,
          permissionCode: counterpartyPermissions.create,
          onClick: () => {
            setCounterpartyCreateOpen(true);
          },
        }}
      />
      <SelectCustom
        path={selectListEndpoints.contractsSelectList}
        queryParams={{
          choosedDate: dayjs(formik.values.docDate).format(
            formatDateWithOutTime,
          ),
          [filterIds.counterparty]: formik.values.counterpartyId,
        }}
        label="Shartnoma"
        fieldName="contractId"
        formik={formik}
        enabled={Boolean(formik.values.counterpartyId)}
        disabled={!formik.values.counterpartyId}
        required
        addOption={{
          bool: true,
          permissionCode: contractPermissions.create,
          onClick: () => {
            setContractCreateOpen(true);
          },
        }}
      />
         <SelectCustom
        label="Ombor"
        fieldName="warehouseId"
        path={selectListEndpoints.warehousesSelectList}
        formik={formik}
        required
      />
      <SelectCustom
        label="Mijoz schyoti"
        fieldName="customerAccountId"
        path={selectListEndpoints.chartAccountsSelectList}
        formik={formik}
        search
        required
        optionLabel={chartAccountOptionLabel}
        selectedLabel={chartAccountSelectedLabel}
      />
      <SelectCustom
        label="QQS schyoti"
        fieldName="vatAccountId"
        path={selectListEndpoints.chartAccountsSelectList}
        formik={formik}
        search
        required
        optionLabel={chartAccountOptionLabel}
        selectedLabel={chartAccountSelectedLabel}
      />
   
      <div className="hidden">
        <SelectCustom
          label="Valyuta"
          fieldName="currencyId"
          path={selectListEndpoints.currenciesSelectList}
          formik={formik}
          getFirst
          required
        />
      </div>
      {isEdit && (
        <SelectCustom
          label="Holat"
          fieldName="stateId"
          path={selectListEndpoints.statesSelectList}
          formik={formik}
          required
        />
      )}
      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onClose={() => {
          setCounterpartyCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.clients,
          );
        }}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        contractTypeId={2}
        initialCounterpartyId={formik.values.counterpartyId}
        onCreated={handleContractCreated}
        onClose={() => {
          setContractCreateOpen(false);
        }}
      />
    </div>
  );
}
