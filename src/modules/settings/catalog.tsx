import { useMemo } from "react";
import {
  Building2,
  Handshake,
  Landmark,
  LayoutGrid,
  PlugZap,
  ReceiptText,
  Scale,
  ShieldCheck,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { menuPermissions } from "@/app/config/menuPermissions";
import { useAppSelector } from "@/store/hooks";
import type { MenuRole } from "@/shared/types";

export const SETTINGS_BASE = "/main/settings";

type Tone = "blue" | "emerald" | "rose" | "orange" | "amber" | "violet" | "sky" | "teal" | "indigo" | "slate";

/** Full class strings, so Tailwind sees every one of them. */
export const toneClasses: Record<Tone, { card: string; icon: string; accent: string; arrow: string }> = {
  blue: {
    card: "bg-blue-50/70 border-blue-100 hover:border-blue-300 dark:bg-blue-500/10 dark:border-blue-400/20 dark:hover:border-blue-400/50",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    accent: "text-blue-600 dark:text-blue-300",
    arrow: "text-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:text-blue-300",
  },
  emerald: {
    card: "bg-emerald-50/70 border-emerald-100 hover:border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-400/20 dark:hover:border-emerald-400/50",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    accent: "text-emerald-600 dark:text-emerald-300",
    arrow: "text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:text-emerald-300",
  },
  rose: {
    card: "bg-rose-50/70 border-rose-100 hover:border-rose-300 dark:bg-rose-500/10 dark:border-rose-400/20 dark:hover:border-rose-400/50",
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
    accent: "text-rose-600 dark:text-rose-300",
    arrow: "text-rose-600 group-hover:bg-rose-600 group-hover:text-white dark:text-rose-300",
  },
  orange: {
    card: "bg-orange-50/70 border-orange-100 hover:border-orange-300 dark:bg-orange-500/10 dark:border-orange-400/20 dark:hover:border-orange-400/50",
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
    accent: "text-orange-600 dark:text-orange-300",
    arrow: "text-orange-600 group-hover:bg-orange-600 group-hover:text-white dark:text-orange-300",
  },
  amber: {
    card: "bg-amber-50/70 border-amber-100 hover:border-amber-300 dark:bg-amber-500/10 dark:border-amber-400/20 dark:hover:border-amber-400/50",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
    accent: "text-amber-600 dark:text-amber-300",
    arrow: "text-amber-600 group-hover:bg-amber-600 group-hover:text-white dark:text-amber-300",
  },
  violet: {
    card: "bg-violet-50/70 border-violet-100 hover:border-violet-300 dark:bg-violet-500/10 dark:border-violet-400/20 dark:hover:border-violet-400/50",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
    accent: "text-violet-600 dark:text-violet-300",
    arrow: "text-violet-600 group-hover:bg-violet-600 group-hover:text-white dark:text-violet-300",
  },
  sky: {
    card: "bg-sky-50/70 border-sky-100 hover:border-sky-300 dark:bg-sky-500/10 dark:border-sky-400/20 dark:hover:border-sky-400/50",
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
    accent: "text-sky-600 dark:text-sky-300",
    arrow: "text-sky-600 group-hover:bg-sky-600 group-hover:text-white dark:text-sky-300",
  },
  teal: {
    card: "bg-teal-50/70 border-teal-100 hover:border-teal-300 dark:bg-teal-500/10 dark:border-teal-400/20 dark:hover:border-teal-400/50",
    icon: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300",
    accent: "text-teal-600 dark:text-teal-300",
    arrow: "text-teal-600 group-hover:bg-teal-600 group-hover:text-white dark:text-teal-300",
  },
  indigo: {
    card: "bg-indigo-50/70 border-indigo-100 hover:border-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-400/20 dark:hover:border-indigo-400/50",
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
    accent: "text-indigo-600 dark:text-indigo-300",
    arrow: "text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:text-indigo-300",
  },
  slate: {
    card: "bg-slate-50/70 border-slate-200 hover:border-slate-300 dark:bg-slate-500/10 dark:border-slate-400/20 dark:hover:border-slate-400/50",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
    accent: "text-slate-600 dark:text-slate-300",
    arrow: "text-slate-600 group-hover:bg-slate-600 group-hover:text-white dark:text-slate-300",
  },
};

interface SettingsGroupDefinition {
  key: string;
  icon: LucideIcon;
  tone: Tone;
  /** Section paths in the order they are shown. */
  paths: string[];
}

/** The settings sections grouped by subject, the way 1C groups its «Администрирование» and «Справочники». */
export const settingsGroupDefinitions: SettingsGroupDefinition[] = [
  { key: "organization", icon: Building2, tone: "blue", paths: ["organizations", "branches", "departments", "positions"] },
  { key: "access", icon: ShieldCheck, tone: "emerald", paths: ["users", "role"] },
  {
    key: "accounting",
    icon: ReceiptText,
    tone: "rose",
    paths: [
      "accounting-policy",
      "chart-accounts",
      "document-account-settings",
      "product-accounts",
      "fa-groups",
      "regulated-obligation-settings",
      "document-numbers",
    ],
  },
  { key: "opening", icon: Scale, tone: "orange", paths: ["opening-balances", "opening-inventory", "opening-assets"] },
  {
    key: "finance",
    icon: Landmark,
    tone: "amber",
    paths: ["banks", "org-bank-accounts", "counterparty-bank-accounts", "cash-boxes", "fiscal-cash-registers"],
  },
  {
    key: "partners",
    icon: Handshake,
    tone: "violet",
    paths: ["counterparty", "counterparty-contacts", "contract-templates", "contract-responsible-persons"],
  },
  {
    key: "trade",
    icon: Warehouse,
    tone: "sky",
    paths: ["warehouses", "product-groups", "units", "pricing-conditions", "sale-conditions"],
  },
  { key: "payroll", icon: Wallet, tone: "teal", paths: ["payroll-components", "payroll-taxes"] },
  { key: "integrations", icon: PlugZap, tone: "indigo", paths: ["integrations"] },
];

/** A section the menu has but no group lists still shows up, under «Boshqa». */
const otherGroup: SettingsGroupDefinition = { key: "other", icon: LayoutGrid, tone: "slate", paths: [] };

export const groupKeyByPath = new Map(
  settingsGroupDefinitions.flatMap((group) => group.paths.map((path) => [path, group.key] as const)),
);

export interface SettingsSection {
  path: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  groupKey: string;
}

export interface SettingsGroup extends SettingsGroupDefinition {
  title: string;
  description: string;
  sections: SettingsSection[];
}

const groupTitle = (key: string) => `settings.groups.${key}.title`;
const groupDescription = (key: string) => `settings.groups.${key}.description`;

const isAllowed = (item: MenuRole, permissions: string[]) =>
  permissions.includes(item.code) || (item.filterCode ? permissions.includes(item.filterCode) : false);

/** The sections the user may open, grouped; empty groups are left out. */
export function useSettingsCatalog() {
  const user = useAppSelector((state) => state.auth.user);

  return useMemo(() => {
    const permissions = user?.user.permissions ?? [];
    const byPath = new Map<string, SettingsSection>();
    for (const item of menuPermissions.SETTINGS) {
      const path = item.linkData.path;
      if (byPath.has(path) || !isAllowed(item, permissions)) continue;
      byPath.set(path, {
        path,
        title: item.linkData.title ?? "",
        description: item.linkData.description,
        icon: item.iconName,
        groupKey: groupKeyByPath.get(path) ?? otherGroup.key,
      });
    }

    const leftover = [...byPath.values()].filter((section) => section.groupKey === otherGroup.key);
    const groups: SettingsGroup[] = [...settingsGroupDefinitions, { ...otherGroup, paths: leftover.map((s) => s.path) }]
      .map((group) => ({
        ...group,
        title: groupTitle(group.key),
        description: groupDescription(group.key),
        sections: group.paths.map((path) => byPath.get(path)).filter((s): s is SettingsSection => Boolean(s)),
      }))
      .filter((group) => group.sections.length > 0);

    const sections = groups.flatMap((group) => group.sections);
    return {
      groups,
      sections,
      group: (key?: string) => groups.find((group) => group.key === key),
      section: (path?: string) => sections.find((section) => section.path === path),
    };
  }, [user]);
}

/** Recently opened sections, kept per user in the browser; it may be unavailable, then the list is empty. */
const recentKey = (userId: number | string) => `settings-recent:${userId}`;

export function readRecentSections(userId: number | string): string[] {
  try {
    const raw = localStorage.getItem(recentKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function rememberSection(userId: number | string, path: string) {
  try {
    const next = [path, ...readRecentSections(userId).filter((value) => value !== path)].slice(0, 8);
    localStorage.setItem(recentKey(userId), JSON.stringify(next));
  } catch {
    // storage unavailable: nothing to remember
  }
}

export const DEFAULT_QUICK_SECTIONS = [
  "organizations",
  "accounting-policy",
  "chart-accounts",
  "org-bank-accounts",
  "warehouses",
  "users",
  "opening-balances",
  "integrations",
];
