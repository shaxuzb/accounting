import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { downloadBlob, fileNameFromContentDisposition } from "@/shared/utils/downloadBlob";

/** A payment's print as a payment order (1C «Платежное поручение»). */
export interface PaymentOrder {
  id: number;
  docNumber: string;
  docDate: string;
  statusId: number;
  amount: number;
  currencyCode: string;
  amountInWords: string;
  payerName: string;
  payerInn?: string | null;
  payerAccount: string;
  payerBankName?: string | null;
  payerBankMfo?: string | null;
  payeeName?: string | null;
  payeeInn?: string | null;
  payeeAccount?: string | null;
  payeeBankName?: string | null;
  payeeBankMfo?: string | null;
  purpose?: string | null;
  director?: string | null;
  chiefAccountant?: string | null;
}

export const usePaymentOrder = (id: string) =>
  useQuery({
    queryKey: ["bankOperations", "paymentOrder", id],
    queryFn: () =>
      $axiosPrivate
        .get<PaymentOrder>(`bank-operations/${id}/payment-order`)
        .then((res) => res.data),
    enabled: Boolean(id),
  });

/**
 * The chosen payments for the bank client in 1C's exchange format (1c_to_kl.txt). A refusal
 * comes back as a blob too: its JSON is read so the message reaches the user.
 */
export const exportPaymentOrders = async (ids: number[]) => {
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", String(id)));
  try {
    const res = await $axiosPrivate.get<Blob>("bank-operations/payment-orders/export-1c", {
      params,
      responseType: "blob",
    });
    downloadBlob(
      res.data,
      fileNameFromContentDisposition(res.headers["content-disposition"], "1c_to_kl.txt"),
    );
  } catch (error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (data instanceof Blob) {
      const text = await data.text();
      try {
        const problem = JSON.parse(text) as { detail?: string; title?: string };
        throw new Error(problem.detail ?? problem.title ?? text);
      } catch (parsed) {
        if (parsed instanceof SyntaxError) throw new Error(text);
        throw parsed;
      }
    }
    throw error;
  }
};
