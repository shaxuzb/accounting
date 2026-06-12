import { useDeleteImage } from "@/shared/hooks/images/useDeleteImage";
import { useGetImages } from "@/shared/hooks/images/useGetImages";
import { useUploadImage } from "@/shared/hooks/images/useUploadImage";
import { urlToFile } from "@/shared/utils/helpers/urlToFile";
import {
  Button,
  Form,
  FormProps,
  Image,
  Popconfirm,
  Upload,
  UploadProps,
} from "antd";
import {
  Eye,
  ImageIcon,
  LoaderCircle,
  Trash,
  UploadCloud,
  UploadIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface inputProps {
  label?: string;
  disabled?: boolean;
  url: string;
  type?: "default" | "square";
  queryKey: string;
  marginBottom?: string;
}

const ImageUpload: React.FC<inputProps> = (props) => {
  const { t } = useTranslation();
  const {
    label = "",
    disabled = false,
    marginBottom = "mb-6",
    queryKey,
    url,
    type = "default",
  } = props;
  const { data, refetch } = useGetImages<{ relativePath: string; fileName: string } | null>(queryKey, url);
  const mutation = useDeleteImage(queryKey, url);
  const imageMutation = useUploadImage(queryKey, url);
  const [fileSize, setFileSize] = useState<number>(0);
  const [upload, setUpload] = useState<{
    id: string;
    file: File;
    controller: AbortController;
  } | null>(null);
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileRemove = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    if (data) {
      return mutation.mutate(undefined, {
        onSuccess: () => {
          setUpload(null);
        },
      });
    }
    setUpload(null);

    // formik.setFieldValue(fieldName, null, true);
  };
  const uploadProps: UploadProps = {
    name: "video",
    multiple: false,
    accept: "image",
    customRequest: undefined,
    beforeUpload: (file: File) => {
      const isVideo = file.type.startsWith("image/");
      if (!isVideo) {
        toast.error("Faqat rasm fayllarni yuklash mumkin!");
        return false;
      }
      const formData = new FormData();
      formData.append("file", file);
      const id = `${Date.now()}-${file.name}`;
      const controller = new AbortController();
      setUpload({
        id,
        file,
        controller,
      });
      imageMutation.mutate(formData, {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          setUpload(null);
        },
      });
      // 🔥 Fayl qo‘shilgandan keyin darhol uploadni boshlash
      // startUpload(id, file, controller);

      return false; // avtomatik uploadni bloklaymiz
    },
    fileList: [],
  };
  useEffect(() => {
    if (!data?.relativePath) return;

    (async () => {
      const file = await urlToFile(
        `${import.meta.env.VITE_API_BASE_URL_PATH}/${data.relativePath}`
      );

      setFileSize(file.size);
    })();
  }, [data?.relativePath]);
  return (
    <Form.Item<FormProps>
      className={`!flex !flex-col ${marginBottom}`}
      label={label === "" ? false : t(label)}
      rules={[{ required: true, message: "Please input your password!" }]}
    >
      {type === "default" && (
        <Upload.Dragger
          {...uploadProps}
          rootClassName="[&_.ant-upload-btn]:!p-0 !w-full"
        >
          <div className="flex items-center p-2 h-[38px] rounded-lg">
            {(data || upload) && !imageMutation.isPending ? (
              <div className="flex items-center w-full space-x-4">
                <Image
                  src={
                    upload
                      ? URL.createObjectURL(upload.file)
                      : `${import.meta.env.VITE_API_BASE_URL_PATH}/${
                          data?.relativePath
                        }`
                  }
                  width={32}
                  loading="lazy"
                  className="rounded"
                  height={32}
                  // alt={formik.values[fieldName].name}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ellipsis line-clamp-1 overflow-hidden">
                    {upload ? upload.file.name : data?.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(upload ? upload.file.size : fileSize)}
                  </div>
                </div>
                <Popconfirm
                  title="Rasm o‘chirilsinmi?"
                  description={false}
                  okText="Ha"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleFileRemove();
                  }}
                  onCancel={(e) => {
                    e?.stopPropagation();
                  }}
                  cancelText="Yo‘q"
                >
                  <Button
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="min-w-0 w-8 !p-0 !shrink-0"
                  >
                    {mutation.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash fill="black" className="size-4" />
                    )}
                  </Button>
                </Popconfirm>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full relative ">
                <div className="flex items-center gap-3">
                  <div>
                    <ImageIcon className="text-gray-500" fontSize={26} />
                  </div>
                  <div className="flex flex-col ">
                    <span className="text-sm">rasm yuklang</span>
                    <span className="text-[10px] text-gray-500">JPG, PNG</span>
                  </div>
                </div>

                <>
                  <Button size="small" type="primary" disabled={disabled}>
                    {imageMutation.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <UploadCloud className="size-4" />
                    )}
                    <span className="text-xs">
                      {imageMutation.isPending ? "yuklanmoqda" : "yuklash"}
                    </span>
                  </Button>
                  {/* <input
                  id={fieldName}
                  name={fieldName}
                  type="file"
                  className="absolute w-full h-full left-0 opacity-0 top-0"
                  onChange={handleFileChange}
                /> */}
                </>
              </div>
            )}
          </div>
        </Upload.Dragger>
      )}
      {type === "square" && (
        <div className={`ant-image !w-52 !h-52 overflow-hidden`}>
          {(data || upload) && !imageMutation.isPending ? (
            <Image
              width={208}
              height={208}
              className={`rounded-md`}
              preview={{
                mask: (
                  <div className="flex">
                    <Button
                      className="!p-0 w-7 !text-white hover:!bg-white/20"
                      type="text"
                    >
                      <Eye className={`size-5"}`} />
                    </Button>
                    <Popconfirm
                      title="Rasm o‘chirilsinmi?"
                      description={false}
                      okText="Ha"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleFileRemove();
                      }}
                      onCancel={(e) => {
                        e?.stopPropagation();
                      }}
                      cancelText="Yo‘q"
                    >
                      <Button
                        className="!p-0 w-7 !text-white active:!bg-white/30 hover:!bg-white/20"
                        type="text"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {mutation.isPending ? (
                          <LoaderCircle className={`size-5 animate-spin`} />
                        ) : (
                          <Trash className={`size-5`} />
                        )}
                      </Button>
                    </Popconfirm>
                  </div>
                ),
              }}
              src={
                upload
                  ? URL.createObjectURL(upload.file)
                  : `${import.meta.env.VITE_API_BASE_URL_PATH}/${
                      data?.relativePath
                    }`
              }
            />
          ) : (
            <Upload
              {...uploadProps}
              className={`[&_.ant-upload-select]:!w-52 [&_.ant-upload-select]:!h-52`}
              rootClassName={`!w-52 !h-52`}
              name="upload"
              listType="picture-card"
            >
              <div className="flex justify-center items-center flex-col gap-3">
                {imageMutation.isPending ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <UploadIcon className="size-5" />
                )}
                <div className={`text-sm`}>
                  {imageMutation.isPending ? (
                    "yuklanmoqda"
                  ) : (
                    <span>Rasm yuklash</span>
                  )}
                </div>
              </div>
            </Upload>
          )}
        </div>
      )}
    </Form.Item>
  );
};

export default ImageUpload;





