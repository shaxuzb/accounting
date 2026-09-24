import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";

/** cmn_contract_type: 1 — with a supplier, 2 — with a customer. */
const SUPPLIER_CONTRACT = 1;
const CUSTOMER_CONTRACT = 2;

/**
 * The settlement account a payment under a contract goes to, as 1C picks it from the
 * kind of operation: a customer contract settles 4010, a supplier contract 6010. Money
 * received over what the counterparty owes is moved to the advance account on posting.
 */
const SETTLEMENT_ACCOUNT_BY_CONTRACT: Record<number, string> = {
  [CUSTOMER_CONTRACT]: "4010",
  [SUPPLIER_CONTRACT]: "6010",
};

interface ContractOption {
  id: number;
  contractTypeId?: number;
}

interface Params<T extends object> {
  formik: FormikProps<T>;
  offsetFieldName: string;
  documentTypeId: number;
  offsetRoleCode: string;
  counterpartyId: number | null;
  contractId: number | null;
  directionId: unknown;
  docDate: unknown;
}

/**
 * Sets the offset account when the user picks a contract or turns a receipt into a
 * payment. It stays editable, and a saved document is never changed on load.
 */
export function useContractSettlementAccount<T extends object>({
  formik,
  offsetFieldName,
  documentTypeId,
  offsetRoleCode,
  counterpartyId,
  contractId,
  directionId,
  docDate,
}: Params<T>) {
  const choosedDate = dayjs(docDate as string).format(formatDateWithOutTime);
  const { data: contracts } = useQuery({
    queryKey: ["settlement-contract-types", counterpartyId, choosedDate],
    queryFn: async () =>
      (
        await $axiosPrivate.get<ContractOption[]>(
          selectListEndpoints.contractsSelectList,
          { params: { [filterIds.counterparty]: counterpartyId, choosedDate } },
        )
      ).data,
    enabled: Boolean(counterpartyId),
    staleTime: 5 * 60 * 1000,
  });
  const settings = useGetDetailDocumentAccountSettings(documentTypeId);

  const initialValuesRef = useRef(formik.initialValues);
  const previousKeyRef = useRef(`${contractId ?? ""}|${String(directionId ?? "")}`);
  const pendingRef = useRef(false);

  useEffect(() => {
    const key = `${contractId ?? ""}|${String(directionId ?? "")}`;
    // A (re)loaded document keeps the account it was saved with.
    if (initialValuesRef.current !== formik.initialValues) {
      initialValuesRef.current = formik.initialValues;
      previousKeyRef.current = key;
      pendingRef.current = false;
      return;
    }
    if (key !== previousKeyRef.current) {
      previousKeyRef.current = key;
      pendingRef.current = Boolean(contractId);
    }
    if (!pendingRef.current || !contractId) return;

    const contract = contracts?.find((item) => item.id === contractId);
    const role = settings.data?.accountSettings?.find(
      (item) =>
        item.documentAccountRoleCode.trim().toLowerCase() ===
        offsetRoleCode.trim().toLowerCase(),
    );
    if (!contract || !role) return;

    pendingRef.current = false;
    const number = SETTLEMENT_ACCOUNT_BY_CONTRACT[Number(contract.contractTypeId)];
    const account = role.accounts?.find(
      (item) => String(item.chartAccountNumber ?? "") === number,
    );
    const values = formik.values as Record<string, unknown>;
    if (account && values[offsetFieldName] !== account.chartAccountId) {
      formik.setFieldValue(offsetFieldName, account.chartAccountId, true);
    }
  }, [contractId, contracts, directionId, formik, offsetFieldName, offsetRoleCode, settings.data]);
}
