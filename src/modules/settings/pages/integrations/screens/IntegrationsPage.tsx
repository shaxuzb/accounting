import { useNavigate } from "react-router";
import Card from "@/components/ui/card/Card";
import { integrationDefinitions } from "../constants/integration";
import IntegrationCard from "../components/IntegrationCard";
import { useEdoActiveProvider, useEdoAuthSession } from "../edo/hooks";
import { isEdoAuthSessionActive } from "../edo/utils/authSession";
import { useAppSelector } from "@/store/hooks";
import { integrationPermissions } from "../constants/permissions";
import { useOneCConnections } from "../onec/api";

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const activeProviderQuery = useEdoActiveProvider();
  const edoSession = useEdoAuthSession(activeProviderQuery.data?.code);
  const edoStatus = isEdoAuthSessionActive(edoSession)
    ? "CONNECTED"
    : "DISCONNECTED";
  // the 1C connections are read only by those who may manage them
  const user = useAppSelector((state) => state.auth?.user);
  const canImportOneC = (user?.user.permissions ?? []).includes(integrationPermissions.onecImport);
  const onecConnections = useOneCConnections(canImportOneC);
  const onecStatus = onecConnections.data?.some((connection) => connection.status === "ACTIVE")
    ? "CONNECTED"
    : "DISCONNECTED";

  return (
    <Card className="p-3">
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {integrationDefinitions.map((definition) => (
          <IntegrationCard
            key={definition.code}
            definition={definition}
            record={{
              code: definition.code,
              status: definition.code === "ONEC" ? onecStatus : edoStatus,
            }}
            onOpen={() => navigate(definition.code === "ONEC" ? "onec" : "edo")}
          />
        ))}
      </section>
    </Card>
  );
}
