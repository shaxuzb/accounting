import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import type { FormikProps } from "formik";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";

interface ContractVatOption {
  id: number;
  priceIncludesVat?: boolean;
  /** The settlement currency (1C «Валюта взаиморасчетов»); none — any. */
  currencyId?: number | null;
}

/**
 * Like 1C, a document's «Narx QQS bilan» starts from its contract: when the user
 * (or the first-option auto select) picks a contract, the flag takes the contract's
 * value. It stays editable, and loading a saved document never overrides what was
 * saved with it. The contract's settlement currency becomes the document's the same way,
 * and the currency is then fixed by it (returned for the form to lock the field).
 */
/** The fields a document's header shares with its contract. */
export interface ContractDefaultsForm {
  counterpartyId?: number | null;
  contractId?: number | null;
  docDate?: string | null;
  priceIncludesVat?: boolean;
  currencyId?: number | null;
}

export function useContractPriceIncludesVatDefault<T extends ContractDefaultsForm>(
  formik: FormikProps<T>,
  enabled: boolean,
) {
  const { counterpartyId, contractId, docDate } = formik.values;
  const choosedDate = dayjs(docDate).format(formatDateWithOutTime);

  const { data: contracts } = useQuery({
    queryKey: [
      "contract-defaults",
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
    if (contract.currencyId && contract.currencyId !== Number(formik.values.currencyId)) {
      formik.setFieldValue("currencyId", contract.currencyId, false);
    }
  }, [contractId, contracts, enabled, formik]);

  return {
    contractCurrencyId:
      contracts?.find((item) => item.id === contractId)?.currencyId ?? null,
  };
}
