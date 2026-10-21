import { Button, Dropdown } from "antd";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { TradePrintForm } from "./TradeDocumentPrintPage";

/** «Chop etish» of a sale (the waybill, the services act) or a purchase (the receipt). */
export default function TradePrintButton({ source, documentId }: { source: "sale" | "purchase"; documentId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const base = source === "sale" ? `/main/sales/sale/${documentId}/print` : `/main/purchases/purchase/${documentId}/print`;
  const forms: TradePrintForm[] = source === "sale" ? ["waybill", "act"] : ["receipt"];
  if (forms.length === 1)
    return (
      <Button icon={<Printer className="size-4" />} onClick={() => navigate(`${base}/${forms[0]}`)}>
        {t(`tradePrint.menu.${forms[0]}`)}
      </Button>
    );
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: forms.map((form) => ({ key: form, label: t(`tradePrint.menu.${form}`) })),
        onClick: ({ key }) => navigate(`${base}/${key}`),
      }}
    >
      <Button icon={<Printer className="size-4" />}>{t("tradePrint.print")}</Button>
    </Dropdown>
  );
}
