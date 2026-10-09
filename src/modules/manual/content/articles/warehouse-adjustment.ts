import type { ManualArticle } from "../../types";
import { px } from "./px";

const list = px(1568, 240);
const doc = px(1568, 665);
const settle = px(426, 362);

/**
 * «Ortiqcha va kamomadni rasmiylashtirish» (Ombor → Qoldiqni tuzatish; 1C «Оприходование» /
 * «Списание товаров»): stock booked in or written off, and a shortage then charged to loss, an
 * employee or a supplier. It follows InventoryAdjustmentDetailPage, InventoryShortageSettlement,
 * InventoryAdjustmentLifecycleService and InventoryAdjustmentContextBuilder; the example is the
 * demo organization's shortage from its Chilonzor count.
 */
export const adjustmentArticle: ManualArticle = {
  id: "warehouse/adjustment",
  sectionId: "warehouse",
  title: "Ortiqcha va kamomadni rasmiylashtirish",
  summary:
    "Qoldiqni tuzatish hujjati: ortiqcha tovarni kirim qilish, kamomad, buzilgan yoki yo'qolgan tovarni hisobdan chiqarish va kamomadni zarar yoki aybdorga o'tkazish.",
  routes: ["/main/warehouses/inventory-adjustments"],
  screenshots: [
    {
      src: "/manual/warehouse/adjustment-list.jpg",
      alt: "Qoldiqni tuzatish ro'yxati",
      caption: "Ombor → Qoldiqni tuzatish. Inventarizatsiya yaratgan tuzatishlar ham shu yerda.",
      width: 1568,
      height: 240,
      markers: [
        list(1, 1430, 96, [1430, 96, 1521, 121]),
        list(2, 925, 146, [830, 165, 980, 232]),
        list(3, 1040, 146, [982, 165, 1265, 232]),
        list(4, 1300, 146, [1267, 165, 1433, 232]),
        list(5, 1540, 146, [1435, 165, 1540, 232]),
      ],
    },
    {
      src: "/manual/warehouse/adjustment-shortage.jpg",
      alt: "Kamomad hujjati",
      caption: "O'tkazilgan kamomad: o'ng tomonda «Kamomad (5910)» kartasi.",
      width: 1568,
      height: 665,
      markers: [
        doc(6, 661, 188, [293, 188, 669, 216]),
        doc(7, 1088, 188, [733, 188, 1096, 216]),
        doc(8, 661, 259, [256, 273, 669, 300]),
        doc(9, 1088, 314, [289, 314, 1096, 344]),
        doc(10, 799, 497, [270, 508, 807, 536]),
        doc(11, 1074, 490, [858, 490, 1082, 520]),
        doc(12, 523, 554, [320, 554, 531, 584]),
        doc(13, 300, 603, [270, 615, 338, 634]),
        doc(14, 470, 603, [438, 615, 648, 634]),
        doc(15, 1542, 213, [1135, 213, 1542, 275]),
        doc(16, 1542, 286, [1135, 286, 1542, 336]),
        doc(17, 1540, 383, [1123, 365, 1555, 507]),
        doc(18, 1542, 468, [1135, 468, 1542, 494]),
        doc(19, 1555, 520, [1123, 520, 1555, 546]),
      ],
    },
    {
      src: "/manual/warehouse/shortage-settle.jpg",
      alt: "Kamomadni yopish oynasi",
      caption: "«Kamomadni yopish»: kamomad kimning hisobiga o'tishini tanlash.",
      width: 426,
      height: 362,
      markers: [
        settle(20, 334, 163, [19, 154, 324, 208]),
        settle(21, 407, 210, [119, 210, 407, 239]),
        settle(22, 407, 279, [19, 279, 407, 309]),
        settle(23, 268, 333, [276, 320, 407, 346]),
      ],
    },
  ],
  purpose:
    "Ombor qoldig'ini hujjat bilan o'zgartirish: topilgan (ortiqcha) tovarni kirim qilish yoki kamomad, buzilgan, yo'qolgan tovarni hisobdan chiqarish. Kamomad keyin zararga, aybdor xodimga yoki yetkazib beruvchiga o'tkaziladi.",
  why:
    "Qoldiq faqat hujjat orqali o'zgaradi: ombor va buxgalteriya (2910) doim mos bo'ladi, har bir hisobdan chiqarishning sababi va summasi qayd etiladi.",
  prerequisites: [
    { title: "Hujjat hisoblari sozlamasida ortiqcha (9390) va kamomad (5910) hisoblari", articleId: "start/document-accounts" },
    { title: "Omborda faol inventarizatsiya yo'q", articleId: "warehouse/inventory" },
  ],
  related: {
    center: "Qoldiqni tuzatish",
    items: [
      { title: "Inventarizatsiya", articleId: "warehouse/inventory" },
      { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
      { title: "Qo'lda provodka", articleId: "accounting/manual-entry" },
    ],
  },
  steps: [
    {
      title: "Tur va omborni tanlang",
      text: "«Qo'shish» → sana, ombor va tuzatish turi (Ortdi, Topilgan — kirim; Kamaydi, Hisobdan chiqarish, Buzilgan, Yo'qolgan — chiqim).",
    },
    {
      title: "Tovarlarni kiriting",
      text: "Har qatorda tovar va miqdor. Kirimda narxni yozing yoki bo'sh qoldiring — oxirgi kirim narxi olinadi.",
    },
    {
      title: "Tasdiqlang",
      text: "«Tasdiqlash» — qoldiq o'zgaradi, provodka yoziladi.",
    },
    {
      title: "Kamomadni yoping",
      text: "Kamomad 5910 da turadi: «Kamomadni yopish» bilan zararga, xodimga yoki yetkazib beruvchiga o'tkazing.",
    },
  ],
  fieldGroups: [
    {
      title: "Ro'yxat",
      fields: [
        { n: 1, name: "Qo'shish", enter: "Yangi tuzatish hujjatini ochadi." },
        {
          n: 2,
          name: "Tuzatish turi",
          enter: "Turning nomi: yashil — kirim (Ortdi, Topilgan, Tuzatish), qizil — chiqim (Kamaydi, Hisobdan chiqarish, Buzilgan, Yo'qolgan).",
        },
        { n: 3, name: "Izoh", enter: "Inventarizatsiya yaratgan hujjatda «Inventarizatsiya №… natijasi»." },
        { n: 4, name: "Holati", enter: "Qoralama, O'tkazilgan yoki Bekor qilingan." },
        { n: 5, name: "Amallar", enter: "Qoralamani tahrirlash yoki o'chirish." },
      ],
    },
    {
      title: "Hujjat",
      fields: [
        {
          n: 6,
          name: "Sana",
          required: true,
          enter: "Tuzatish sanasi. Standart — hozir.",
          affects: "Kirim narxi shu sanagacha bo'lgan oxirgi kirimdan olinadi; yopilgan oyga tasdiqlab bo'lmaydi.",
        },
        { n: 7, name: "Ombor", required: true, enter: "Qoldig'i o'zgaradigan ombor.", onChange: "Tovarlar ro'yxati shu ombor bo'yicha yuklanadi." },
        {
          n: 8,
          name: "Tuzatish turi",
          required: true,
          enter: "Kirim yoki chiqim turi.",
          affects: "Kirimda markirovkalar yoziladi va «Narx (1 dona)» chiqadi; chiqimda markirovkalar ombordagilardan tanlanadi.",
        },
        { n: 9, name: "Izoh", enter: "Sabab: dalolatnoma raqami, komissiya qarori." },
      ],
    },
    {
      title: "Mahsulot qatorlari",
      fields: [
        { n: 10, name: "Mahsulot nomi", required: true, enter: "Ombordagi tovar (yonida qoldig'i ko'rinadi)." },
        { n: 11, name: "Birlik", required: true, enter: "Tovardan o'zi to'ladi." },
        {
          n: 12,
          name: "Miqdor",
          required: true,
          enter: "Kirim yoki chiqim miqdori. Markirovkali tovarda — kodlar soni.",
        },
        {
          name: "Narx (1 dona)",
          enter: "Faqat kirimda. Bo'sh — shu sanagacha oxirgi kirim narxi.",
          affects: "Hali hech kirim qilinmagan tovarga narx kiritish shart.",
        },
        { n: 13, name: "Qoldiq", enter: "Ombordagi joriy qoldiq." },
        { n: 14, name: "Markirovka", enter: "Kirimda kodlarni yozish/Excel'dan joylash, chiqimda ombordagi kodlarni tanlash." },
      ],
    },
    {
      title: "Amallar va kamomad",
      fields: [
        { n: 15, name: "Saqlash / Tasdiqlash", enter: "Qoralamani saqlaydi; tasdiqlash avval saqlab, keyin o'tkazadi." },
        {
          n: 16,
          name: "Bekor qilish / inventarizatsiya havolasi",
          enter:
            "Oddiy tuzatish storno bilan bekor qilinadi. Inventarizatsiya yaratgan tuzatish o'rniga havola chiqadi — u inventarizatsiya bilan birga bekor qilinadi.",
        },
        {
          n: 17,
          name: "Kamomad (5910)",
          enter: "Chiqim tuzatishida: 5910 ga yozilgan summa, yopilgani va ochiq qoldig'i.",
        },
        { n: 18, name: "Kamomadni yopish", enter: "Ochiq kamomadni kimning hisobiga o'tkazish oynasini ochadi." },
        { n: 19, name: "Provodkalar hisoboti", enter: "Hujjat provodkalari." },
      ],
    },
    {
      title: "Kamomadni yopish oynasi",
      fields: [
        {
          n: 20,
          name: "Kimning hisobiga",
          enter:
            "Zararga (Dt 9430 — Kt 5910) — aybdor yo'q yoki tabiiy yo'qotish; Aybdor xodimga (Dt 4730) — undiriladi; Yetkazib beruvchi / tashuvchiga (Dt 4860) — da'vo.",
        },
        { n: 21, name: "Xarajat moddasi / Xodim / Kontragent", enter: "Tanlangan yo'nalishga qarab: xarajat moddasi, aybdor xodim yoki kontragent." },
        { n: 22, name: "Summa", enter: "Standart — butun ochiq qoldiq; qismlab yopish mumkin.", affects: "Ochiq kamomaddan oshmasligi kerak." },
        { n: 23, name: "Kamomadni yopish", enter: "Qo'lda provodka yaratib o'tkazadi." },
      ],
    },
  ],
  postings: {
    intro: "Misol: inventarizatsiyada 3 ta choynak kam chiqdi (317 205) va kamomad zararga o'tkazildi.",
    entries: [
      { when: "Kamomad / hisobdan chiqarish", debit: "5910", credit: "2910", amount: "317 205", note: "Partiyalar tannarxida (FIFO)." },
      { when: "Ortiqcha / topilgan", debit: "2910", credit: "9390", amount: "Miqdor × narx", note: "Omborda yangi partiya ochiladi." },
      { when: "Kamomad zararga", debit: "9430", credit: "5910", amount: "Yopilgan summa" },
      { when: "Kamomad aybdor xodimga", debit: "4730", credit: "5910", amount: "Yopilgan summa" },
      { when: "Kamomad yetkazib beruvchi / tashuvchiga", debit: "4860", credit: "5910", amount: "Yopilgan summa" },
    ],
    cancel: "provodkalar va ombor harakati hujjat sanasi bilan storno qilinadi.",
  },
  errors: [
    {
      message: "«…» uchun narx kiriting: bu tovar hali kirim qilinmagan, ortiqcha qiymatsiz kira olmaydi …",
      cause: "Kirim turida narx bo'sh va tovarning oldingi kirimi yo'q.",
      fix: "«Narx (1 dona)» ni kiriting.",
    },
    {
      message: "…-mahsulot miqdori … birliklar soni … ga mos emas.",
      cause: "Markirovkali tovarda miqdor kodlar soniga teng emas.",
      fix: "Kodlarni qo'shing yoki miqdorni moslang.",
    },
    {
      message: "Bu hujjat inventarizatsiya №… natijasi — uni inventarizatsiyani bekor qilish orqali bekor qiling.",
      cause: "Inventarizatsiya yaratgan tuzatish alohida bekor qilinmoqda.",
      fix: "Inventarizatsiyani oching va uni bekor qiling.",
    },
    {
      message: "Summa 0 dan katta va ochiq kamomaddan (…) oshmasligi kerak.",
      cause: "«Kamomadni yopish» da summa noto'g'ri.",
      fix: "Ochiq qoldiqdan oshmaydigan summa yozing.",
    },
    {
      message: "…-omborda faol inventarizatsiya mavjud. …",
      cause: "Omborda yakunlangan, lekin tasdiqlanmagan inventarizatsiya bor.",
      fix: "Avval inventarizatsiyani tasdiqlang yoki bekor qiling.",
    },
  ],
  tips: [
    "Kamomadni inventarizatsiya orqali rasmiylashtirgan ma'qul — farqlar o'zi hisoblanadi.",
    "Kamomad 5910 da yopilmagan holda qolmasin: oy oxirigacha komissiya qarori bo'yicha yoping.",
  ],
  topics: [
    { title: "Inventarizatsiya", articleId: "warehouse/inventory" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Qo'lda provodka", articleId: "accounting/manual-entry" },
  ],
};
