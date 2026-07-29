import { apiIntegrationService } from "./apiIntegrationService";
import { mockIntegrationService } from "./mockIntegrationService";

const useMockMode = import.meta.env.VITE_INTEGRATIONS_MOCK_MODE !== "false";

export const integrationService = useMockMode
  ? mockIntegrationService
  : apiIntegrationService;
