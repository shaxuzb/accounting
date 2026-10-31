// the integrations' own permissions (script 15_integration/1536; they were the sale conditions')
export const integrationPermissions = {
  view: "INTEGRATION_VIEW",
  connect: "INTEGRATION_CONNECT",
  disconnect: "INTEGRATION_CONNECT",
  // the 1C connector (script 15_integration/1537)
  onecImport: "ONEC_IMPORT",
} as const;
