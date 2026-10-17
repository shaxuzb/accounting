import type { FormikProps } from "formik";
import { Col } from "antd";
import SelectCustom from "@/components/fields/SelectCustom";
import { useAccountDefinitions } from "@/modules/accountings/pages/manual-entries/useAccountDefinitions";

/** acc_subkonto_type: «Статьи движения денежных средств», «Виды платежей в бюджет». */
const CASH_FLOW_ITEMS = 31;
const BUDGET_PAYMENT_KINDS = 26;

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  /** The correspondent account: a budget account (kept by payment kind) asks for the kind. */
  offsetAccountId?: number | null;
  colSpan?: number;
}

/**
 * What a cash order or a bank operation names itself, as on 1C's documents: the cash flow item
 * (1C «Статья ДДС», empty — picked from the correspondent account) and, paying the budget, the
 * payment's kind (1C «Вид платежа»: tax, penalty, fine; empty — the tax itself).
 */
export default function MoneyDocumentAnalytics({ formik, offsetAccountId, colSpan = 4 }: Props) {
  const { definitions } = useAccountDefinitions(offsetAccountId ?? null);
  const budgetAccount = Boolean(offsetAccountId) && definitions.some((x) => x.id === BUDGET_PAYMENT_KINDS);

  return (
    <>
      <Col span={colSpan}>
        <SelectCustom
          formik={formik}
          fieldName="cashFlowItemId"
          label="moneyDocument.cashFlowItem"
          placeholder="moneyDocument.automatic"
          path={`subkonto-values/${CASH_FLOW_ITEMS}`}
          clearable
          search
          getFirst={false}
          autoSelectSingle={false}
        />
      </Col>
      {budgetAccount && (
        <Col span={colSpan}>
          <SelectCustom
            formik={formik}
            fieldName="budgetPaymentKindId"
            label="moneyDocument.budgetPaymentKind"
            placeholder="moneyDocument.taxItself"
            path={`subkonto-values/${BUDGET_PAYMENT_KINDS}`}
            clearable
            getFirst={false}
            autoSelectSingle={false}
          />
        </Col>
      )}
    </>
  );
}
