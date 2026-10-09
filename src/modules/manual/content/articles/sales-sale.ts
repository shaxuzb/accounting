import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 650);
const pricing = px(1568, 500);
const posted = px(1568, 385);

/**
 * «Sotuv» (1C «Реализация товаров и услуг»): the wholesale sale in two steps — the goods are
 * picked and reserved, then priced and posted. It follows SaleAddEditPage, SaleProductSelection,
 * SalePricingEditor, SaleLifecycleService and SaleDocContextBuilder; the example is the demo
 * organization's sale of two fridges and an air conditioner to BARAKA MARKET.
 */
export const saleArticle: ManualArticle = {
  id: "sales/sale",
  sectionId: "sales",
  title: "Sotuv",
  summary:
    "Mijozga ulgurji sotuv: tovarlarni tanlash va band qilish, narx va QQSni belgilash, tasdiqlash — tushum, QQS, tannarx va mijoz qarzi o'zi yoziladi.",
  routes: ["/main/sales/sale"],
  screenshots: [
    {
      src: "/manual/sales/sale-editor.jpg",
      alt: "Yangi sotuv",
      caption:
        "Sotuv → Sotuvlar → «Qo'shish». Raqam ustiga boring — izoh shu yerda chiqadi; bossangiz, ochiq qoladi.",
      width: 1568,
      height: 650,
      markers: [
        editor(1, 448, 114, [253, 130, 456, 160]),
        editor(2, 662, 114, [468, 130, 670, 160]),
        editor(3, 877, 114, [684, 130, 885, 160]),
        editor(4, 1092, 114, [899, 130, 1100, 160]),
        editor(5, 1308, 114, [1115, 130, 1316, 160]),
        editor(6, 1524, 114, [1330, 130, 1532, 160]),
        editor(7, 447, 189, [253, 205, 455, 236]),
        editor(8, 409, 286, [304, 286, 409, 312]),
        editor(9, 520, 286, [416, 286, 520, 312]),
        editor(10, 985, 299, [834, 288, 970, 310]),
        editor(11, 1394, 286, [1394, 286, 1531, 312]),
        editor(12, 650, 346, [299, 372, 665, 446]),
        editor(13, 1010, 346, [815, 372, 1020, 446]),
        editor(14, 1130, 346, [1120, 372, 1218, 446]),
        editor(15, 1310, 346, [1219, 372, 1318, 446]),
        editor(16, 1330, 346, [1319, 372, 1445, 446]),
        editor(17, 1447, 323, [1447, 372, 1540, 446]),
        editor(18, 1528, 587, [257, 587, 1528, 642]),
      ],
    },
    {
      src: "/manual/sales/sale-pricing.jpg",
      alt: "Narxlash va tasdiqlash",
      caption: "«Rasmiylashtirish» dan keyin hujjat «Kutilmoqda»: tovar band qilingan, narxni tekshirib tasdiqlaysiz.",
      width: 1568,
      height: 500,
      markers: [
        pricing(20, 250, 220, [243, 212, 1291, 303]),
        pricing(21, 1308, 222, [1308, 222, 1437, 253]),
        pricing(22, 1537, 222, [1444, 222, 1537, 253]),
        pricing(23, 1425, 262, [1308, 262, 1425, 292]),
        pricing(24, 1060, 337, [838, 350, 1068, 380]),
        pricing(25, 1180, 392, [1079, 355, 1274, 380]),
        pricing(26, 1548, 350, [1285, 350, 1548, 380]),
        pricing(27, 785, 418, [690, 450, 790, 486]),
        pricing(28, 880, 418, [790, 450, 885, 486]),
      ],
    },
    {
      src: "/manual/sales/sale-posted.jpg",
      alt: "O'tkazilgan sotuv",
      caption: "O'tkazilgan sotuv: hujjat faqat o'qiladi; undan qaytarish va shartnoma hujjati yaratiladi.",
      width: 1568,
      height: 385,
      markers: [
        posted(29, 342, 108, [243, 96, 331, 120]),
        posted(30, 1245, 132, [1200, 96, 1291, 121]),
        posted(31, 1370, 88, [1298, 96, 1442, 121]),
        posted(32, 1555, 96, [1449, 96, 1555, 121]),
        posted(33, 1395, 144, [1403, 131, 1555, 157]),
        posted(34, 282, 250, [252, 282, 282, 372]),
      ],
    },
  ],
  purpose:
    "Mijozga (yuridik shaxs yoki tadbirkor) tovar va xizmat sotishni rasmiylashtirish: tovar ombordan chiqadi, tushum va QQS yoziladi, mijoz qarzi paydo bo'ladi.",
  why:
    "Sotuv — daromad, QQS deklaratsiyasi, tannarx va debitor qarz manbai. Ikki bosqich (band qilish → narxlash) tovarni boshqa sotuvga ketib qolishdan saqlaydi va narxni alohida xodim tasdiqlashiga imkon beradi.",
  prerequisites: [
    { title: "Mijoz va sotuv shartnomasi bor", articleId: "purchases/contracts" },
    { title: "Omborda tovar qoldig'i bor", articleId: "warehouse/stock" },
    { title: "Sotuv qoidasi (narx va QQS shartlari) kiritilgan" },
    { title: "Hujjat hisoblari: 4010, 9020, 6410, 9120", articleId: "start/document-accounts" },
  ],
  related: {
    center: "Sotuv",
    items: [
      { title: "Shartnomalar", articleId: "purchases/contracts" },
      { title: "Ombor qoldig'i", articleId: "warehouse/stock" },
      { title: "Xaridordan qaytarish", articleId: "sales/customer-return" },
      { title: "Bank: to'lov qabul qilish", articleId: "bank/operations" },
    ],
  },
  steps: [
    {
      title: "Mijoz va ombor",
      text: "Sana, mijoz, shartnoma va omborni tanlang. Hisobvaraqlar sozlamadan o'zi qo'yiladi.",
    },
    {
      title: "Tovarlar",
      text: "«Tovar qo'shish» yoki «Ombor» bilan tovarlarni tanlang, miqdor va sotuv narxini (QQSsiz) kiriting.",
    },
    {
      title: "Rasmiylashtiring",
      text: "«Rasmiylashtirish» — tovar omborda band qilinadi, hujjat «Kutilmoqda» bo'ladi.",
    },
    {
      title: "Narxni tasdiqlang",
      text: "Hujjatni ochib marja va narxlarni tekshiring, «Tasdiqlash» — sotuv o'tkaziladi.",
    },
  ],
  fieldGroups: [
    {
      title: "Hujjat sarlavhasi",
      fields: [
        {
          n: 1,
          name: "Sana",
          required: true,
          enter: "Sotuv sanasi. Standart — bugun.",
          onChange: "Shartnoma tozalanadi — shartnomalar shu sanada amal qilishi bo'yicha tanlanadi.",
          affects: "Tovar shu sanadagi qoldiqdan chiqadi; yopilgan oyga tasdiqlab bo'lmaydi.",
        },
        {
          n: 2,
          name: "Mijoz",
          required: true,
          enter: "Xaridor kontragent. «+» bilan yangisini qo'shish mumkin.",
          onChange: "Shartnoma va (yangi hujjatda) tovar qatorlari tozalanadi.",
          affects: "Debitor qarz (4010) shu mijoz bo'yicha; avansi bo'lsa, o'zi hisobga olinadi.",
        },
        {
          n: 3,
          name: "Shartnoma",
          required: true,
          enter: "Mijozning sotuv shartnomasi (avval mijozni tanlang). «+» bilan yaratish mumkin.",
          affects: "Qarz va avans shu shartnoma bo'yicha yuritiladi.",
        },
        {
          n: 4,
          name: "Ombor",
          required: true,
          enter: "Tovar chiqadigan ombor. Tahrirlashda o'zgartirilmaydi.",
          onChange: "Yangi hujjatda tovar qatorlari tozalanadi.",
          affects: "Faqat shu ombordagi qoldiq sotiladi.",
        },
        {
          n: 5,
          name: "Mijoz hisobvarag'i",
          required: true,
          enter: "Odatda 4010 — sozlamadan o'zi qo'yiladi.",
          affects: "Tushum va QQS provodkalarining debeti.",
        },
        {
          n: 6,
          name: "QQS hisobvarag'i",
          required: true,
          enter: "Odatda 6410. Faqat QQS to'lovchi tashkilotda.",
          affects: "Sotuv QQSi shu hisobga.",
        },
        {
          n: 7,
          name: "Valyuta",
          required: true,
          enter: "Standart — so'm. Xorijiy valyutada «Kurs» maydoni chiqadi.",
        },
      ],
    },
    {
      title: "Tovarlar paneli",
      fields: [
        { n: 8, name: "Ombor", enter: "Ombordagi tovarlar ro'yxatidan bir nechtasini birdan tanlash oynasi." },
        { n: 9, name: "Tovar qo'shish", enter: "Bo'sh qator qo'shadi. Bo'sh qolgan qator saqlashda e'tiborga olinmaydi." },
        {
          n: 10,
          name: "Markirovka bilan",
          enter:
            "Yoqilgan (standart): tovar darhol band qilinadi va hujjat «Kutilmoqda» bo'ladi; markirovkali tovar kodlari skanerlanadi. O'chiq: qoralama — omborchi keyin yig'ib tasdiqlaydi.",
          affects:
            "Markirovkalar to'liq bo'lmasa, hujjatni qoralama qilib saqlash taklif qilinadi. Xizmat bor sotuvni qoralama qilib bo'lmaydi.",
        },
        { n: 11, name: "Rasmiylashtirish", enter: "Hujjatni saqlaydi (band qiladi). Provodka hali yozilmaydi." },
      ],
    },
    {
      title: "Tovar qatorlari",
      fields: [
        {
          n: 12,
          name: "Mahsulot",
          required: true,
          enter: "Ombordagi tovar (yonida qoldig'i). Bir tovar ikki marta tanlanmaydi.",
          onChange: "MXIK, birlik, tannarx, narx va QQS stavkasi o'zi to'ladi.",
        },
        { n: 13, name: "Markirovka", enter: "Markirovkali tovarda kodlar soni / kerakli miqdor; bosilsa, skanerlash oynasi." },
        { n: 14, name: "Qoldiq", enter: "Ombordagi qoldiq; 0 bo'lsa qizil." },
        { n: 15, name: "Miqdor", required: true, enter: "Sotiladigan miqdor (qoldiqdan oshmaydi)." },
        {
          n: 16,
          name: "Tannarx",
          enter: "Ombor partiyalaridan (FIFO) hisoblangan tannarx — o'zgartirilmaydi.",
          affects: "Provodka: Dt 9120 Kt 2910.",
        },
        {
          n: 17,
          name: "Sotuv narxi (QQSsiz)",
          required: true,
          enter: "Bir birlik narxi QQSsiz. Narx belgilangan bo'lsa o'zi to'ladi, bo'lmasa tannarx qo'yiladi.",
          onChange: "QQS va Jami qayta hisoblanadi. Jami (QQS bilan) ni yozsangiz, narx teskari hisoblanadi.",
          affects: "Tushum: Dt 4010 Kt 9020.",
        },
        {
          n: 18,
          name: "QQSsiz summa · QQS summasi · Jami",
          enter: "Barcha qatorlar yig'indisi.",
          affects: "Jami — mijoz qarzi.",
        },
        { name: "«+» (jadval ostida)", enter: "Yangi qator qo'shadi." },
        {
          name: "QQS (stavka va summa), Hisobvaraqlar, Xizmatlar",
          enter:
            "QQS stavkasi sotuv qoidasidan; qalam belgisi bilan qator hisoblari (2910 / 9020 / 9120) o'zgartiriladi; pastdagi «Xizmatlar» blokida xizmat qatorlari (omborga ta'sir qilmaydi).",
        },
      ],
    },
    {
      title: "Narxlash va tasdiqlash",
      fields: [
        { n: 20, name: "Jamlanma", enter: "Mijoz, tovar turlari, jami miqdor va summa." },
        {
          n: 21,
          name: "Tasdiqlash",
          enter: "Sotuvni o'tkazadi (CONFIRM_SALE huquqi bilan).",
          affects: "Band olib tashlanadi, tovar ombordan chiqadi, provodkalar va mijoz qarzi yoziladi.",
        },
        {
          n: 22,
          name: "Saqlash",
          enter: "Narxlarni o'tkazmasdan saqlaydi — boshqa xodim ham ko'radi.",
        },
        {
          n: 23,
          name: "Bekor qilish",
          enter: "Hujjatni bekor qiladi (tasdiqlash so'raladi).",
          affects: "Band qilingan tovar bo'shaydi.",
        },
        { n: 24, name: "Barchasi uchun QQS", enter: "Guruhdagi barcha qatorlarga bitta QQS stavkasini qo'yadi." },
        { n: 25, name: "Marja, % / Marja / Sotuv narxi", enter: "Ommaviy narxlash usuli: foiz ustama, summa ustama yoki tayyor narx." },
        { n: 26, name: "Qiymat va «Qo'llash»", enter: "Tanlangan usul qiymatini guruhning barcha qatorlariga qo'llaydi." },
        {
          n: 27,
          name: "Marja, %",
          enter: "Qatordagi ustama foizi: (narx − tannarx) ÷ tannarx.",
          onChange: "Sotuv narxi qayta hisoblanadi.",
        },
        { n: 28, name: "Sotuv narxi (QQSsiz)", enter: "Qator narxi.", onChange: "Marja qayta hisoblanadi." },
      ],
    },
    {
      title: "O'tkazilgan sotuv",
      fields: [
        { n: 29, name: "Holat", enter: "Qoralama, Kutilmoqda (band qilingan), O'tkazilgan yoki Bekor qilingan." },
        { n: 30, name: "Provodkalar", enter: "Sotuv yozgan provodkalar (faqat o'tkazilganda faol)." },
        {
          n: 31,
          name: "Qaytarish yaratish",
          enter: "Shu sotuv asosida xaridordan qaytarish hujjatini ochadi.",
          affects: "Qatorlar, narx va QQS sotuvdan olinadi.",
        },
        { n: 32, name: "Shartnoma", enter: "Shablon asosida shartnoma yoki hisob hujjatini Word/PDF qilib chiqaradi." },
        {
          n: 33,
          name: "Sotuvni bekor qilish",
          enter: "O'tkazilgan sotuvni bekor qiladi (CANCEL_SALE huquqi, tasdiqlash so'raladi).",
          affects: "Provodkalar storno, tovar omborga qaytadi, mijoz qarzi kamayadi.",
        },
        { n: 34, name: "CH", enter: "Qatordagi markirovka kodlari ro'yxati." },
      ],
    },
  ],
  postings: {
    intro: "Misol: 2 ta muzlatgich × 4 200 000 va 1 ta konditsioner × 5 300 000, QQS 12%.",
    entries: [
      { when: "Tushum", debit: "4010", credit: "9020", amount: "8 400 000 va 5 300 000", note: "QQSsiz summa, tovar va QQS stavkasi bo'yicha." },
      { when: "Sotuv QQSi", debit: "4010", credit: "6410", amount: "1 008 000 va 636 000", note: "Faqat QQS to'lovchida." },
      {
        when: "Tannarx",
        debit: "9120",
        credit: "2910",
        amount: "6 584 615,38 va 4 218 269,23",
        note: "Partiyalar bo'yicha (FIFO) haqiqiy chiqqan tannarx.",
      },
      { when: "Mijozning avansi bo'lsa", debit: "6310", credit: "4010", amount: "Avans va qarzning kichigi" },
    ],
    cancel:
      "provodkalar storno qilinadi, tovar omborga qaytadi, mijoz qarzi kamayadi. Asosida o'tkazilgan qaytarish bo'lsa, avval uni bekor qiling.",
  },
  errors: [
    {
      message: "Sotuv qoidasi kiritilmagan",
      cause: "Tashkilotda amaldagi sotuv qoidasi yo'q.",
      fix: "Sozlamalar → Sotuv qoidalarida qoida kiriting.",
    },
    {
      message: "«…» omborida «…» yetarli emas (hujjat sanasidagi qoldiq): kerak …, mavjud …",
      cause: "Miqdor qoldiqdan ko'p yoki tovar boshqa sotuvda band.",
      fix: "Miqdorni kamaytiring yoki tovarni ko'chiring.",
    },
    {
      message: "Barcha mahsulotlar uchun sotuv narxini kiriting",
      cause: "Narxlash bosqichida narxi yo'q qator bor.",
      fix: "Narxni yozing yoki marja qo'llang.",
    },
    {
      message: "Xizmat bor sotuvni qoralama qilib bo'lmaydi …",
      cause: "Xizmatli sotuvda markirovkalar to'liq kiritilmagan.",
      fix: "Kodlarni kiriting yoki «Markirovkasiz» deb belgilang.",
    },
    {
      message: "…-omborda faol inventarizatsiya mavjud. …",
      cause: "Omborda inventarizatsiya yakunlangan, lekin tasdiqlanmagan.",
      fix: "Inventarizatsiyani tasdiqlang yoki bekor qiling.",
    },
    {
      message: "… hisob davri yopilgan.",
      cause: "Sana yopilgan oyda.",
      fix: "Sanani ochiq oyga o'zgartiring.",
    },
    {
      message: "Bu hujjat asosida o'tkazilgan qaytarish bor — avval qaytarishni bekor qiling.",
      cause: "Sotuvni bekor qilmoqchisiz, unga qaytarish o'tkazilgan.",
      fix: "Avval qaytarishni bekor qiling.",
    },
  ],
  tips: [
    "Narxni bir guruh tovarga birdan qo'yish uchun «Marja, %» ni tanlab, foizni yozing va «Qo'llash» ni bosing.",
    "O'tkazilgan sotuvdan «Qaytarish yaratish» va «Shartnoma» (Word hujjat) tugmalari bilan davom eting.",
  ],
  topics: [
    { title: "Xaridordan qaytarish", articleId: "sales/customer-return" },
    { title: "Shartnomalar", articleId: "purchases/contracts" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Bank operatsiyalari", articleId: "bank/operations" },
  ],
};
