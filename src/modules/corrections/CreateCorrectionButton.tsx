import { Button } from "antd";
import { FilePenLine } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { correctionPermissions, corrections, type CorrectionKind } from "./constants";

/** «Создать на основании → Корректировка»: a correction of this posted sale or purchase. */
export default function CreateCorrectionButton({ kind, baseId }: { kind: CorrectionKind; baseId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PermissionCard permission={correctionPermissions.create}>
      <Button icon={<FilePenLine className="size-4" />} onClick={() => navigate(`${corrections[kind].path}/new?base=${baseId}`)}>
        {t("correction.createFromBase")}
      </Button>
    </PermissionCard>
  );
}
