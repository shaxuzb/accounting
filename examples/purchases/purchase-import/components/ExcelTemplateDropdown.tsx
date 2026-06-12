import { useState } from "react";
import { Button, Dropdown, type MenuProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { ChevronDown, FileSpreadsheet } from "lucide-react";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints, selectListKeys } from "@/shared/constants";
import { purchaseEndpoint } from "@/modules/purchases/constants/endpoints";
import { handleFileDownload } from "@/shared/utils/helpers/fileDownload";
import { errorHandlers } from "@/shared/utils/helpers/errorHandlers";

interface TemplateType {
  id: number;
  name: string;
  code: string;
}

/**
 * "Excel shablon" dropdown tugmasi.
 * - Shablon turlarini select-list apidan oladi (React Query — keshlanadi).
 * - Tur tanlanganda goods-movements/purchase-import-template?templateCode=...
 *   apidan Excel faylni yuklab beradi.
 */
const ExcelTemplateDropdown = () => {
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery<TemplateType[]>({
    queryKey: ["selectlist", selectListKeys.purchaseImportTemplateType],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get(
        selectListEndpoints.purchaseImportTemplateTypeSelectList,
      );
      return data ?? [];
    },
  });

  const handleDownload = async (template: TemplateType) => {
    try {
      setDownloadingCode(template.code);
      const response: AxiosResponse<Blob> = await $axiosPrivate.get(
        purchaseEndpoint.IMPORT_TEMPLATE,
        {
          params: { templateCode: template.code },
          responseType: "blob",
        },
      );
      handleFileDownload({
        data: response.data,
        type: "excel",
        fileName: template.name,
      });
    } catch (error) {
      errorHandlers(error);
    } finally {
      setDownloadingCode(null);
    }
  };

  const items: MenuProps["items"] = (data ?? []).map((template) => ({
    key: template.code,
    label: template.name,
    icon: <FileSpreadsheet className="size-4 text-emerald-600" />,
  }));

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const template = data?.find((item) => item.code === key);
    if (template) handleDownload(template);
  };

  const loading = isLoading || !!downloadingCode;

  return (
    <Dropdown
      menu={{ items, onClick }}
      trigger={["click"]}
      disabled={loading || items.length === 0}
    >
      <Button
        loading={loading}
        icon={!loading && <FileSpreadsheet className="size-4" />}
      >
        Excel shablon
        <ChevronDown className="size-3.5 opacity-70" />
      </Button>
    </Dropdown>
  );
};

export default ExcelTemplateDropdown;
