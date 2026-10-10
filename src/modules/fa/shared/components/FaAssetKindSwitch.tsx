import { Segmented } from "antd";
import { useTranslation } from "react-i18next";
import { faAssetKinds, faAssetKindLabels, type FaAssetKindId } from "../constants/assetKinds";

interface FaAssetKindSwitchProps {
  value: number | null | undefined;
  onChange: (kind: FaAssetKindId) => void;
  disabled?: boolean;
}

/** Fixed assets or intangible assets: the document is for one kind, as 1C has separate documents. */
export default function FaAssetKindSwitch({ value, onChange, disabled }: FaAssetKindSwitchProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-secondary-text">{t("fa.kinds.title")}</span>
      <Segmented<FaAssetKindId>
        value={(value ?? faAssetKinds.fixed) as FaAssetKindId}
        disabled={disabled}
        onChange={onChange}
        options={[faAssetKinds.fixed, faAssetKinds.intangible].map((kind) => ({
          value: kind,
          label: t(faAssetKindLabels[kind]),
        }))}
      />
    </div>
  );
}

