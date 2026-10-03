import { Alert, Button, Checkbox, Form, Input, Modal, Select, Upload } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { contractTemplateKinds } from "../constants";
import { useCreateContractTemplate, useUpdateContractTemplate } from "../hooks";
import type { ContractTemplate } from "../types";

interface ContractTemplateFormModalProps {
  open: boolean;
  /** Edit this template's name, kind and default flag; create a new one when absent. */
  template?: ContractTemplate | null;
  onClose: () => void;
  /** After a create: the new template's id. */
  onCreated?: (id: number) => void;
}

interface FormValues {
  name: string;
  kind: string;
  isDefault: boolean;
}

export default function ContractTemplateFormModal({
  open,
  template,
  onClose,
  onCreated,
}: ContractTemplateFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<File | null>(null);
  const [unknownKeys, setUnknownKeys] = useState<string[]>([]);
  const create = useCreateContractTemplate();
  const update = useUpdateContractTemplate();
  const isEdit = Boolean(template);

  const close = () => {
    form.resetFields();
    setFile(null);
    setUnknownKeys([]);
    onClose();
  };

  const submit = async (values: FormValues) => {
    if (template) {
      await update.mutateAsync({ id: template.id, ...values });
      toast.success(t("contractTemplates.messages.saved"));
      close();
      return;
    }
    const saved = await create.mutateAsync({ ...values, file });
    toast.success(t("contractTemplates.messages.created"));
    if (saved.unknownKeys.length > 0) {
      // keep the dialog open so the warning is read
      setUnknownKeys(saved.unknownKeys);
      onCreated?.(saved.id);
      return;
    }
    close();
    onCreated?.(saved.id);
  };

  return (
    <Modal
      open={open}
      title={
        isEdit
          ? t("contractTemplates.actions.edit")
          : t("contractTemplates.actions.add")
      }
      onCancel={close}
      destroyOnHidden
      footer={
        unknownKeys.length > 0
          ? [
              <Button key="ok" type="primary" onClick={close}>
                {t("common.close")}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={close}>
                {t("common.cancel")}
              </Button>,
              <Button
                key="save"
                type="primary"
                loading={create.isPending || update.isPending}
                onClick={() => form.submit()}
              >
                {t("common.save")}
              </Button>,
            ]
      }
    >
      {unknownKeys.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          message={t("contractTemplates.messages.unknownKeysTitle")}
          description={
            <div>
              <div className="mb-1">
                {t("contractTemplates.messages.unknownKeysHint")}
              </div>
              {unknownKeys.map((key) => (
                <code key={key} className="mr-2 inline-block text-xs">
                  {`{{${key}}}`}
                </code>
              ))}
            </div>
          }
        />
      ) : (
        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void submit(values)}
          initialValues={{
            name: template?.name ?? "",
            kind: template?.kind ?? "sale",
            isDefault: template?.isDefault ?? false,
          }}
        >
          <Form.Item
            name="name"
            label={t("contractTemplates.fields.name")}
            rules={[{ required: true, whitespace: true, message: t("contractTemplates.validation.nameRequired") }]}
          >
            <Input maxLength={250} />
          </Form.Item>
          <Form.Item name="kind" label={t("contractTemplates.fields.kind")}>
            <Select
              options={contractTemplateKinds.map((kind) => ({
                value: kind,
                label: t(`contractTemplates.kinds.${kind}`),
              }))}
            />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>{t("contractTemplates.fields.isDefault")}</Checkbox>
          </Form.Item>
          {!isEdit && (
            <Form.Item
              label={t("contractTemplates.fields.file")}
              extra={t("contractTemplates.fields.fileHint")}
            >
              <Upload
                accept=".docx"
                maxCount={1}
                beforeUpload={(next) => {
                  setFile(next);
                  return false;
                }}
                onRemove={() => setFile(null)}
                fileList={
                  file
                    ? [{ uid: "1", name: file.name, status: "done" }]
                    : []
                }
              >
                <Button icon={<UploadIcon className="size-4" />}>
                  {t("contractTemplates.actions.chooseFile")}
                </Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
}
