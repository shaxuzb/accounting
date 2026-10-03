import { Button, Popconfirm, Space, Table, Tag, Tooltip, Upload } from "antd";
import type { TableColumnsType } from "antd";
import {
  Download,
  FilePenLine,
  FileUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchHighlight from "@/components/ui/table/SearchHighlight";
import { useAppSelector } from "@/store/hooks";
import { customDate } from "@/utils/utils";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { contractTemplateService } from "../api";
import {
  contractTemplateKinds,
  contractTemplatePermissions as permissions,
} from "../constants";
import {
  useContractTemplates,
  useDeleteContractTemplate,
  useReplaceContractTemplateFile,
} from "../hooks";
import ContractTemplateFormModal from "../components/ContractTemplateFormModal";
import ContractTemplateEditorModal from "../components/ContractTemplateEditorModal";
import type { ContractTemplate } from "../types";

export default function ContractTemplateListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const can = (code: string) => userPermissions.includes(code);

  const search = searchParams.get("search") || undefined;
  const kind = searchParams.get("kind") || undefined;
  const { data = [], isLoading, isFetching, refetch } = useContractTemplates({
    kind,
    search,
  });
  const remove = useDeleteContractTemplate();
  const replaceFile = useReplaceContractTemplateFile();
  const [modal, setModal] = useState<{ template?: ContractTemplate } | null>(
    null,
  );
  const [editing, setEditing] = useState<ContractTemplate | null>(null);

  const download = async (template: ContractTemplate) => {
    const file = await contractTemplateService.download(
      template.id,
      template.fileName,
    );
    downloadBlob(file.blob, file.fileName);
  };

  const upload = async (template: ContractTemplate, file: File) => {
    const saved = await replaceFile.mutateAsync({ id: template.id, file });
    if (saved.unknownKeys.length > 0)
      toast(
        t("contractTemplates.messages.unknownKeysShort", {
          keys: saved.unknownKeys.map((key) => `{{${key}}}`).join(", "),
        }),
        { icon: "⚠️", duration: 8000 },
      );
    else toast.success(t("contractTemplates.messages.fileReplaced"));
  };

  const columns: TableColumnsType<ContractTemplate> = [
    {
      dataIndex: "name",
      title: t("contractTemplates.fields.name"),
      render: (value, record) => (
        <Space size={6}>
          <SearchHighlight text={value} search={search} />
          {record.isDefault && (
            <Tag color="blue">{t("contractTemplates.fields.default")}</Tag>
          )}
        </Space>
      ),
    },
    {
      dataIndex: "kind",
      title: t("contractTemplates.fields.kind"),
      render: (value: string) => t(`contractTemplates.kinds.${value}`),
    },
    {
      dataIndex: "fileName",
      title: t("contractTemplates.fields.file"),
      render: (value, record) => (
        <span className="text-secondary-text">
          {value} · {(record.size / 1024).toFixed(0)} KB · v{record.version}
        </span>
      ),
    },
    {
      dataIndex: "updatedDate",
      title: t("contractTemplates.fields.updatedDate"),
      align: "center",
      render: (value) => customDate(value),
    },
    {
      dataIndex: "actions",
      title: t("common.actions"),
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          {can(permissions.update) && (
            <Tooltip title={t("contractTemplates.actions.openEditor")}>
              <Button
                type="primary"
                size="small"
                icon={<FilePenLine className="size-4" />}
                onClick={() => setEditing(record)}
              />
            </Tooltip>
          )}
          <Tooltip title={t("contractTemplates.actions.download")}>
            <Button
              size="small"
              icon={<Download className="size-4" />}
              onClick={() => void download(record)}
            />
          </Tooltip>
          {can(permissions.update) && (
            <>
              <Tooltip title={t("contractTemplates.actions.replaceFile")}>
                <Upload
                  accept=".docx"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    void upload(record, file);
                    return false;
                  }}
                >
                  <Button size="small" icon={<FileUp className="size-4" />} />
                </Upload>
              </Tooltip>
              <Tooltip title={t("contractTemplates.actions.edit")}>
                <Button
                  size="small"
                  icon={<Pencil className="size-4" />}
                  onClick={() => setModal({ template: record })}
                />
              </Tooltip>
            </>
          )}
          {can(permissions.delete) && (
            <Popconfirm
              title={t("contractTemplates.actions.deleteConfirm")}
              okButtonProps={{ danger: true }}
              onConfirm={() =>
                remove
                  .mutateAsync(record.id)
                  .then(() => toast.success(t("contractTemplates.messages.deleted")))
              }
            >
              <Button
                size="small"
                danger
                icon={<Trash2 className="size-4" />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="kind"
              placeholder="contractTemplates.fields.kind"
              options={contractTemplateKinds.map((value) => ({
                value,
                label: `contractTemplates.kinds.${value}`,
              }))}
              width={180}
            />
          </>
        }
        actions={
          <PermissionCard permission={permissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setModal({})}
            >
              {t("contractTemplates.actions.add")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<ContractTemplate>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
        />
      </Card>
      <ContractTemplateEditorModal
        template={editing}
        onClose={() => setEditing(null)}
      />
      <ContractTemplateFormModal
        open={modal !== null}
        template={modal?.template}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
