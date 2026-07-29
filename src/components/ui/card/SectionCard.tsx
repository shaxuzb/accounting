import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Card from "./Card";

interface SectionCardProps {
  /** i18n kalit yoki tayyor matn */
  title?: string;
  description?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Hujjat va forma bo'limlari uchun sarlavhali karta.
 * Buxgalter uchun har bir blok nima ekani sarlavha bilan ajratilgan bo'ladi.
 */
export default function SectionCard({
  title,
  description,
  icon,
  extra,
  children,
  className = "",
  bodyClassName = "",
}: SectionCardProps) {
  const { t } = useTranslation();
  const hasHeader = Boolean(title || description || extra || icon);

  return (
    <Card className={`border border-border ${className}`}>
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="shrink-0 text-primary">{icon}</span>}
            <div className="min-w-0">
              {title && (
                <div className="truncate text-sm font-semibold text-text">
                  {t(title, { defaultValue: title })}
                </div>
              )}
              {description && (
                <div className="mt-0.5 text-xs text-secondary-text">
                  {t(description, { defaultValue: description })}
                </div>
              )}
            </div>
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </Card>
  );
}
