import { useAppSelector } from "@/store/hooks";
import { useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const PermissionCard = ({
  children,
  permission,
  organizationTypeCode,
  mode = "hide",
  redirectOnDenied = false,
}: {
  children: ReactNode;
  permission?: string | string[];
  organizationTypeCode?: string | string[];
  mode?: "hide" | "redirect";
  // Legacy prop: mode="redirect" dan foydalansa ham bo'ladi.
  redirectOnDenied?: boolean;
}) => {
  const user = useAppSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  const userPermissions = [
    ...(user?.user.permissions ?? []),
    ...((user?.user as { permission?: string[] } | undefined)?.permission ??
      []),
  ];

  const requiredPermissions = Array.isArray(permission)
    ? permission
    : permission
      ? [permission]
      : [];

  const requiredOrganizationCodes = Array.isArray(organizationTypeCode)
    ? organizationTypeCode
    : organizationTypeCode
      ? [organizationTypeCode]
      : [];

  const userOrganizationTypeCode = (
    user?.user as { organizationTypeCode?: string } | undefined
  )?.organizationTypeCode;

  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((item) => userPermissions.includes(item));

  const hasOrganizationCode =
    requiredOrganizationCodes.length === 0 ||
    (userOrganizationTypeCode
      ? requiredOrganizationCodes.includes(userOrganizationTypeCode)
      : false);

  const hasAccess = hasPermission && hasOrganizationCode;
  const shouldRedirect = mode === "redirect" || redirectOnDenied;

  useEffect(() => {
    if (!hasAccess && shouldRedirect) {
      navigate(-1);
      toast.error("Sizda bu sahifaga kirish uchun ruxsat yo'q");
    }
  }, [hasAccess, navigate, shouldRedirect]);

  return hasAccess ? <>{children}</> : null;
};

export default PermissionCard;
