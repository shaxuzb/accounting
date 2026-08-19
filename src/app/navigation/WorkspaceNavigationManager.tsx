import { useEffect } from "react";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";

const WorkspaceNavigationManager = () => {
  const { syncFromCurrentRoute } = useWorkspaceNavigation();

  useEffect(() => {
    syncFromCurrentRoute();
  }, [syncFromCurrentRoute]);

  return null;
};

export default WorkspaceNavigationManager;
