import type { ManualArticle } from "../../types";
import { px } from "./px";

const list = px(1568, 365);
const form = px(530, 520);

/**
 * «Shartnomalar»: contracts with suppliers and customers. It follows ContractListPage,
 * ContractAddEditPage, ContractService, ManualService (which contracts a document offers) and
 * the contract templates; the example is the demo organization's purchase contracts.
 */
export const contractsArticle: ManualArticle = {
  id: "purchases/contracts",
  sectionId: "purchases",
  title: "Shartnomalar",
  summary:
    "Yetkazib beruvchi va xaridorlar bilan shartnomalar: yaratish, amal qilish muddati, «Narxlar QQS bilan» belgisi va shartnoma hujjatini Word shablondan chiqarish.",
  routes: ["/main/purchases/contracts", "/main/sales/contracts"],
  screenshots: [
    {
      src: "/manual/purchases/contracts-list.jpg",
      alt: "Xarid shartnomalari ro'yxati",
      caption:
        "Xaridlar → Shartnoma (xarid shartnomalari) yoki Sotuv → Shartnoma (sotuv shartnomalari). Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 365,
      markers: [
        list(1, 428, 96, [244, 96, 428, 121]),
        list(2, 614, 96, [434, 96, 614, 121]),
        list(3, 826, 96, [621, 96, 826, 121]),
        list(4, 1325, 96, [1325, 96, 1455, 121]),
        list(5, 1550, 96, [1462, 96, 1555, 121]),
        list(6, 380, 330, [288, 165, 416, 312]),
        list(7, 1424, 330, [1388, 165, 1460, 312]),
        list(8, 1500, 330, [1462, 165, 1540, 312]),
      ],
    },
    {
      src: "/manual/purchases/contract-form.jpg",
      alt: "Shartnoma yaratish oynasi",
      caption: "«Qo'shish» bosilganda ochiladigan oyna (tahrirlashda ham xuddi shu oyna).",
      width: 530,
      height: 520,
      markers: [
        form(9, 250, 58, [38, 74, 257, 104]),
        form(10, 483, 58, [271, 74, 490, 104]),
        form(11, 250, 140, [38, 156, 257, 186]),
        form(12, 483, 140, [271, 156, 490, 186]),
        form(13, 250, 222, [38, 238, 257, 268]),
        form(14, 483, 222, [271, 238, 490, 268]),
        form(15, 250, 304, [38, 320, 257, 350]),
        form(16, 483, 304, [271, 320, 490, 350]),
        form(17, 490, 378, [38, 378, 490, 434]),
        form(18, 482, 462, [38, 462, 490, 495]),
      ],
    },
  ],
  purpose:
    "Kontragent bilan tuzilgan shartnomani tizimga kiritish. Har bir xarid va sotuv hujjati shartnomaga bog'lanadi, hisob-kitob va qarzlar shartnoma kesimida yuritiladi.",
  why:
    "Shartnomasiz xarid yoki sotuv hujjatini saqlab bo'lmaydi. Shartnoma bo'yicha akt-sverka, avanslarni hisobga olish va qarzlar hisoboti chiqadi; «Narxlar QQS bilan» esa hujjatlarni to'g'ri to'ldirishga yordam beradi.",
  prerequisites: [
    { title: "Kontragent (yetkazib beruvchi yoki xaridor) yaratilgan", route: "/main/settings/counterparty" },
    { title: "Mas'ul shaxslar ro'yxati (ixtiyoriy)", route: "/main/settings/contract-responsible-persons" },
    { title: "Shartnoma shablonlari (Word hujjat uchun, ixtiyoriy)", route: "/main/settings/contract-templates" },
  ],
  related: {
    center: "Shartnoma",
    items: [
      { title: "Sotib olish", articleId: "purchases/purchase" },
      { title: "Sotuv", articleId: "sales/sale" },
      { title: "Bank operatsiyalari", articleId: "bank/operations" },
      { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
    ],
  },
  steps: [
    {
      title: "«Qo'shish» ni bosing",
      text: "Xarid shartnomasi uchun Xaridlar → Shartnoma, sotuv uchun Sotuv → Shartnoma sahifasidan. Xarid hujjatining o'zida «Shartnoma» maydonidagi «+» bilan ham yaratish mumkin.",
    },
    {
      title: "Kontragentni tanlang",
      text: "Tashkilot va yetkazib beruvchini (yoki mijozni) tanlang. Shartnoma turi sahifaga qarab o'zi qo'yiladi.",
    },
    {
      title: "Muddatni kiriting",
      text: "Shartnoma sanasi, boshlanish va (bo'lsa) tugash sanasi. Tugash sanasi bo'sh — muddatsiz.",
    },
    {
      title: "Yakunlang",
      text: "Narxlar QQS bilan bo'lsa belgini yoqing, izoh yozing va «Yakunlash» ni bosing.",
    },
  ],
  fieldGroups: [
    {
      title: "Ro'yxat sahifasi",
      fields: [
        {
          n: 1,
          name: "Qidirish",
          enter: "Kontragent nomi, shartnoma raqami yoki mas'ul shaxs bo'yicha qidirish.",
        },
        {
          n: 2,
          name: "Mas'ul shaxs",
          enter: "Faqat tanlangan mas'ul shaxsning shartnomalarini ko'rsatadi.",
        },
        {
          n: 3,
          name: "Sanadan — Sanagacha",
          enter: "Shartnoma sanasi bo'yicha oraliq.",
        },
        {
          n: 4,
          name: "Excelga yuklash",
          enter: "Joriy filtrlar bo'yicha barcha shartnomalarni Excel faylga yuklaydi.",
        },
        {
          n: 5,
          name: "Qo'shish",
          enter: "Yangi shartnoma oynasini ochadi.",
        },
        {
          n: 6,
          name: "Shartnoma raqami",
          enter: "Ichki raqam saqlashda avtomatik beriladi (100000001 dan boshlab). Bossangiz, shartnoma kartochkasi ochiladi.",
          affects:
            "Hujjatlardagi ro'yxatda yetkazib beruvchining shartnoma raqami (EDO yoki 1C dan kelgan) bo'lsa, o'sha ko'rinadi, bo'lmasa — ichki raqam.",
        },
        {
          n: 7,
          name: "Holati",
          enter: "Aktiv yoki Passiv.",
          affects: "Passiv shartnoma yangi hujjatlarda tanlanmaydi.",
        },
        {
          n: 8,
          name: "Amallar",
          enter: "Tahrirlash va o'chirish.",
          affects:
            "O'chirish shartnomani butunlay o'chirmaydi — passiv qiladi. Eski hujjatlar unga bog'liq qoladi, yangilarida tanlanmaydi.",
        },
      ],
    },
    {
      title: "Shartnoma oynasi",
      fields: [
        {
          n: 9,
          name: "Tashkilot",
          required: true,
          enter: "Sizning tashkilotingiz — joriy tanlangan tashkilot o'zi qo'yiladi.",
          affects: "Shartnoma doim joriy tanlangan tashkilotga yoziladi.",
        },
        {
          n: 10,
          name: "Yetkazib beruvchi / Mijoz",
          required: true,
          enter: "Shartnoma tuzilgan kontragent. Xarid hujjatidagi «+» dan ochilsa, o'sha kontragent qo'yiladi va qulflanadi.",
          affects: "Hujjatda faqat shu kontragent tanlanganda bu shartnoma taklif qilinadi.",
        },
        {
          n: 11,
          name: "Shartnoma turi",
          required: true,
          enter: "«Yetkazib beruvchi bilan shartnoma» (xarid) yoki «Xaridor bilan shartnoma» (sotuv) — sahifaga qarab o'zi tanlanadi.",
          affects:
            "Xarid shartnomasi bo'yicha to'lovlarda hisob-kitob hisobi 6010, sotuv shartnomasida 4010 bo'ladi.",
        },
        {
          n: 12,
          name: "Mas'ul shaxs (ixtiyoriy)",
          enter: "Shartnomaga javobgar xodim. «+» bilan yangisini qo'shish mumkin.",
          affects: "Ro'yxatda filtr sifatida ishlatiladi.",
        },
        {
          n: 13,
          name: "Shartnoma sanasi",
          required: true,
          enter: "Shartnoma imzolangan sana. Standart — bugun.",
          affects: "Word hujjatda va ro'yxatda ko'rinadi.",
        },
        {
          n: 14,
          name: "Boshlanish sanasi",
          required: true,
          enter: "Shartnoma kuchga kirgan sana. Tugash sanasidan keyin bo'la olmaydi.",
          affects: "Hujjat sanasi shu sanadan oldin bo'lsa, shartnoma hujjatda tanlanmaydi.",
        },
        {
          n: 15,
          name: "Tugash sanasi",
          enter: "Shartnoma muddati tugaydigan kun. Bo'sh — muddatsiz.",
          affects: "Hujjat sanasi bu kundan keyin bo'lsa, shartnoma hujjatda tanlanmaydi — yangi shartnoma tuzish yoki muddatni uzaytirish kerak.",
        },
        {
          n: 16,
          name: "Izoh",
          enter: "Shartnoma predmeti, masalan «Maishiy texnika yetkazib berish». 1000 belgigacha.",
          affects: "Ro'yxatda ko'rinadi.",
        },
        {
          n: 17,
          name: "Narxlar QQS bilan",
          enter: "Faqat xarid shartnomasida. Yetkazib beruvchi narxlarni QQS ichida bersa yoqing.",
          onChange: "Mavjud hujjatlar o'zgarmaydi.",
          affects:
            "Shu shartnoma tanlangan yangi xaridda «Narx QQS bilan» o'zi yoqiladi (hujjatda o'zgartirish mumkin).",
        },
        {
          n: 18,
          name: "Yakunlash",
          enter: "Shartnomani saqlaydi. Yangi shartnoma doim «Aktiv» holatda yaratiladi; tahrirlashda «Holati» maydoni ham chiqadi.",
          affects: "Xarid hujjatidan ochilgan bo'lsa, yangi shartnoma hujjatda o'zi tanlanadi.",
        },
      ],
    },
    {
      title: "Shartnoma hujjati (Word)",
      fields: [
        {
          name: "«Shartnoma» tugmasi",
          enter:
            "Xarid, sotuv va chakana savdo hujjatlari ro'yxati va kartochkasida bor. Shablonni tanlaysiz, PDF ko'rinishini ko'rasiz va Word yoki PDF qilib yuklab olasiz.",
          affects:
            "Hujjatga tashkilot, kontragent, shartnoma (raqam, sana, muddat), summalar (raqam va so'z bilan) va tovarlar jadvali o'zi qo'yiladi.",
        },
        {
          name: "Shartnoma shablonlari",
          enter:
            "Sozlamalar → Shartnoma shablonlari: har tur (Xarid, Sotuv, Chakana savdo, Xizmat ko'rsatish, Ijara, Boshqa) uchun Word shablon; bittasini «Asosiy» qilish mumkin. Shablon brauzerda tahrirlanadi.",
          affects: "Shablon bo'lmasa, tugma «… uchun shablon yo'q» deb ogohlantiradi.",
        },
      ],
    },
  ],
  errors: [
    {
      message: "… majburiy",
      cause: "Tashkilot, kontragent, shartnoma turi, shartnoma sanasi yoki boshlanish sanasi bo'sh.",
      fix: "Bo'sh maydonlarni to'ldirib, «Yakunlash» ni qayta bosing.",
    },
    {
      message: "Id-si … bo'lgan shartnoma mas'ul shaxsi joriy tashkilotda topilmadi.",
      cause: "Tanlangan mas'ul shaxs passiv yoki boshqa tashkilotniki.",
      fix: "Boshqa mas'ul shaxsni tanlang yoki maydonni bo'sh qoldiring.",
    },
    {
      message: "Xarid hujjatida shartnoma ro'yxati bo'sh",
      cause:
        "Kontragentning hujjat sanasida amal qiladigan faol shartnomasi yo'q (muddat tugagan, hali boshlanmagan yoki shartnoma passiv).",
      fix: "Shartnoma muddatini tekshiring yoki «+» bilan yangi shartnoma yarating.",
    },
  ],
  tips: [
    "Bir kontragent bilan bir nechta shartnoma bo'lishi mumkin — qarzlar va avanslar har shartnoma bo'yicha alohida yuritiladi.",
    "Shartnomani o'chirish o'rniga muddatini tugating: eski hujjatlar to'g'ri ko'rinadi, yangilarida tanlanmaydi.",
  ],
  topics: [
    { title: "Sotib olish", articleId: "purchases/purchase" },
    { title: "Sotuv", articleId: "sales/sale" },
    { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
    { title: "Bank operatsiyalari", articleId: "bank/operations" },
  ],
};
