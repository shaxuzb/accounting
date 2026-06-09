import type { FC } from "react";
import { useMemo, useState } from "react";
import type { FormikProps } from "formik";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Empty,
  Input,
  Spin,
  Switch,
} from "antd";
import type { CollapseProps } from "antd";
import { Check, ChevronRight, Search, X } from "lucide-react";
import Card from "@/components/ui/card/Card";
// import { useAppSelector } from "@/store/hooks";
import type { RoleForm, RoleModuleGroup } from "../../../types/settings";
import { useGetRoleModules } from "../../../hooks/role/useGetRoleModules";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface RoleModuleSelectorProps {
  formik: FormikProps<RoleForm>;
  submitting: boolean;
}

const getModuleIds = (group: RoleModuleGroup) =>
  group.modules.map((module) => module.id);

const RoleModuleSelector: FC<RoleModuleSelectorProps> = ({
  formik,
  submitting,
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim().toLowerCase(), 250);
  // const organizationId = useAppSelector(
  //   (state) => state.auth.user?.user?.organizationId,
  // );
  const { data = [], isLoading, isFetching } = useGetRoleModules();

  const selectedModules = formik.values.roleModules ?? [];
  const filteredGroups = useMemo(() => {
    if (!debouncedSearch) return data;

    return data
      .map((group) => ({
        ...group,
        modules: group.modules.filter((module) =>
          [module.fullName, module.shortName, module.code]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(debouncedSearch)),
        ),
      }))
      .filter(
        (group) =>
          group.fullName.toLowerCase().includes(debouncedSearch) ||
          group.modules.length > 0,
      );
  }, [data, debouncedSearch]);

  const toggleModule = (moduleId: number, checked: boolean) => {
    const nextModules = checked
      ? Array.from(new Set([...selectedModules, moduleId]))
      : selectedModules.filter((id) => id !== moduleId);

    void formik.setFieldValue("roleModules", nextModules);
  };

  const toggleGroup = (group: RoleModuleGroup, checked: boolean) => {
    const groupIds = getModuleIds(group);
    const nextModules = checked
      ? Array.from(new Set([...selectedModules, ...groupIds]))
      : selectedModules.filter((id) => !groupIds.includes(id));

    void formik.setFieldValue("roleModules", nextModules);
  };

  const items: CollapseProps["items"] = filteredGroups.map((group) => {
    const groupIds = getModuleIds(group);
    const selectedCount = groupIds.filter((id) =>
      selectedModules.includes(id),
    ).length;
    const allSelected =
      groupIds.length > 0 &&
      groupIds.every((id) => selectedModules.includes(id));

    return {
      key: group.id,
      style: {
        marginBottom: 10,
        border: "none",
        borderRadius: 6,
        background: "var(--bg-primary)",
      },
      className: "border! border-border!",
      label: (
        <div className="flex items-center gap-3">
          <span className="font-semibold">{group.fullName}</span>
          <span className="text-xs font-semibold text-muted-second">
            {selectedCount}/{groupIds.length}
          </span>
        </div>
      ),
      children: (
        <div className="flex gap-3 overflow-auto px-3 py-4">
          {group.modules.map((module) => {
            const checked = selectedModules.includes(module.id);

            return (
              <Card
                className="min-w-44 shrink-0 p-3 bg-primary-bg! border border-border"
                key={module.id}
              >
                <div>
                  <h3 className="text-nowrap font-medium">
                    {module.shortName}
                  </h3>
                  <span className="text-[10px] text-muted-second">
                    {module.code}
                  </span>
                </div>
                <Divider className="my-2!" />
                <div
                  className={`flex items-center justify-between rounded-full px-2 py-1 duration-200 ${
                    checked ? "bg-green-100" : "bg-rose-100"
                  }`}
                >
                  <Button
                    variant="solid"
                    color={checked ? "primary" : "volcano"}
                    className="size-4! rounded-full! p-0!"
                  >
                    {checked ? (
                      <Check className="size-3 text-white" />
                    ) : (
                      <X className="size-3 text-white" />
                    )}
                  </Button>
                  <Switch
                    size="small"
                    checked={checked}
                    onChange={(value) => toggleModule(module.id, value)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ),
      extra: (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="text-xs">Hammasini belgilash</span>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedCount > 0 && !allSelected}
            onChange={(event) => toggleGroup(group, event.target.checked)}
          />
        </div>
      ),
    };
  });

  return (
    <Spin spinning={isFetching || isLoading}>
      <div className="mt-3 rounded-md">
        <div className="mb-3 flex gap-3">
          <Input
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Modul nomi bo'yicha qidiring..."
            prefix={<Search className="size-4 text-muted" />}
          />
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="min-w-35"
          >
            Saqlash
          </Button>
        </div>
        {filteredGroups.length > 0 ? (
          <Collapse
            bordered={false}
            defaultActiveKey={filteredGroups[0]?.id}
            expandIcon={({ isActive }) => (
              <ChevronRight
                className={`size-4 text-muted ${isActive ? "rotate-90" : ""}`}
              />
            )}
            items={items}
            className=""
            style={{ background: "transparent" }}
          />
        ) : (
          <div className="py-6">
            <Empty />
          </div>
        )}
      </div>
    </Spin>
  );
};

export default RoleModuleSelector;
