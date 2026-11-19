import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { organizationService } from "@/modules/settings/pages/organizations/api";
import {
  isLookupResponseForIdentifier,
  resolveTaxpayerAccounts,
  taxpayerLookupService,
  TaxpayerAccountsPicker,
} from "@/modules/settings/shared/taxpayerLookup";
import type { ResolvedBankAccount } from "@/modules/settings/shared/taxpayerLookup";
import { orgBankAccountsService } from "../api";

interface OrgBankAccountsFromInnModalProps {
  open: boolean;
  onClose: () => void;
  /** Account numbers the organization already has: they are not offered again. */
  existingNumbers: string[];
}

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; accounts: ResolvedBankAccount[]; known: number };

/**
 * The organization's own bank accounts from the tax data by its INN: the bank and branch by MFO,
 * the currency by the account number. The ticked ones are added as its bank accounts.
 */
export default function OrgBankAccountsFromInnModal({
  open,
  onClose,
  existingNumbers,
}: OrgBankAccountsFromInnModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // the parent mounts the window anew each time it opens: the state starts empty
    let cancelled = false;
    (async () => {
      try {
        const organization = await organizationService.detail(organizationId);
        const inn = organization.inn?.trim();
        if (!inn) throw new Error(t("settings.lookup.orgNoInn"));
        const taxpayer = await taxpayerLookupService.lookup(inn);
        if (!isLookupResponseForIdentifier(inn, taxpayer))
          throw new Error(t("settings.lookup.mismatch"));
        const all = await resolveTaxpayerAccounts(taxpayer);
        const accounts = all.filter(
          (account) => !existingNumbers.includes(account.accountNumber),
        );
        if (cancelled) return;
        setState({ kind: "ready", accounts, known: all.length - accounts.length });
        setSelected(
          accounts
            .filter((account) => account.isResolved)
            .map((account) => account.accountNumber),
        );
      } catch (err: unknown) {
        if (cancelled) return;
        setState({
          kind: "error",
          message:
            err instanceof Error && !("response" in err)
              ? err.message
              : t("settings.lookup.orgAccountsFailed"),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // the accounts are looked up once, when the window is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (state.kind !== "ready") return;
    const accounts = state.accounts.filter(
      (account) =>
        account.isResolved && selected.includes(account.accountNumber),
    );
    setSaving(true);
    let saved = 0;
    for (const account of accounts) {
      try {
        await orgBankAccountsService.create({
          organizationId,
          bankId: account.bankId!,
          bankBranchId: account.bankBranchId,
          accountNumber: account.accountNumber,
          currencyId: account.currencyId!,
          isMain: account.isMain,
        });
        saved += 1;
      } catch (err: unknown) {
        toast.error(
          t("settings.lookup.accountsFailed", { account: account.accountNumber }),
        );
        errorHandlers(err);
      }
    }
    setSaving(false);
    if (saved > 0) {
      toast.success(t("settings.lookup.accountsSaved", { count: saved }));
      await queryClient.invalidateQueries();
    }
    onClose();
  };

  const accounts = state.kind === "ready" ? state.accounts : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("settings.lookup.orgAccountsTitle")}
      width={640}
      okText={t("common.add")}
      cancelText={t("common.cancel")}
      okButtonProps={{ disabled: selected.length === 0, loading: saving }}
      onOk={handleSave}
    >
      {state.kind === "loading" && (
        <div className="py-8 text-center">
          <Spin />
          <div className="mt-2 text-gray-500">
            {t("settings.lookup.orgAccountsLoading")}
          </div>
        </div>
      )}
      {state.kind === "error" && (
        <Alert type="warning" showIcon message={state.message} />
      )}
      {state.kind === "ready" && accounts.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={
            state.known > 0
              ? t("settings.lookup.orgAccountsAllAdded")
              : t("settings.lookup.orgAccountsNone")
          }
        />
      )}
      <TaxpayerAccountsPicker
        accounts={accounts}
        selected={selected}
        onChange={setSelected}
      />
    </Modal>
  );
}
