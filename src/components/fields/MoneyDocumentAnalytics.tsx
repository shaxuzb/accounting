import type { FormikProps } from "formik";
import { Col } from "antd";
import SelectCustom from "@/components/fields/SelectCustom";
import { useAccountDefinitions } from "@/modules/accountings/pages/manual-entries/useAccountDefinitions";

/** acc_subkonto_type: «Статьи движения денежных средств», «Виды платежей в бюджет». */
const CASH_FLOW_ITEMS = 31;
const BUDGET_PAYMENT_KINDS = 26;
/** acc_subkonto_type: «Прочие доходы и расходы». */
const OTHER_INCOME_EXPENSES = 46;

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
 * payment's kind (1C «Вид платежа»: tax, penalty, fine; empty — the tax itself) and, against a
 * 9xxx account, its other income or expense item (1C «Статья прочих доходов и расходов»).
 */
export default function MoneyDocumentAnalytics({ formik, offsetAccountId, colSpan = 4 }: Props) {
  const { definitions } = useAccountDefinitions(offsetAccountId ?? null);
  const budgetAccount = Boolean(offsetAccountId) && definitions.some((x) => x.id === BUDGET_PAYMENT_KINDS);
  const incomeExpenseAccount =
    Boolean(offsetAccountId) && definitions.some((x) => x.id === OTHER_INCOME_EXPENSES);

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
      {incomeExpenseAccount && (
        <Col span={colSpan}>
          <SelectCustom
            formik={formik}
            fieldName="incomeExpenseItemId"
            label="moneyDocument.incomeExpenseItem"
            placeholder="moneyDocument.incomeExpenseItemAuto"
            path={`subkonto-values/${OTHER_INCOME_EXPENSES}`}
            clearable
            search
            getFirst={false}
            autoSelectSingle={false}
          />
        </Col>
      )}
    </>
  );
}
