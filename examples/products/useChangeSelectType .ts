import {
  changeSelectListType,
  OrganizationState,
} from "@/store/features/organizationSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";

export const useChangeSelectType = (
  type: OrganizationState["selectListType"] = "selectable",
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(changeSelectListType(type));

    return () => {
      dispatch(changeSelectListType("selectable"));
    };
  }, [dispatch, type]);
};
