import InputTextArea from "@/components/fields/InputTextArea";
import SelectDate from "@/components/fields/SelectDate";
import SelectStatic from "@/components/fields/SelectStatic";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { displayDate } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { Button, Form, List, Modal, Spin, Upload, type UploadFile } from "antd";
import { useFormik } from "formik";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useDeleteHrAbsenceAttachment,
  useHrAbsenceDetail,
  useHrAbsenceTypes,
  useSaveHrAbsence,
} from "../hooks";
import { hrAbsenceService } from "../services/hrAbsenceService";
import type { HrAbsenceForm } from "../types/form";
import { hrAbsenceSchema } from "../types/schema";
import dayjs from "dayjs";

const emptyValues: HrAbsenceForm = {
  employeeId: null,
  absenceTypeId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  startDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  endDate: "",
  note: null,
};

interface Props {
  open: boolean;
  id?: number | null;
  onClose: () => void;
}

export default function HrAbsenceFormModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();
  const isEdit = Boolean(id);
  const { data: record, isFetching } = useHrAbsenceDetail(id);
  const { data: absenceTypes = [] } = useHrAbsenceTypes();
  const saveMutation = useSaveHrAbsence();
  const deleteAttachment = useDeleteHrAbsenceAttachment(id ?? 0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const formik = useFormik<HrAbsenceForm>({
    initialValues: emptyValues,
    validationSchema: hrAbsenceSchema,
    onSubmit: async (values, helpers) => {
      const files = fileList.flatMap((item) =>
        item.originFileObj ? [item.originFileObj] : [],
      );
      try {
        await saveMutation.mutateAsync({ id, payload: values, files });
        toast.success(
          t(
            isEdit
              ? "hr.messages.absenceUpdated"
              : "hr.messages.absenceCreated",
          ),
        );
        helpers.resetForm({ values: emptyValues });
        setFileList([]);
        onClose();
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  const { resetForm } = formik;

  useEffect(() => {
    if (!open) return;
    resetForm({
      values: record
        ? {
            employeeId: record.employeeId,
            absenceTypeId: record.absenceTypeId,
            docDate: record.docDate,
            startDate: record.startDate,
            endDate: record.endDate,
            note: record.note ?? null,
          }
        : emptyValues,
    });
  }, [open, record, resetForm]);

  const handleClose = () => {
    setFileList([]);
    resetForm({ values: emptyValues });
    onClose();
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    if (!id) return;
    try {
      const blob = await hrAbsenceService.downloadAttachment(id, attachmentId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment.mutateAsync(attachmentId);
      toast.success(t("hr.messages.attachmentDeleted"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Modal
      title={t(isEdit ? "hr.absences.editTitle" : "hr.absences.createTitle")}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isEdit && isFetching}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <div className="grid gap-x-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Form.Item
                label={
                  <span>
                    {t("hr.fields.employee")}{" "}
                    <span className="text-red-500">*</span>
                  </span>
                }
                validateStatus={
                  formik.touched.employeeId && formik.errors.employeeId
                    ? "error"
                    : ""
                }
                help={
                  formik.touched.employeeId
                    ? formik.errors.employeeId
                    : undefined
                }
              >
                <PayrollEmployeeSelect
                  standalone
                  value={formik.values.employeeId}
                  onChange={(value) =>
                    void formik.setFieldValue("employeeId", value, true)
                  }
                />
              </Form.Item>
            </div>
            <SelectStatic
              formik={formik}
              fieldName="absenceTypeId"
              label="hr.fields.absenceType"
              required
              options={absenceTypes.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <SelectDate
              formik={formik}
              fieldName="docDate"
              label="payroll.fields.docDate"
              valueFormat="YYYY-MM-DD"
              required
            />
            <SelectDate
              formik={formik}
              fieldName="startDate"
              label="hr.fields.dateFrom"
              valueFormat="YYYY-MM-DD"
              maxDate={dayjs(formik.values.endDate)}
              required
            />
            <SelectDate
              formik={formik}
              fieldName="endDate"
              label="hr.fields.dateTo"
              valueFormat="YYYY-MM-DD"
              minDate={dayjs(formik.values.startDate)}
              clearable
              required
            />
            <div className="md:col-span-2">
              <InputTextArea
                formik={formik}
                fieldName="note"
                label="hr.fields.note"
                rows={3}
              />
            </div>
          </div>

          <Form.Item label={t("hr.fields.attachments")}>
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => setFileList(next)}
              onRemove={(file) => {
                setFileList((current) =>
                  current.filter((item) => item.uid !== file.uid),
                );
                return true;
              }}
            >
              <Button icon={<UploadCloud className="size-4" />}>
                {t("hr.absences.chooseFiles")}
              </Button>
            </Upload>
            <div className="mt-1 text-xs text-secondary-text">
              {t("hr.absences.filesHint")}
            </div>
          </Form.Item>

          {record?.attachments?.length ? (
            <List
              className="mb-5 rounded-md border border-border px-3"
              size="small"
              dataSource={record.attachments}
              renderItem={(attachment) => (
                <List.Item
                  actions={[
                    <Button
                      key="download"
                      type="text"
                      icon={<Download className="size-4" />}
                      onClick={() =>
                        handleDownload(
                          attachment.id,
                          attachment.originalFileName,
                        )
                      }
                    />,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<Trash2 className="size-4" />}
                      loading={deleteAttachment.isPending}
                      onClick={() => handleDeleteAttachment(attachment.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileText className="mt-1 size-4 text-primary" />}
                    title={attachment.originalFileName}
                    description={
                      attachment.createdDate
                        ? displayDate(attachment.createdDate)
                        : undefined
                    }
                  />
                </List.Item>
              )}
            />
          ) : null}

          <div className="flex justify-end gap-2">
            <Button onClick={handleClose}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saveMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
