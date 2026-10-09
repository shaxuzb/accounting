import type { ManualSection } from "../types";

/**
 * The manual's sections in the order of the app's menu, with every article planned. An
 * article listed here without content (see articles/index.ts) shows as «tez orada».
 */
export const manualSections: ManualSection[] = [
  {
    id: "start",
    title: "Asosiy boshlanish",
    icon: "rocket",
    articles: [
      { id: "start/interface", title: "Tizimga kirish va interfeys" },
      { id: "start/organization", title: "Tashkilot ma'lumotlari" },
      { id: "start/accounting-policy", title: "Hisob siyosati" },
      { id: "start/chart-of-accounts", title: "Hisoblar rejasi" },
      { id: "start/document-accounts", title: "Hujjat hisoblari sozlamasi" },
      { id: "start/opening-balances", title: "Boshlang'ich qoldiqlar" },
    ],
  },
  {
    id: "purchases",
    title: "Xaridlar",
    icon: "cart",
    articles: [
      { id: "purchases/purchase", title: "Sotib olish (tovar va xizmat kirimi)" },
      { id: "purchases/supplier-return", title: "Yetkazib beruvchiga qaytarish" },
      { id: "purchases/extra-costs", title: "Qo'shimcha xarajatlar" },
      { id: "purchases/customs", title: "Bojxona deklaratsiyasi" },
      { id: "purchases/contracts", title: "Shartnomalar" },
    ],
  },
  {
    id: "warehouse",
    title: "Ombor",
    icon: "box",
    articles: [
      { id: "warehouse/products", title: "Tovarlar va xizmatlar" },
      { id: "warehouse/stock", title: "Ombordagi qoldiqlar" },
      { id: "warehouse/transfers", title: "Omborlararo ko'chirish" },
      { id: "warehouse/inventory", title: "Inventarizatsiya" },
      { id: "warehouse/adjustment", title: "Ortiqcha va kamomadni rasmiylashtirish" },
    ],
  },
  {
    id: "sales",
    title: "Sotuv",
    icon: "bag",
    articles: [
      { id: "sales/sale", title: "Sotuv" },
      { id: "sales/retail", title: "Chakana sotuv" },
      { id: "sales/customer-return", title: "Xaridordan qaytarish" },
      { id: "sales/retail-return", title: "Chakana xaridordan qaytarish" },
    ],
  },
  {
    id: "bank",
    title: "Bank",
    icon: "bank",
    articles: [
      { id: "bank/operations", title: "Bank operatsiyalari" },
      { id: "bank/statement-import", title: "Bank ko'chirmasini import qilish" },
      { id: "bank/currency", title: "Valyutadagi to'lovlar va kurs farqi" },
    ],
  },
  {
    id: "cash",
    title: "Kassa",
    icon: "cash",
    articles: [
      { id: "cash/income", title: "Kirim orderi" },
      { id: "cash/expense", title: "Chiqim orderi" },
      { id: "cash/book", title: "Kassa kitobi" },
      { id: "cash/collection", title: "Inkassatsiya" },
      { id: "cash/expense-report", title: "Bo'nak hisoboti" },
      { id: "cash/acceptance-points", title: "To'lov qabul qilish nuqtalari" },
    ],
  },
  {
    id: "accounting",
    title: "Buxgalteriya",
    icon: "book",
    articles: [
      { id: "accounting/journal", title: "Provodkalar jurnali" },
      { id: "accounting/ledger", title: "Bosh kitob va hisob kartochkasi" },
      { id: "accounting/trial-balance", title: "Aylanma-saldo vedomosti" },
      { id: "accounting/manual-entry", title: "Qo'lda provodka" },
      { id: "accounting/deferred-expenses", title: "Kelgusi davr xarajatlari" },
      { id: "accounting/period-close", title: "Oyni yopish" },
      { id: "accounting/revaluation", title: "Valyuta qayta baholash" },
      { id: "accounting/repost", title: "Hujjatlarni qayta o'tkazish" },
    ],
  },
  {
    id: "reports",
    title: "Hisobotlar",
    icon: "chart",
    articles: [
      { id: "reports/sales", title: "Sotuv hisoboti" },
      { id: "reports/purchases", title: "Xarid hisoboti" },
      { id: "reports/settlements", title: "Debitor va kreditor qarzlar" },
      { id: "reports/money", title: "Bank va kassa hisobotlari" },
      { id: "reports/warehouse", title: "Ombor hisobotlari" },
    ],
  },
  {
    id: "fixed-assets",
    title: "Asosiy vositalar",
    icon: "building",
    articles: [
      { id: "fixed-assets/receipt", title: "Asosiy vosita kirimi" },
      { id: "fixed-assets/commissioning", title: "Foydalanishga topshirish" },
      { id: "fixed-assets/depreciation", title: "Amortizatsiya" },
      { id: "fixed-assets/revaluation", title: "Qayta baholash" },
      { id: "fixed-assets/disposal", title: "Hisobdan chiqarish va sotish" },
    ],
  },
  {
    id: "payroll",
    title: "Kadrlar va ish haqi",
    icon: "users",
    articles: [
      { id: "payroll/employees", title: "Xodimlar va buyruqlar" },
      { id: "payroll/timesheet", title: "Tabel" },
      { id: "payroll/calculation", title: "Ish haqi hisoblash" },
      { id: "payroll/payment", title: "Ish haqi to'lash" },
      { id: "payroll/taxes", title: "Soliqlar va komponentlar" },
    ],
  },
  {
    id: "rental",
    title: "Ijara",
    icon: "key",
    articles: [
      { id: "rental/contracts", title: "Ijara shartnomalari" },
      { id: "rental/accruals", title: "Ijara hisoblash" },
    ],
  },
  {
    id: "faq",
    title: "Tez-tez so'raladigan savollar",
    icon: "help",
    articles: [{ id: "faq/general", title: "Umumiy savollar" }],
  },
];
