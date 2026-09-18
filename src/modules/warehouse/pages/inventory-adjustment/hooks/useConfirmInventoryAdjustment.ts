import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAdjustmentKeys } from "../constants/queryKeys";
import { inventoryAdjustmentService } from "../services/inventoryAdjustmentService";

export const useConfirmInventoryAdjustment = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    // Yangi hujjatda id hali yo'q: saqlangandan keyin qaytgan id shu yerga
    // beriladi, aks holda so'rov /inventory-adjustments//confirm bo'lib ketardi.
    mutationFn: (confirmId?: string | number) =>
      inventoryAdjustmentService.confirm(confirmId ?? id),
    onSuccess: (_data, confirmId) => {
      // 204 javobda tana yo'q: setQueryData(undefined) keshdagi hujjatni
      // o'chirib yuborardi. Qayta so'rash yetarli.
      void queryClient.invalidateQueries({
        queryKey: inventoryAdjustmentKeys.detail(confirmId ?? id),
      });
      void queryClient.invalidateQueries({ queryKey: inventoryAdjustmentKeys.all });
    },
  });
};
