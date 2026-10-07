import { useNavigate } from "react-router";
import Card from "@/components/ui/card/Card";
import { integrationDefinitions } from "../constants/integration";
import IntegrationCard from "../components/IntegrationCard";
import { useEdoActiveProvider, useEdoAuthSession } from "../edo/hooks";
import { isEdoAuthSessionActive } from "../edo/utils/authSession";

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const activeProviderQuery = useEdoActiveProvider();
  const edoSession = useEdoAuthSession(activeProviderQuery.data?.code);
  const edoStatus = isEdoAuthSessionActive(edoSession)
    ? "CONNECTED"
    : "DISCONNECTED";

  return (
    <Card className="p-3">
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {integrationDefinitions.map((definition) => (
          <IntegrationCard
            key={definition.code}
            definition={definition}
            record={{ code: definition.code, status: edoStatus }}
            onOpen={() => navigate("edo")}
          />
        ))}
      </section>
    </Card>
  );
}
