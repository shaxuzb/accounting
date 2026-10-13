import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import { warehousePermissions } from "@/modules/settings/pages/warehouse/constants/permissions";
import { departmentsPermissions } from "@/modules/settings/pages/departments/constants/permissions";
import { positionsPermissions } from "@/modules/settings/pages/positions/constants/permissions";

/**
 * The records a select field can make on the spot, in their own modal form (1C: «Создать»
 * beside the field), without leaving the document. Each form is loaded when first opened.
 */
export type InlineCreateKind = "warehouse" | "department" | "position";

interface InlineCreateFormProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: number) => void;
}

export const inlineCreateForms: Record<
  InlineCreateKind,
  { permission: string; Form: LazyExoticComponent<ComponentType<InlineCreateFormProps>> }
> = {
  warehouse: {
    permission: warehousePermissions.create,
    Form: lazy(() => import("@/modules/settings/pages/warehouse/screens/WarehouseAddEditPage")),
  },
  department: {
    permission: departmentsPermissions.create,
    Form: lazy(() => import("@/modules/settings/pages/departments/screens/DepartmentAddEditPage")),
  },
  position: {
    permission: positionsPermissions.create,
    Form: lazy(() => import("@/modules/settings/pages/positions/screens/PositionAddEditPage")),
  },
};
