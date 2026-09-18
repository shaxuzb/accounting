import { CounterpartyBalanceReport } from "../components";
import { counterpartySettlementKind } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";

/**
 * Debitor qarz: sotuv hujjatlari kontragentning bizga qarzini oshiradi
 * (SaleCounterpartyRegisterService), to'lov esa kamaytiradi.
 */
export default function ReceivableReportPage() {
  return (
    <CounterpartyBalanceReport
      report="receivable"
      exportPermission={operationalReportPermissions.receivable.export}
      settlementKindId={counterpartySettlementKind.customer}
      balanceLabelKey="reports.fields.receivableBalance"
      scopeNoteKey="reports.messages.receivableScope"
    />
  );
}
