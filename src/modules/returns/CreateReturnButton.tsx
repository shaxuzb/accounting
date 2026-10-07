import { Button } from "antd";
import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { returnPaths, returnPermissions, type ReturnKind } from "./constants";

/**
 * «Создать на основании → Возврат»: a new return of the kind with this posted document as its
 * base, its lines ready to be given back.
 */
export default function CreateReturnButton({ kind, baseId }: { kind: ReturnKind; baseId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PermissionCard permission={returnPermissions.create}>
      <Button
        icon={<Undo2 className="size-4" />}
        onClick={() => navigate(`${returnPaths[kind]}/new?base=${baseId}`)}
      >
        {t("returnDoc.createFromBase")}
      </Button>
    </PermissionCard>
  );
}
