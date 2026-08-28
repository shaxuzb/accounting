export interface NavigationSourceTab {
  key?: string;
  path: string;
}

export const getNavigationSourceTab = (
  navigationType: string,
  sourceTab: NavigationSourceTab | undefined,
  currentPath: string,
): NavigationSourceTab | null => {
  if (
    navigationType !== "PUSH" ||
    !sourceTab ||
    sourceTab.path === currentPath
  ) {
    return null;
  }

  return sourceTab;
};
