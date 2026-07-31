import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Spin as AntdSpin } from "antd";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import PermissionCard from "@/components/ui/card/PermissionCard";
import OpeningInventoryHeader from "../components/OpeningInventoryHeader";
import OpeningInventoryLinesSection from "../components/OpeningInventoryLinesSection";
import OpeningInventoryMarkingModal from "../components/OpeningInventoryMarkingModal";
import OpeningInventoryLineAccountsModal, {
  type OpeningInventoryLineAccountValues,
} from "../components/OpeningInventoryLineAccountsModal";
import { useCreateOpeningInventory } from "../hooks/useCreateOpeningInventory";
import { useUpdateOpeningInventory } from "../hooks/useUpdateOpeningInventory";
import { useGetOpeningInventoryDetail } from "../hooks/useGetOpeningInventoryDetail";
import { useOpeningInventoryOptions } from "../hooks/useOpeningInventoryOptions";
import { useOpeningInventoryAccountDefaults } from "../hooks/useOpeningInventoryAccountDefaults";
import { useOpeningInventoryColumns } from "../hooks/useOpeningInventoryColumns";
import {
  openingInventorySchema,
  isCompleteOpeningInventoryLineWithAccounts,
} from "../types/schema";
import type { OpeningInventoryForm } from "../types/form";
import type {
  OpeningInventoryMode,
  OpeningInventoryRow,
} from "../types/type";
import {
  createEmptyRow,
  ensureStableRowKeys,
  getDefaultOpeningInventoryHeader,
  getDuplicateMarkingNumber,
  getOpeningInventoryTotals,
  getProductPrice,
  getProductMxik,
  getOpeningInventoryModeFromDetail,
  getUnmarkedPieceTrackedRow,
  isEmptyOpeningInventoryRow,
  mapDetailLinesToRows,
  toCreatePayload,
  toMarkingNumbers,
  toUpdatePayload,
} from "../utils/openingInventory";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { openingInventoryPermissions } from "../constants/permissions";

