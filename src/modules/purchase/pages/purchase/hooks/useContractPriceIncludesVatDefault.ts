import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import type { PurchaseImportForm } from "../types/form";

interface ContractVatOption {
  id: number;
  priceIncludesVat?: boolean;
}

/**
 * Like 1C, a document's «Narx QQS bilan» starts from its contract: when the user
 * (or the first-option auto select) picks a contract, the flag takes the contract's
 * value. It stays editable, and loading a saved document never overrides what was
 * saved with it.
 */
export function useContractPriceIncludesVatDefault(
  formik: FormikProps<PurchaseImportForm>,
  enabled: boolean,
) {
  const { counterpartyId, contractId, docDate } = formik.values;
  const choosedDate = dayjs(docDate).format(formatDateWithOutTime);

  const { data: contracts } = useQuery({
    queryKey: [
      "purchase",
      "contract-vat-defaults",
      counterpartyId,
      choosedDate,
    ],
    queryFn: async () => {
      const response = await $axiosPrivate.get<ContractVatOption[]>(
        selectListEndpoints.contractsSelectList,
        { params: { [filterIds.counterparty]: counterpartyId, choosedDate } },
      );
      return response.data;
    },
    enabled: enabled && Boolean(counterpartyId),
    staleTime: 5 * 60 * 1000,
  });

  const initialValuesRef = useRef(formik.initialValues);
  const previousContractIdRef = useRef(contractId);
  const pendingContractIdRef = useRef<number | null>(null);

  useEffect(() => {
    // A (re)loaded document brings its own flag — only later changes apply the default.
    if (initialValuesRef.current !== formik.initialValues) {
      initialValuesRef.current = formik.initialValues;
      previousContractIdRef.current = contractId;
      pendingContractIdRef.current = null;
      return;
    }

    if (contractId !== previousContractIdRef.current) {
      previousContractIdRef.current = contractId;
      pendingContractIdRef.current = contractId ?? null;
    }

    const pendingId = pendingContractIdRef.current;
    if (!enabled || pendingId === null) return;

    const contract = contracts?.find((item) => item.id === pendingId);
    if (!contract) return;

    pendingContractIdRef.current = null;
    const nextValue = Boolean(contract.priceIncludesVat);
    if (nextValue !== Boolean(formik.values.priceIncludesVat)) {
      formik.setFieldValue("priceIncludesVat", nextValue, false);
    }
  }, [contractId, contracts, enabled, formik]);
}
