import { Button, Card, Result, Spin } from "antd";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import ContractActions from "../components/ContractActions";
import ContractReadonlyView from "../components/readonly/ContractReadonlyView";
import {
  useActivateRentalContract,
  useCancelRentalContract,
  useDeleteRentalContract,
  useRentalContract,
} from "../hooks";

export default function ContractDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isError, refetch } = useRentalContract(id);
  const activateMutation = useActivateRentalContract();
  const cancelMutation = useCancelRentalContract();
  const deleteMutation = useDeleteRentalContract();
  const isMutating =
    activateMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const mutate = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refetch();
    } catch (error) {
      errorHandlers(error);
    }
  };

  if (isLoading) return <Spin className="block py-20" />;
  if (isError || !data)
    return <Result status="404" title={t("common.notFound")} />;

  return (
    <div className="w-full min-w-0 space-y-3 px-2 pb-4 sm:px-3">
      <Card className="border-border!" bodyStyle={{ padding: 12 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate("/main/rentals/contracts")}
          >
            {t("common.back")}
          </Button>
          <ContractActions
            statusId={data.statusId}
            permissions={permissions}
            loading={isMutating}
            onEdit={() => navigate(`/main/rentals/contracts/edit/${data.id}`)}
            canActivate={Boolean(
              data.lessorPayableAccountId &&
              data.taxPayableAccountId &&
              data.objects.every((object) => object.expenseAccountId),
            )}
            onActivate={() =>
              mutate(() => activateMutation.mutateAsync(data.id))
            }
            onCancel={() => mutate(() => cancelMutation.mutateAsync(data.id))}
            onDelete={() =>
              void mutate(async () => {
                await deleteMutation.mutateAsync(data.id);
                navigate("/main/rentals/contracts");
              })
            }
          />
        </div>
      </Card>
      <ContractReadonlyView data={data} />
    </div>
  );
}
