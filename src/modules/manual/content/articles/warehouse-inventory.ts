import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 615);
const diff = px(1568, 460);
const posted = px(1568, 420);

/**
 * «Inventarizatsiya» (1C «Инвентаризация товаров»): the count of a warehouse, its differences and
 * the surplus/shortage adjustments it posts. It follows InventoryCountDetailPage,
 * InventoryCountLinesEditor, InventoryCountService and InventoryCountLifecycleService; the
 * example is the demo organization's count of its Chilonzor shop.
 */
export const inventoryArticle: ManualArticle = {
  id: "warehouse/inventory",
  sectionId: "warehouse",
  title: "Inventarizatsiya",
  summary:
    "Ombordagi tovarlarni sanab, hisobdagi qoldiq bilan solishtirish: sanoqni kiritish, farqlarni ko'rish va tasdiqlaganda ortiqcha hamda kamomadni avtomatik rasmiylashtirish.",
  routes: ["/main/warehouses/inventory-counts"],
  screenshots: [
    {
      src: "/manual/warehouse/count-editor.jpg",
      alt: "Inventarizatsiya — sanoqni kiritish",
      caption:
        "Ombor → Inventarizatsiya → «Yangi inventarizatsiya». «Qoldiq bo'yicha to'ldirish» bilan qatorlar hisobdagi qoldiq bilan to'ladi, so'ng sanalgan miqdor yoziladi.",
      width: 1568,
      height: 615,
      markers: [
        editor(1, 722, 206, [256, 195, 710, 217]),
        editor(2, 661, 247, [256, 263, 669, 293]),
        editor(3, 1088, 247, [682, 263, 1096, 293]),
        editor(4, 661, 329, [256, 345, 669, 375]),
        editor(5, 600, 400, [594, 412, 752, 434]),
        editor(6, 832, 396, [761, 410, 904, 436]),
        editor(7, 1004, 396, [914, 410, 1096, 436]),
        editor(8, 636, 478, [518, 492, 640, 585]),
        editor(9, 765, 478, [765, 492, 895, 585]),
        editor(10, 275, 478, [266, 503, 286, 527]),
        editor(11, 1542, 213, [1135, 213, 1542, 239]),
        editor(12, 1542, 262, [1135, 274, 1542, 333]),
      ],
    },
    {
      src: "/manual/warehouse/count-differences.jpg",
      alt: "Inventarizatsiya farqlari",
      caption: "«Sanoqni yakunlash» dan keyin: «Farqlar» yorlig'i va tasdiqlash.",
      width: 1568,
      height: 460,
      markers: [
        diff(13, 542, 248, [256, 238, 530, 258]),
        diff(14, 546, 268, [512, 302, 580, 372]),
        diff(15, 622, 268, [583, 302, 660, 372]),
        diff(16, 823, 268, [770, 302, 877, 372]),
        diff(17, 933, 268, [880, 302, 988, 372]),
        diff(18, 1043, 268, [990, 302, 1096, 372]),
        diff(19, 1542, 286, [1135, 286, 1542, 312]),
        diff(20, 1542, 322, [1135, 322, 1542, 348]),
      ],
    },
    {
      src: "/manual/warehouse/count-posted.jpg",
      alt: "Tasdiqlangan inventarizatsiya",
      caption: "Tasdiqlangandan keyin: ikkita tuzatish hujjati yaratilgan.",
      width: 1568,
      height: 420,
      markers: [
        posted(21, 1350, 128, [1360, 116, 1447, 140]),
        posted(22, 1542, 286, [1135, 286, 1542, 312]),
        posted(23, 1542, 346, [1135, 346, 1542, 405]),
      ],
    },
  ],
  purpose:
    "Ombordagi tovarni haqiqatda sanab, hisobdagi qoldiq bilan solishtirish va farqlarni — kamomad va ortiqchani — hujjat bilan rasmiylashtirish.",
  why:
    "Hisobdagi qoldiq vaqt o'tishi bilan haqiqatdan farq qiladi: yo'qotish, buzilish, xato kirim. Inventarizatsiya ularni topadi va bir bosishda tuzatadi, ombor qiymati (2910) esa haqiqiy holatga keladi.",
  prerequisites: [
    { title: "Tovarlar omborga kirim qilingan", articleId: "warehouse/stock" },
    { title: "Hujjat hisoblari sozlamasida ortiqcha (9390) va kamomad (5910) hisoblari", articleId: "start/document-accounts" },
    { title: "Shu omborda boshqa tugallanmagan inventarizatsiya yo'q" },
  ],
  related: {
    center: "Inventarizatsiya",
    items: [
      { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
      { title: "Ortiqcha va kamomad", articleId: "warehouse/adjustment" },
      { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
      { title: "Sotuv", articleId: "sales/sale" },
    ],
  },
  steps: [
    {
      title: "Omborni tanlang va to'ldiring",
      text: "Sana va omborni tanlang, «Qoldiq bo'yicha to'ldirish» ni bosing — barcha tovarlar hisobdagi miqdori bilan qatorga tushadi.",
    },
    {
      title: "Sanalganini yozing",
      text: "Har qatorda «Sanalgan miqdor» ni haqiqatda sanalganiga o'zgartiring (yo'q bo'lsa — 0). «Qoralama saqlash».",
    },
    {
      title: "Sanoqni yakunlang",
      text: "«Sanoqni yakunlash» — hujjat qulflanadi va ombor tasdiqlangungacha bloklanadi. «Farqlar» yorlig'ini tekshiring.",
    },
    {
      title: "Tasdiqlang",
      text: "«Tasdiqlash» — kamomad uchun manfiy, ortiqcha uchun musbat tuzatish hujjati o'zi yaratiladi va o'tkaziladi.",
    },
  ],
  fieldGroups: [
    {
      title: "Hujjat",
      fields: [
        {
          n: 1,
          name: "Yorliqlar",
          enter:
            "«Umumiy ma'lumot» (holat, sanalar), «Mahsulotlar» (sanoq), «Farqlar» (natija), «Provodkalar» va «Qoldiq harakati» (tasdiqlangandan keyin).",
        },
        {
          n: 2,
          name: "Hujjat sanasi",
          required: true,
          enter: "Sanoq sanasi. Standart — hozir.",
          affects: "Tuzatish hujjatlari shu sana bilan yoziladi; yopilgan oyga tasdiqlab bo'lmaydi.",
        },
        {
          n: 3,
          name: "Ombor",
          required: true,
          enter: "Sanaladigan ombor.",
          affects: "Bir omborda bir vaqtda faqat bitta tugallanmagan inventarizatsiya bo'lishi mumkin.",
        },
        { n: 4, name: "Izoh", enter: "Ixtiyoriy: komissiya, sabab, oy." },
      ],
    },
    {
      title: "Inventarizatsiya qatorlari",
      fields: [
        {
          n: 5,
          name: "Sanoq yakunlandimi?",
          enter: "Yoqilsa, sanoq tugagan deb belgilanadi (qaytarib bo'lmaydi). Odatda «Sanoqni yakunlash» tugmasi ishlatiladi.",
        },
        {
          n: 6,
          name: "Mahsulot qo'shish",
          enter: "Bitta tovarni qo'lda qo'shadi (masalan, faqat bir nechta tovarni sanash uchun).",
          affects: "Hujjatda yo'q tovarlar solishtirilmaydi — ular hisobdan chiqarilmaydi.",
        },
        {
          n: 7,
          name: "Qoldiq bo'yicha to'ldirish",
          enter: "Barcha qatorlarni ombordagi hisob qoldig'i bilan almashtiradi (avval omborni tanlang).",
          affects: "To'liq inventarizatsiya uchun shu tugmadan boshlang, keyin faqat farq bor qatorlarni o'zgartiring.",
        },
        {
          n: 8,
          name: "Sanalgan miqdor",
          required: true,
          enter: "Haqiqatda sanalgan miqdor. 0 — tovar umuman yo'q. Og'irlik tovarida kasr mumkin (2,5 kg); markirovkali tovarda butun son.",
          affects: "Hisobdagidan kam — kamomad, ko'p — ortiqcha.",
        },
        {
          n: 9,
          name: "Standart tannarx",
          enter: "Tovarning joriy tannarxi (o'zgartirilmaydi).",
          affects: "Ortiqcha shu narx bilan kirim qilinadi (markirovkali donada o'z tannarxi bo'lsa — o'sha).",
        },
        {
          n: 10,
          name: "«+» (qator elementlari)",
          enter: "Markirovkali tovar donalari: shtrix-kod, seriya, markirovka raqami, tannarx. Element qo'shish/o'chirish sanalgan miqdorni ±1 o'zgartiradi.",
        },
        {
          n: 11,
          name: "Qoralama saqlash / Saqlash",
          enter: "Qoralamani saqlaydi. Qoralama omborni bloklamaydi.",
        },
        {
          n: 12,
          name: "Yaratilgan tuzatish hujjatlari",
          enter: "Tasdiqlangandan keyin musbat (ortiqcha) va manfiy (kamomad) tuzatishlarga havola.",
        },
      ],
    },
    {
      title: "Farqlar",
      fields: [
        { n: 13, name: "Jamlanma", enter: "Kam chiqqan, ortiq chiqqan va farqsiz tovarlar soni." },
        { n: 14, name: "Kutilgan", enter: "Hisobdagi qoldiq." },
        { n: 15, name: "Sanalgan", enter: "Siz kiritgan miqdor." },
        { n: 16, name: "Kam chiqqan", enter: "Hisobdagidan qancha kam.", affects: "Manfiy tuzatish: Dt 5910 Kt 2910." },
        { n: 17, name: "Ortiq chiqqan", enter: "Hisobdagidan qancha ko'p.", affects: "Musbat tuzatish: Dt 2910 Kt 9390." },
        { n: 18, name: "Holati", enter: "Kam chiqqan, Ortiq chiqqan yoki Farq yo'q." },
        {
          n: 19,
          name: "Tasdiqlash",
          enter: "Faqat yakunlangan sanoqda. Tasdiqlash so'raladi.",
          affects: "Ikkala tuzatish hujjati yaratiladi va o'tkaziladi, ombor blokdan chiqadi.",
        },
        {
          n: 20,
          name: "Bekor qilish",
          enter: "Qoralama yoki yakunlangan sanoqni bekor qiladi.",
          affects: "Ombor blokdan chiqadi.",
        },
      ],
    },
    {
      title: "Tasdiqlangan inventarizatsiya",
      fields: [
        { n: 21, name: "Holat", enter: "O'tkazilgan." },
        {
          n: 22,
          name: "Bekor qilish",
          enter: "Tasdiqlangan inventarizatsiyani bekor qiladi.",
          affects: "Uning ikkala tuzatish hujjati ham storno qilinadi, qoldiq sanoqdan oldingi holatga qaytadi.",
        },
        {
          n: 23,
          name: "Musbat / Manfiy",
          enter: "Yaratilgan tuzatish hujjatlarini ochadi.",
          affects: "Kamomadni keyin u yerda «Kamomadni yopish» bilan zararga yoki aybdorga o'tkazasiz.",
        },
      ],
    },
  ],
  postings: {
    intro: "Misol: Chilonzor do'koni — changyutgich 10 o'rniga 11 (ortiqcha 1), choynak 40 o'rniga 37 (kamomad 3).",
    entries: [
      {
        when: "Kamomad (manfiy tuzatish)",
        debit: "5910",
        credit: "2910",
        amount: "3 × 105 735 = 317 205",
        note: "Partiyalar tannarxida. 5910 — vaqtincha: keyin «Kamomadni yopish» bilan 9430, 4730 yoki 4860 ga o'tkaziladi.",
      },
      {
        when: "Ortiqcha (musbat tuzatish)",
        debit: "2910",
        credit: "9390",
        amount: "1 × 659 060 = 659 060",
        note: "Standart tannarx bilan; omborda yangi partiya ochiladi.",
      },
    ],
    cancel: "ikkala tuzatish storno qilinadi, ombor qoldig'i sanoqdan oldingi holatiga qaytadi.",
  },
  errors: [
    {
      message: "…-ombor uchun boshqa faol inventarizatsiya mavjud.",
      cause: "Shu omborda tugallanmagan inventarizatsiya bor.",
      fix: "O'shani tasdiqlang yoki bekor qiling.",
    },
    {
      message: "…-omborda faol inventarizatsiya mavjud. '…' amaliga ruxsat berilmaydi.",
      cause: "Sanoq yakunlangan, lekin tasdiqlanmagan — ombor bloklangan: xarid, sotuv, ko'chirish o'tkazilmaydi.",
      fix: "Inventarizatsiyani tasdiqlang yoki bekor qiling.",
    },
    {
      message: "Id-si … bo'lgan inventarizatsiya tasdiqlashdan oldin yakunlanishi kerak.",
      cause: "«Sanoqni yakunlash» bosilmagan.",
      fix: "Avval sanoqni yakunlang.",
    },
    {
      message: "…-mahsulotning hisoblangan … miqdori noto'g'ri.",
      cause: "Manfiy miqdor yoki markirovkali tovarda kasr.",
      fix: "Miqdorni to'g'rilang (0 yoki undan katta).",
    },
    {
      message: "…uchun inventarizatsiya qatori takrorlangan.",
      cause: "Bitta tovar ikki qatorda.",
      fix: "Qatorlarni birlashtiring.",
    },
    {
      message: "… hisob davri yopilgan",
      cause: "Sana yopilgan oyda.",
      fix: "Sanani ochiq oyga o'zgartiring.",
    },
  ],
  tips: [
    "Sanoqni boshlashdan oldin hujjatni qoralama qilib saqlang — qoralama omborni bloklamaydi; «Sanoqni yakunlash» dan tasdiqlashgacha esa ombor yopiq.",
    "To'liq inventarizatsiyada «Qoldiq bo'yicha to'ldirish» dan boshlang: hujjatda yo'q tovar solishtirilmaydi.",
  ],
  topics: [
    { title: "Ortiqcha va kamomadni rasmiylashtirish", articleId: "warehouse/adjustment" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Hujjat hisoblari sozlamasi", articleId: "start/document-accounts" },
  ],
};
