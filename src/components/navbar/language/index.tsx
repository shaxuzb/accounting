import React, { useRef, useState } from "react";
import { Popover, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { UzbFlagIcon } from "@/components/widget/customicons/UzbFlagIcon";
import { RusFlagIcon } from "@/components/widget/customicons/RusFlagIcon";
import { EngFlagIcon } from "@/components/widget/customicons/EngFlagIcon";
import { setLang, type Lang } from "@/store/features/langSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const flagFor = (lang: Lang, className: string) =>
  lang === "uz" ? (
    <UzbFlagIcon className={className} />
  ) : lang === "ru" ? (
    <RusFlagIcon className={className} />
  ) : (
    <EngFlagIcon className={className} />
  );

export const LanguageListContent: React.FC<{ onSelect?: () => void }> = ({
  onSelect,
}) => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.lang.lang);
  const { i18n, t } = useTranslation();

  const languages: { key: Lang; label: string }[] = [
    { key: "uz", label: t("profile.languages.uz") },
    { key: "ru", label: t("profile.languages.ru") },
    { key: "en", label: t("profile.languages.en") },
  ];

  const handleChangeLanguage = async (value: Lang) => {
    dispatch(setLang(value));
    await i18n.changeLanguage(value);
    onSelect?.();
  };

  return (
    <div className="min-w-40 rounded-lg bg-primary-bg p-1">
      {languages.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => void handleChangeLanguage(item.key)}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
            lang === item.key
              ? "bg-secondary text-foreground font-semibold"
              : "hover:bg-surface-hover text-text"
          }`}
        >
          {flagFor(item.key, "h-5 w-5")}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

/** Headerdagi til almashtirgich. Ilgari profil popoveri ichida edi. */
const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const lang = useAppSelector((state) => state.lang.lang);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={triggerRef}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        placement="bottomRight"
        arrow={false}
        destroyOnHidden
        content={<LanguageListContent onSelect={() => setOpen(false)} />}
        styles={{ content: { padding: 0 } }}
      >
        <Tooltip title={t("profile.language")}>
          <button
            type="button"
            aria-label={t("profile.language")}
            className="hover:bg-surface-hover flex size-9 cursor-pointer items-center justify-center rounded-lg border border-transparent transition-colors"
          >
            {flagFor(lang, "h-5 w-5")}
          </button>
        </Tooltip>
      </Popover>
    </div>
  );
};

export default LanguageSwitcher;
