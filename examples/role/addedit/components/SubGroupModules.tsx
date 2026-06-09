import {
  Button,
  Checkbox,
  Collapse,
  CollapseProps,
  Divider,
  Empty,
  Input,
  Spin,
  Switch,
} from "antd";
import { useGetRoleModules } from "../hook/useGetRoleModules";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { RoleInitialValues } from "@/modules/settings/types/initialValues";
import { Check, ChevronRight, Search, X } from "lucide-react";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
interface SubGroupModulesProps {
  formik: FormikProps<RoleInitialValues>;
}
const SubGroupModules: FC<SubGroupModulesProps> = ({ formik }) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth?.user);
  const { data, isLoading, isFetching } = useGetRoleModules(user.user.organizationId);

  return (
    <Spin spinning={isFetching || isLoading}>
      <div className="!mt-3 rounded-md">
        {data && data.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Input
                placeholder="Modul nomi bo'yicha qidiring..."
                prefix={<Search className="size-4 text-muted" />}
              />
              <div className="flex justify-end items-center">
                <Button
                  type="primary"
                  loading={formik.isSubmitting}
                  htmlType="submit"
                  style={{
                    width: 140,
                  }}
                >
                  {t("Saqlash")}
                </Button>
              </div>
            </div>
            <Collapse
              bordered={false}
              defaultActiveKey={["1"]}
              expandIcon={({ isActive }) => (
                <ChevronRight
                  className={`size-4 text-muted ${isActive ? "rotate-90" : ""}`}
                />
              )}
              style={{ background: "transparent" }}
              items={
                (data.map((module) => ({
                  id: module.id,
                  key: module.id,
                  style: {
                    marginBottom: 10,
                    border: "none",
                    borderRadius: 6,
                    background: "var(--bg-primary)",
                  },
                  label: (
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-semibold">{module.fullName}</span>{" "}
                        <span className="text-muted-second">
                          <span className="text-xs ml-1 align-middle font-semibold">
                            {module.modules.length}/
                            {
                              formik.values.roleModules?.filter((item) =>
                                module.modules
                                  .map((mod) => mod.id)
                                  .includes(item),
                              ).length
                            }
                          </span>
                        </span>
                      </div>
                    </div>
                  ),
                  children: (
                    <div className="px-3 flex gap-3 flex-nowrap overflow-auto p-2 py-4">
                      {module.modules.map((item) => (
                        <Card
                          className="shadow-sm !bg-primary-bg p-3 min-w-44 shrink-0"
                          key={item.id}
                        >
                          <div>
                            <h1 className="font-medium text-nowrap">
                              {item.shortName}
                            </h1>
                            <span className="text-[10px] text-muted-second">
                              {item.code}
                            </span>
                          </div>
                          <Divider className="!my-2" />
                          <div>
                            <div
                              className={`flex justify-between items-center rounded-full duration-200 px-2 py-1 ${
                                formik.values.roleModules?.includes(item.id)
                                  ? "bg-green-100"
                                  : "bg-rose-100"
                              }`}
                            >
                              <Button
                                variant="solid"
                                color={
                                  formik.values.roleModules?.includes(item.id)
                                    ? "primary"
                                    : "volcano"
                                }
                                className="!p-0 !size-4 !rounded-full"
                              >
                                {formik.values.roleModules?.includes(
                                  item.id,
                                ) ? (
                                  <Check className="size-3 text-white" />
                                ) : (
                                  <X className="size-3 text-white" />
                                )}
                              </Button>
                              <Switch
                                size="small"
                                checked={
                                  !!formik.values.roleModules?.find(
                                    (id) => id === item.id,
                                  )
                                }
                                onChange={(checked) => {
                                  const currentModules =
                                    formik.values.roleModules || [];
                                  const newModules = checked
                                    ? [...currentModules, item.id]
                                    : currentModules.filter(
                                        (id) => id !== item.id,
                                      );
                                  formik.setFieldValue(
                                    "roleModules",
                                    newModules,
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                  extra: (
                    <div
                      className="flex gap-1 items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs">Hammasini belgilash</p>
                      <Checkbox
                        checked={module.modules.every((id) =>
                          formik.values.roleModules?.includes(id.id),
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          const checked = e.target.checked;
                          const currentModules =
                            formik.values.roleModules || [];
                          const newModules = checked
                            ? Array.from(
                                new Set([
                                  ...currentModules,
                                  ...module.modules.map((id) => id.id),
                                ]),
                              )
                            : currentModules.filter(
                                (id) =>
                                  !module.modules
                                    .map((id) => id.id)
                                    .includes(id),
                              );
                          formik.setFieldValue("roleModules", newModules);
                        }}
                      />
                    </div>
                  ),
                })) as unknown as CollapseProps["items"]) ?? []
              }
            />
          </div>
        ) : (
          <div className="py-6">
            <Empty />
          </div>
        )}
      </div>
    </Spin>
  );
};

export default SubGroupModules;
