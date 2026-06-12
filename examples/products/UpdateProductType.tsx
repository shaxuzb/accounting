import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants";
import { productsEndpoint } from "@/modules/warehouses/constants/endpoints";
import { $axiosPrivate } from "@/services/AxiosService";
import { Button, Popover, Divider } from "antd";
import { useFormik } from "formik";
import { PackageSearch, Check } from "lucide-react";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

/* =======================
   MODULE LEVEL STATE
======================= */
let activePopoverId: number | null = null;
const listeners = new Set<() => void>();

/* =======================
   CUSTOM HOOK
======================= */
const useActivePopover = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const cb = () => forceUpdate({});
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const setActive = (id: number | null) => {
    activePopoverId = id;
    listeners.forEach((l) => l());
  };

  return {
    activeId: activePopoverId,
    setActive,
  };
};

/* =======================
   COMPONENT
======================= */
interface UpdateProductTypeProps {
  data: { id: number; productTypeId: number };
  refetch: () => void;
}

interface InitialValues {
  productTypeId: number | null;
  id: number | null;
}

const UpdateProductType: FC<UpdateProductTypeProps> = ({ data, refetch }) => {
  const { activeId, setActive } = useActivePopover();
  const open = activeId === data.id;

  const formik = useFormik<InitialValues>({
    initialValues: {
      productTypeId: null,
      id: null,
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await $axiosPrivate.put(productsEndpoint.CHANGEPRODUCTTYPE, values);
        refetch();
        setActive(null);
      } catch {
        toast.error("Hatolik");
      }
    },
  });
  useEffect(() => {
    if (activeId) {
      formik.setValues({
        productTypeId: data.productTypeId,
        id: data.id,
      });
    } else {
      formik.setValues({ productTypeId: null, id: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, data]);
  const content = (
    <form onSubmit={formik.handleSubmit} className="w-56">
      <SelectCustom
        path={selectListEndpoints.producTypeSelectList}
        search
        formik={formik}
        marginBottom="!mb-0"
        fieldName="productTypeId"
      />

      <Divider className="!my-1.5" />

      <Button
        type="primary"
        loading={formik.isSubmitting}
        htmlType="submit"
        block
        icon={<Check size={16} />}
      >
        Saqlash
      </Button>
    </form>
  );

  return (
    <Popover
      trigger="click"
      placement="left"
      open={open}
      content={content}
      onOpenChange={(visible) => {
        setActive(visible ? data.id : null);
      }}
    >
      <Button
        type={open ? "primary" : "text"}
        disabled={activeId !== null && !open}
        className={`!px-2 transition-all ${
          open ? "bg-purple-100 text-purple-700" : ""
        }`}
      >
        <PackageSearch size={16} />
      </Button>
    </Popover>
  );
};

export default UpdateProductType;







