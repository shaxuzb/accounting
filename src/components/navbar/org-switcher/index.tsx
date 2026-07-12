import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOrganization } from "@/store/features/organizationSlice";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select } from "antd";
import type { SelectData } from "@/shared/types";

const fetchOrganizations = async (): Promise<SelectData[]> => {
  const { data } = await $axiosPrivate.get(
    selectListEndpoints.organizationsSelectList,
  );
  return data;
};

const OrgSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const currentOrg = useAppSelector((state) => state.organization);
  const { data: organizations = [], isLoading } = useQuery<SelectData[]>({
    queryKey: [selectListKeys.organization],
    queryFn: fetchOrganizations,
  });

  if (currentOrg.selectListType === "hidden") return null;

  if (!organizations.length && !isLoading) return null;

  const handleChange = (value: number) => {
    const selected = organizations.find((org) => org.id === value);
    if (!selected || selected.id === currentOrg.id) return;

    // 1. localStorage ni sinxron yangilaymiz (axios interceptor shu yerdan o'qiydi)
    dispatch(
      setOrganization({
        organizationId: selected.id,
        organizationName: selected.name,
        code: selected.organizationTypeCode,
        useContractAccounting: selected.useContractAccounting,
      }),
    );

    // 2. Barcha query'larni stale qilib, active bo'lganlarini yangi x-org-id bilan qayta fetch qilamiz
    //    (organizations select list bundan mustasno — u org ga bog'liq emas)
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] !== selectListKeys.organization,
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Select
        loading={isLoading}
        disabled={currentOrg.selectListType === "disabled"}
        value={currentOrg.id || undefined}
        onChange={handleChange}
        options={organizations.map((org) => ({
          value: org.id,
          label: org.name,
        }))}
        variant="outlined"
        className="min-w-32! max-w-48! border border-border rounded-lg shadow-sm "
        // className="min-w-32 max-w-48 [&_.ant-select-selector]:!px-0 [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-item]:!text-text"
        popupMatchSelectWidth={false}
        placeholder="Tashkilot"
        size="medium"
      />
    </div>
  );
};

export default OrgSwitcher;
