import { CounterpartyBalanceReport } from "../components";
import { counterpartySettlementKind } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";

/**
 * Kreditor qarz: xarid hujjatlari bizning yetkazib beruvchiga qarzimizni
 * oshiradi (PurchaseCounterpartyRegisterService), to'lov kamaytiradi.
 */
export default function PayableReportPage() {
  return (
    <CounterpartyBalanceReport
      report="payable"
      exportPermission={operationalReportPermissions.payable.export}
      settlementKindId={counterpartySettlementKind.supplier}
      balanceLabelKey="reports.fields.payableBalance"
      scopeNoteKey="reports.messages.payableScope"
    />
  );
}
