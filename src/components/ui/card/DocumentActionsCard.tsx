import { useAppSelector } from "@/store/hooks";
import { App, Button } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Card from "./Card";

export interface DocumentAction {
  key: string;
  /** i18n kalit yoki tayyor matn */
  label: string;
  icon?: ReactNode;
  onClick: () => void | Promise<unknown>;
  type?: "primary" | "default" | "dashed" | "text";
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  /** Ko'rsatish uchun kerakli permission kodi */
  permission?: string;
  /** Tugma bosilganda tasdiqlash oynasi chiqadi */
  confirm?: {
    title: string;
    content?: string;
    okText?: string;
    danger?: boolean;
  };
  /** Tugma tagida chiqadigan qisqa tushuntirish */
  hint?: string;
}

interface DocumentActionsCardProps {
  title?: string;
  actions: DocumentAction[];
  footer?: ReactNode;
  className?: string;
}

/**
 * Hujjat sahifalarining o'ng panelidagi amallar bloki.
 * Permission, loading va tasdiqlash dialogini bir joyda boshqaradi.
 */
export default function DocumentActionsCard({
  title = "common.actions",
  actions,
  footer,
  className = "",
}: DocumentActionsCardProps) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const visibleActions = actions.filter(
    (action) =>
      !action.hidden &&
      (!action.permission || permissions.includes(action.permission)),
  );

  if (!visibleActions.length) return null;

  const runAction = (action: DocumentAction) => {
    if (!action.confirm) {
      void action.onClick();
      return;
    }
    modal.confirm({
      title: t(action.confirm.title, { defaultValue: action.confirm.title }),
      content: action.confirm.content
        ? t(action.confirm.content, { defaultValue: action.confirm.content })
        : undefined,
      okText: t(action.confirm.okText ?? "common.submit", {
        defaultValue: action.confirm.okText ?? "common.submit",
      }),
      cancelText: t("common.cancel"),
      okButtonProps: { type: "primary", danger: action.confirm.danger },
      onOk: () => action.onClick(),
    });
  };

  return (
    <Card className={`border border-border ${className}`}>
      <div className="border-b border-border px-4 py-3 text-sm font-semibold text-text">
        {t(title, { defaultValue: title })}
      </div>
      <div className="space-y-2.5 p-4">
        {visibleActions.map((action) => (
          <div key={action.key}>
            <Button
              block
              type={action.type ?? "default"}
              danger={action.danger}
              icon={action.icon}
              loading={action.loading}
              disabled={action.disabled}
              onClick={() => runAction(action)}
              className="h-10!"
            >
              {t(action.label, { defaultValue: action.label })}
            </Button>
            {action.hint && (
              <div className="mt-1 text-center text-xs text-secondary-text">
                {t(action.hint, { defaultValue: action.hint })}
              </div>
            )}
          </div>
        ))}
        {footer}
      </div>
    </Card>
  );
}
