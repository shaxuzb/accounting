import {
  Button,
  Upload,
  App,
  Image,
  Popconfirm,
  UploadProps,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Eye, LoaderCircle, Trash } from "lucide-react";
import { useDeleteImage } from "@/shared/hooks/images/useDeleteImage";
import { useUploadImage } from "@/shared/hooks/images/useUploadImage";
import { productKeys } from "@/modules/warehouses/constants/queryKeys";
import { productsEndpoint } from "@/modules/warehouses/constants/endpoints";
import { useGetImages } from "@/shared/hooks/images/useGetImages";
import toast from "react-hot-toast";

interface UploadItem {
  fileId: string;
  fileName: string;
  id: number;
  productId: number;
  relativePath: string;
}

interface UploadListResponse {
  results: UploadItem[];
}

type Props = {
  productId: number;
  refetch?: () => void;
};

const ImageSolutionUploadButton = ({ productId }: Props) => {
  const { message } = App.useApp();
  const { data, refetch } = useGetImages<UploadListResponse>(
    productKeys.GET_IMAGES,
    productsEndpoint.GET_IMAGES(productId)
  );
  const imageMutation = useUploadImage(
    productKeys.GET_IMAGES,
    productsEndpoint.UPLOAD_IMAGE(productId)
  );

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Faqat rasm fayllarni yuklash mumkin!");
        return false;
      }

      const formData = new FormData();
      formData.append("file", file);
      imageMutation.mutate(formData, {
        onSuccess: () => {
          refetch();
        },
      });

      return false;
    },
    fileList: [],
  };

  const imageResults = data?.results ?? [];

  return (
    <div>
      <Image.PreviewGroup>
        {imageResults.map((item, index) => (
          <ImageView key={item.id} item={item} index={index} />
        ))}
        <div
          className={`ant-image inline-block ${
            imageResults.length < 1 ? "!w-52 !h-52" : "!w-16 !h-16"
          } overflow-hidden`}
        >
          <Upload
            {...uploadProps}
            className={`${
              imageResults.length < 1
                ? "[&_.ant-upload-select]:!w-52 [&_.ant-upload-select]:!h-52"
                : "[&_.ant-upload-select]:!w-16 [&_.ant-upload-select]:!h-16"
            }`}
            rootClassName={`${
              imageResults.length < 1 ? "!w-52 !h-52" : "!w-16 !h-16"
            }`}
            name="upload"
            listType="picture-card"
          >
            <div className="flex justify-center items-center flex-col">
              {imageMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <UploadOutlined className="size-4" />
              )}
              <div
                className={`${
                  imageResults.length < 1 ? "text-xs" : "text-[10px] text-wrap"
                }`}
              >
                {imageMutation.isPending ? (
                  "yuklanmoqda"
                ) : (
                  <span>
                    Rasm <br /> yuklash
                  </span>
                )}
              </div>
            </div>
          </Upload>
        </div>
      </Image.PreviewGroup>
    </div>
  );
};

export default ImageSolutionUploadButton;

const ImageView = ({ item, index }: { item: UploadItem; index: number }) => {
  const mutation = useDeleteImage(
    productKeys.GET_IMAGES,
    productsEndpoint.UPLOAD_IMAGE(item.fileName)
  );

  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Rasm o'chirildi");
      },
    });
  };

  return (
    <Image
      key={item.id}
      width={index === 0 ? 208 : 64}
      height={index === 0 ? 208 : 64}
      rootClassName={`${index > 0 ? "!mr-2" : ""}`}
      className="rounded-md"
      preview={{
        mask: (
          <div className="flex">
            <Button className="!p-0 w-7 !text-white hover:!bg-white/20" type="text">
              <Eye className={`${index > 0 ? "size-4" : "size-5"}`} />
            </Button>
            <Popconfirm
              title="Rasm o'chirilsinmi?"
              description={false}
              okText="Ha"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete();
              }}
              onCancel={(e) => {
                e?.stopPropagation();
              }}
              cancelText="Yo'q"
            >
              <Button
                className="!p-0 w-7 !text-white active:!bg-white/30 hover:!bg-white/20"
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {mutation.isPending ? (
                  <LoaderCircle
                    className={`${
                      index > 0 ? "size-4 animate-spin" : "size-5 animate-spin"
                    }`}
                  />
                ) : (
                  <Trash className={`${index > 0 ? "size-4" : "size-5"}`} />
                )}
              </Button>
            </Popconfirm>
          </div>
        ),
      }}
      src={
        item.relativePath
          ? `${import.meta.env.VITE_API_BASE_URL_PATH}${item.relativePath}`
          : ""
      }
    />
  );
};





