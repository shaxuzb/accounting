const DEFAULT_BRIDGE_ORIGIN = "https://account.rbsx.uz";
const DEFAULT_PARENT_ORIGIN = "https://accounting.rbsx.uz";

const trimOrigin = (value: string | undefined, fallback: string) => {
  const source = value?.trim() || fallback;
  return source.replace(/\/$/, "");
};

export const getEimzoBridgeOrigin = () =>
  trimOrigin(import.meta.env.VITE_EIMZO_BRIDGE_ORIGIN, DEFAULT_BRIDGE_ORIGIN);

export const getEimzoParentOrigin = () =>
  trimOrigin(
    import.meta.env.VITE_EIMZO_PARENT_ORIGIN,
    window.parent !== window ? window.location.origin : DEFAULT_PARENT_ORIGIN,
  );

export const isEimzoBridgeEnabled = () => {
  if (import.meta.env.VITE_EIMZO_BRIDGE_ENABLED === "false") return false;
  if (import.meta.env.VITE_EIMZO_BRIDGE_ENABLED === "true") return true;

  return Boolean(import.meta.env.VITE_EIMZO_BRIDGE_ORIGIN);
};
