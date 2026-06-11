import { useTranslation } from "react-i18next";
import { Button, Space } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

interface SettingsPageHeaderProps {
  search?: ReactNode;
  canCreate?: boolean;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export default function SettingsPageHeader({
  search,
  canCreate = true,
  onCreate,
  onRefresh,
}: SettingsPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>{search}</div>
      <Space>
        {onRefresh && (
          <Button icon={<RefreshCw className="size-4" />} onClick={onRefresh} />
        )}
        {canCreate && onCreate && (
          <Button
            type="primary"
            icon={<Plus className="size-4" />}
            onClick={onCreate}
          >{t("common.add")}</Button>
        )}
      </Space>
    </div>
  );
}
