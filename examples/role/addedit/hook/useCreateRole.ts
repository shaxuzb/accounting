import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../service/roleService";
import { roleKeys } from "@/modules/settings/constants/queryKeys";
import { errorHandlers } from "@/shared/utils/helpers/errorHandlers";
import toast from "react-hot-toast";

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values) => roleService.createRole(values),
    onSuccess: () => {
      toast.success("Rol muvaffaqiyatli yaratildi")
      qc.invalidateQueries({ queryKey: [roleKeys.GET_ALL] });
      qc.invalidateQueries({ queryKey: [roleKeys.GET_DETAIL] });
    },
    onError: (err) => {
      errorHandlers(err);
    },
  });
};



