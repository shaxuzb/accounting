import { Tag, Tooltip } from "antd";
import { QrCode, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  markingNumber?: string | null;
}

/**
 * The code of one sold unit. A unit that never had a code (received without one,
 * e.g. stock bought before marking was mandatory) is said so plainly rather than
 * left as an empty dash that looks like missing data.
 */
export default function SaleUnitMarkingCell({ markingNumber }: Props) {
  const { t } = useTranslation();
  const code = String(markingNumber ?? "").trim();

  if (code) {
    return (
      <Tooltip title={code}>
        <Tag
          color="success"
          icon={<QrCode className="mr-1 inline size-3.5 align-[-2px]" />}
          className="m-0! max-w-full truncate font-mono text-xs"
        >
          {code}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t("sale.messages.unmarkedUnitReason")}>
      <span className="inline-flex max-w-full items-center gap-2">
        <Tag
          color="warning"
          icon={<ScanLine className="mr-1 inline size-3.5 align-[-2px]" />}
          className="m-0!"
        >
          {t("sale.fields.unmarkedUnit")}
        </Tag>
        <span className="truncate text-xs text-secondary-text">
          {t("sale.messages.unmarkedUnitShort")}
        </span>
      </span>
    </Tooltip>
  );
}