export default function OpeningInventoryEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreate = !id;
  const [openingInventoryMode, setOpeningInventoryMode] =
    useState<OpeningInventoryMode>("goods");

  const [markingModalIndex, setMarkingModalIndex] = useState<number | null>(
    null,
  );
  const [markingInput, setMarkingInput] = useState("");
  const [accountModalIndex, setAccountModalIndex] = useState<number | null>(
    null,
  );
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: detail, isLoading: isDetailLoading } =
    useGetOpeningInventoryDetail(id);
  const detailMode = getOpeningInventoryModeFromDetail(detail);
  const mode = isCreate ? openingInventoryMode : detailMode;
  const createMutation = useCreateOpeningInventory();
  const updateMutation = useUpdateOpeningInventory();

  const {
    itemOptions,
    productByMxik,
    unitOptions,
    vatRateOptions,
    isLoading: isOptionsLoading,
  } = useOpeningInventoryOptions(mode);

  const { defaultAccounts, isLoading: isDefaultsLoading } =
    useOpeningInventoryAccountDefaults(mode);

  const initialValues = useMemo<OpeningInventoryForm>(() => {
    if (!isCreate && detail) {
      return {
        docDate: detail.docDate,
        counterpartyId: detail.counterpartyId,
        currencyId: detail.currencyId ?? 1,
        contractId: detail.contractId,
        warehouseId: detail.warehouseId,
        comment: detail.comment || "",
        lines: ensureStableRowKeys(
          mapDetailLinesToRows(
            detail.serviceLines?.length ? detail.serviceLines : detail.lines,
            detail.counterpartyId,
            detailMode,
          ),
        ),
      };
    }
    return {
      ...getDefaultOpeningInventoryHeader(),
      lines: [
        createEmptyRow({
          indexId: 1,
          counterpartyId: null,
          mode: "goods",
        }),
      ],
    };
  }, [detail, detailMode, isCreate]);

  const handleBack = useCallback(() => {
    navigate("..");
  }, [navigate]);

  const persistOpeningInventory = useCallback(
    async (values: OpeningInventoryForm) => {
      const completedRows = values.lines.filter(
        isCompleteOpeningInventoryLineWithAccounts,
      );

      if (completedRows.length === 0) {
        toast.error(
          `Kamida bitta to'ldirilgan ${mode === "services" ? "xizmat" : "tovar"} qatori bo'lishi shart!`,
        );
        return;
      }

      if (completedRows.length < values.lines.length) {
        toast.error(
          "Iltimos, barcha qatorlardagi hisobvaraqlar va narxlarni to'ldiring!",
        );
        return;
      }

      const unmarkedRow = getUnmarkedPieceTrackedRow(completedRows, mode);
      if (unmarkedRow) {
        toast.error(
          `"${unmarkedRow.productName || unmarkedRow.product}" mahsuloti markirovkali, lekin markirovka kiritilmagan!`,
        );
        return;
      }

      const duplicateMarking = getDuplicateMarkingNumber(completedRows);
      if (duplicateMarking) {
        toast.error(
          `"${duplicateMarking}" markirovka kodi takroriy kiritilgan!`,
        );
        return;
      }

      try {
        if (isCreate) {
          const payload = toCreatePayload(values, completedRows, mode);
          await createMutation.mutateAsync(payload);
          toast.success("Hujjat muvaffaqiyatli saqlandi");
        } else {
          const payload = toUpdatePayload(values, completedRows, mode);
          await updateMutation.mutateAsync({ id: id!, payload });
          toast.success("Hujjat muvaffaqiyatli yangilandi");
        }
        handleBack();
      } catch (error) {
        errorHandlers(error);
      }
    },
    [isCreate, createMutation, updateMutation, id, handleBack, mode],
  );

  const formik = useFormik<OpeningInventoryForm>({
    initialValues,
    validationSchema: openingInventorySchema,
    enableReinitialize: true,
    onSubmit: persistOpeningInventory,
  });

  const lines = formik.values.lines;

  const modeDisabled =
    !isCreate || lines.some((line) => !isEmptyOpeningInventoryRow(line));

  const handleModeChange = useCallback(
    (nextMode: OpeningInventoryMode) => {
      if (!isCreate || modeDisabled || nextMode === mode) return;

      setOpeningInventoryMode(nextMode);
      formik.setFieldValue(
        "lines",
        [
          createEmptyRow({
            indexId: 1,
            counterpartyId: formik.values.counterpartyId,
            mode: nextMode,
          }),
        ],
        false,
      );
    },
    [formik, isCreate, mode, modeDisabled],
  );

  const commitLines = useCallback(
    (updater: (current: OpeningInventoryRow[]) => OpeningInventoryRow[]) => {
      formik.setFieldValue("lines", updater(formik.values.lines), false);
    },
    [formik],
  );

  const totals = useMemo(
    () => getOpeningInventoryTotals(lines, vatRateOptions),
    [lines, vatRateOptions],
  );

  const addManualRow = useCallback(() => {
    commitLines((prev) => {
      const indexId = prev.length + 1;
      const newRow = createEmptyRow({
        indexId,
        counterpartyId: formik.values.counterpartyId,
        mode,
      });

      const initializedRow = {
        ...newRow,
        debitAccountId: defaultAccounts.debitAccountId,
        debitAccountName: defaultAccounts.debitAccountName,
      };

      return ensureStableRowKeys([...prev, initializedRow]);
    });
  }, [commitLines, defaultAccounts, formik.values.counterpartyId, mode]);

  const deleteRow = useCallback((rowIndex: number) => {
    commitLines((prev) => {
      const next = prev.filter((_, idx) => idx !== rowIndex);
      return ensureStableRowKeys(
        next.length
          ? next
          : [
              createEmptyRow({
                indexId: 1,
                counterpartyId: formik.values.counterpartyId,
                mode,
              }),
            ],
      );
    });
  }, [commitLines, formik.values.counterpartyId, mode]);

  const handleRowValueChange = useCallback(
    (rowIndex: number, patch: Partial<OpeningInventoryRow>) => {
      commitLines((prev) => {
        const next = prev.map((row, idx) =>
          idx === rowIndex ? { ...row, ...patch } : row,
        );
        return ensureStableRowKeys(next);
      });
    },
    [commitLines],
  );

  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const selectedItem = itemOptions.find((item) => item.id === value);
      if (!selectedItem) return;
      if (
        lines.some(
          (row, index) => index !== rowIndex && row.productId === value,
        )
      ) {
        toast.error("Bir xil productni ikki marta tanlab bo'lmaydi");
        return;
      }

      const defaultUnitId = selectedItem.unitId;
      const defaultUnitCode =
        selectedItem.unitCode ?? selectedItem.unit ?? null;
      const defaultUnitName =
        selectedItem.unitName ?? selectedItem.unit ?? null;
      const defaultPrice = getProductPrice(selectedItem);
      const isPieceTracked =
        mode === "goods" && Boolean(selectedItem.isPieceTracked);

      handleRowValueChange(rowIndex, {
        productId: selectedItem.id,
        productName: selectedItem.name,
        product: selectedItem.name,
        mxik: getProductMxik(selectedItem),
        unitId: defaultUnitId,
        unitCode: defaultUnitCode,
        unitName: defaultUnitName,
        price: defaultPrice,
        pricePerUom: defaultPrice,
        isPieceTracked,
        isService: mode === "services",
        qty: isPieceTracked ? 0 : 1,
        markingNumber: "",
        markingNumbers: [],
      });
    },
    [handleRowValueChange, itemOptions, lines, mode],
  );

  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const row = lines[rowIndex];
      if (!row) return;

      if (dataIndex === "mxik") {
        const mxik = rawValue.trim();
        const patch: Partial<OpeningInventoryRow> = { mxik };

        const matchedProduct = productByMxik.get(mxik);
        if (matchedProduct) {
          if (
            lines.some(
              (item, index) =>
                index !== rowIndex && item.productId === matchedProduct.id,
            )
          ) {
            toast.error("Bir xil productni ikki marta tanlab bo'lmaydi");
            return;
          }
          const defaultUnitId = matchedProduct.unitId;
          const defaultUnitCode =
            matchedProduct.unitCode ?? matchedProduct.unit ?? null;
          const defaultUnitName =
            matchedProduct.unitName ?? matchedProduct.unit ?? null;
          const defaultPrice = getProductPrice(matchedProduct);
          const isPieceTracked =
            mode === "goods" && Boolean(matchedProduct.isPieceTracked);

          Object.assign(patch, {
            productId: matchedProduct.id,
            productName: matchedProduct.name,
            product: matchedProduct.name,
            unitId: defaultUnitId,
            unitCode: defaultUnitCode,
            unitName: defaultUnitName,
            price: defaultPrice,
            pricePerUom: defaultPrice,
            isPieceTracked,
            qty: isPieceTracked ? 0 : 1,
            markingNumber: "",
            markingNumbers: [],
          } satisfies Partial<OpeningInventoryRow>);
        }

        handleRowValueChange(rowIndex, patch);
        return;
      }

      if (dataIndex === "qty" || dataIndex === "price") {
        const numberValue = Number(rawValue);
        const patchValue = Number.isFinite(numberValue) ? numberValue : null;
        handleRowValueChange(rowIndex, { [dataIndex]: patchValue });
        return;
      }

      handleRowValueChange(rowIndex, { [dataIndex]: rawValue });
    },
    [handleRowValueChange, lines, mode, productByMxik],
  );

  const handleCommentChange = useCallback(
    (value: string) => {
      formik.setFieldValue("comment", value, false);
    },
    [formik],
  );

  // Marking modal handlers
  const openMarkingModal = useCallback((rowIndex: number) => {
    if (mode !== "goods") return;
    setMarkingModalIndex(rowIndex);
    setMarkingInput("");
  }, [mode]);

  const handleMarkingInputChange = useCallback((value: string) => {
    setMarkingInput(value);
  }, []);

  const handleMarkingPaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");
      const parsed = pastedText
        .split(/[\r\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (markingModalIndex === null) return;
      const row = lines[markingModalIndex];
      if (!row) return;

      const currentMarkings = toMarkingNumbers(row);
      const uniqueNew = parsed.filter(
        (item) => !currentMarkings.includes(item),
      );
      const nextMarkings = [...currentMarkings, ...uniqueNew];

      commitLines((prev) =>
        prev.map((r, idx) =>
          idx === markingModalIndex
            ? {
                ...r,
                markingNumber: nextMarkings.join("\n"),
                markingNumbers: nextMarkings,
                qty: nextMarkings.length,
              }
            : r,
        ),
      );
    },
    [commitLines, markingModalIndex, lines],
  );

  const handleAddMarking = useCallback(() => {
    const value = markingInput.trim();
    if (!value || markingModalIndex === null) return;

    const row = lines[markingModalIndex];
    if (!row) return;

    const currentMarkings = toMarkingNumbers(row);
    if (currentMarkings.includes(value)) {
      toast.error("Ushbu markirovka allaqachon kiritilgan!");
      return;
    }

    const nextMarkings = [...currentMarkings, value];
    commitLines((prev) =>
      prev.map((r, idx) =>
        idx === markingModalIndex
          ? {
              ...r,
              markingNumber: nextMarkings.join("\n"),
              markingNumbers: nextMarkings,
              qty: nextMarkings.length,
            }
          : r,
      ),
    );
    setMarkingInput("");
  }, [commitLines, markingInput, markingModalIndex, lines]);

  const handleRemoveMarking = useCallback(
    (marking: string) => {
      if (markingModalIndex === null) return;
      const row = lines[markingModalIndex];
      if (!row) return;

      const currentMarkings = toMarkingNumbers(row);
      const nextMarkings = currentMarkings.filter((item) => item !== marking);

      commitLines((prev) =>
        prev.map((r, idx) =>
          idx === markingModalIndex
            ? {
                ...r,
                markingNumber: nextMarkings.join("\n"),
                markingNumbers: nextMarkings,
                qty: nextMarkings.length,
              }
            : r,
        ),
      );
    },
    [commitLines, markingModalIndex, lines],
  );

  // Account modal handlers
  const openAccountModal = useCallback((rowIndex: number) => {
    setAccountModalIndex(rowIndex);
  }, []);

  const handleApplyAccounts = useCallback(
    (values: OpeningInventoryLineAccountValues, applyToAll: boolean) => {
      commitLines((prev) =>
        prev.map((row, idx) => {
          if (applyToAll || idx === accountModalIndex) {
            return {
              ...row,
              debitAccountId: values.debitAccountId,
              debitAccountName: values.debitAccountName,
            };
          }
          return row;
        }),
      );
      setAccountModalIndex(null);
    },
    [accountModalIndex, commitLines],
  );

  const activeMarkingRow =
    markingModalIndex !== null ? lines[markingModalIndex] : null;
  const activeAccountRow =
    accountModalIndex !== null ? lines[accountModalIndex] : null;

  const columns = useOpeningInventoryColumns({
    handleCellCommit,
    handleDeleteRow: deleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading: isOptionsLoading,
    itemOptions,
    mode,
    rows: lines,
    openMarkingModal,
    openAccountModal,
    unitOptions,
    vatRateOptions,
  });

  const pageLoading =
    isDetailLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    isDefaultsLoading;

  return (
    <PermissionCard permission={openingInventoryPermissions.view}>
      <Form onFinish={formik.handleSubmit} layout="vertical">
        <AntdSpin spinning={pageLoading}>
          <div className="flex flex-col gap-3">
            <OpeningInventoryHeader
              formik={formik}
              mode={mode}
            />

            <OpeningInventoryLinesSection
              columns={columns}
              comment={formik.values.comment}
              height={windowHeight}
              isFetching={isOptionsLoading}
              isLoading={pageLoading}
              lines={lines}
              formik={formik}
              mode={mode}
              modeDisabled={modeDisabled}
              onModeChange={handleModeChange}
              onAddManualRow={addManualRow}
              onBack={handleBack}
              onSave={formik.submitForm}
              onCommentChange={handleCommentChange}
              totals={totals}
            />
          </div>
        </AntdSpin>

        <OpeningInventoryMarkingModal
          open={markingModalIndex !== null}
          value={markingInput}
          markings={activeMarkingRow ? toMarkingNumbers(activeMarkingRow) : []}
          onChange={handleMarkingInputChange}
          onPaste={handleMarkingPaste}
          onAdd={handleAddMarking}
          onRemove={handleRemoveMarking}
          onClose={() => setMarkingModalIndex(null)}
        />

        <OpeningInventoryLineAccountsModal
          open={accountModalIndex !== null}
          line={activeAccountRow}
          mode={mode}
          onClose={() => setAccountModalIndex(null)}
          onApply={handleApplyAccounts}
        />
      </Form>
    </PermissionCard>
  );
}
