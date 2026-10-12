import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import { faAssetKindLabels, faAssetKinds } from "../constants/assetKinds";

/** Which kind a posted document is of: fixed assets or intangible assets (1C has separate documents). */
export default function FaAssetKindTag({ assetKindId }: { assetKindId?: number | null }) {
  const { t } = useTranslation();
  const kind = assetKindId ?? faAssetKinds.fixed;
  return (
    <Tag color={kind === faAssetKinds.intangible ? "purple" : "blue"} className="m-0!">
      {t(faAssetKindLabels[kind])}
    </Tag>
  );
}

/** The kind as a labelled field of a readonly document's header. */
export function FaAssetKindField({ assetKindId }: { assetKindId?: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="min-w-40">
      <div className="text-xs text-secondary-text">{t("fa.kinds.title")}</div>
      <div className="mt-0.5">
        <FaAssetKindTag assetKindId={assetKindId} />
      </div>
    </div>
  );
}
