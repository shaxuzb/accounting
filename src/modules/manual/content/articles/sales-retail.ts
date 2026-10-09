import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 640);
const payment = px(508, 430);
const posted = px(1568, 440);

/**
 * «Chakana sotuv» (1C «Отчёт о розничных продажах» / «Чек ККМ»): a check sold over the counter,
 * with its payments. It follows RetailSaleEditorPage, RetailSalePayments, RetailSaleDocService
 * and RetailSaleDocContextBuilder; the example is the demo organization's cash check at its
 * Chilonzor shop.
 */
export const retailArticle: ManualArticle = {
  id: "sales/retail",
  sectionId: "sales",
  title: "Chakana sotuv",
  summary:
    "Do'kondagi chek: tovarlar, fiskal kassa va to'lovlar (naqd, karta, Click/Payme, o'tkazma). Tasdiqlanganda tushum, QQS, tannarx va pul tushumi bir hujjatda yoziladi.",
  routes: ["/main/sales/retail-sale"],
  screenshots: [
    {
      src: "/manual/sales/retail-editor.jpg",
      alt: "Yangi chakana savdo",
      caption: "Sotuv → Chakana savdo → «Qo'shish». Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 640,
      markers: [
        editor(1, 449, 114, [253, 130, 457, 160]),
        editor(2, 664, 114, [468, 130, 672, 160]),
        editor(3, 879, 114, [683, 130, 887, 160]),
        editor(4, 1094, 114, [898, 130, 1102, 160]),
        editor(5, 1308, 114, [1113, 130, 1316, 160]),
        editor(6, 1524, 114, [1328, 130, 1532, 160]),
        editor(7, 1352, 214, [346, 212, 1360, 258]),
        editor(8, 1435, 262, [1374, 222, 1496, 247]),
        editor(9, 567, 284, [257, 284, 567, 434]),
        editor(10, 888, 284, [577, 284, 888, 434]),
        editor(11, 985, 481, [834, 470, 970, 492]),
        editor(12, 1394, 468, [1394, 468, 1531, 495]),
        editor(13, 740, 505, [746, 505, 880, 590]),
        editor(14, 1045, 528, [880, 505, 1100, 590]),
        editor(15, 1365, 528, [1255, 505, 1480, 590]),
      ],
    },
    {
      src: "/manual/sales/retail-payment.jpg",
      alt: "To'lov qo'shish oynasi",
      caption: "«To'lov qo'shish»: bitta chekda bir nechta to'lov bo'lishi mumkin (masalan, bir qismi naqd, qolgani karta).",
      width: 508,
      height: 430,
      markers: [
        payment(16, 488, 58, [19, 75, 488, 104]),
        payment(17, 488, 133, [19, 150, 488, 180]),
        payment(18, 488, 208, [19, 225, 488, 255]),
        payment(19, 488, 284, [19, 301, 488, 331]),
        payment(20, 488, 352, [19, 352, 488, 377]),
        payment(21, 410, 400, [420, 388, 488, 413]),
      ],
    },
    {
      src: "/manual/sales/retail-posted.jpg",
      alt: "Tasdiqlangan chek",
      caption: "Tasdiqlangan chek: tovarlar va to'lovlar; undan qaytarish yaratiladi.",
      width: 1568,
      height: 440,
      markers: [
        posted(22, 370, 145, [327, 112, 414, 134]),
        posted(23, 478, 145, [425, 110, 531, 136]),
        posted(24, 1060, 110, [911, 110, 1056, 136]),
        posted(25, 1430, 110, [1436, 110, 1544, 136]),
        posted(26, 320, 345, [243, 330, 1555, 425]),
      ],
    },
  ],
  purpose:
    "Do'konda jismoniy shaxslarga (yoki ixtiyoriy tanlangan mijozga) sotilgan chekni rasmiylashtirish: tovar ombordan chiqadi, tushum va QQS yoziladi, pul kassaga yoki to'lov nuqtasiga tushadi.",
  why:
    "Chakana sotuvda qarz qolmaydi — chek to'liq to'lanadi. Bitta hujjat sotuv, tannarx va pul tushumini birdan yozadi, fiskal kassa bo'yicha tushum hisoboti chiqadi.",
  prerequisites: [
    { title: "Fiskal kassa yaratilgan va omborga biriktirilgan (Sozlamalar → Fiskal kassalar)", route: "/main/settings/fiscal-cash-registers" },
    { title: "Karta va Click/Payme uchun to'lov qabul qilish nuqtasi", articleId: "cash/acceptance-points" },
    { title: "Sotuv qoidasi kiritilgan" },
    { title: "Omborda tovar bor", articleId: "warehouse/stock" },
  ],
  related: {
    center: "Chakana sotuv",
    items: [
      { title: "Chakana qaytarish", articleId: "sales/retail-return" },
      { title: "Kassa", articleId: "cash/book" },
      { title: "To'lov qabul qilish nuqtalari", articleId: "cash/acceptance-points" },
      { title: "Ombor qoldig'i", articleId: "warehouse/stock" },
    ],
  },
  steps: [
    { title: "Ombor va kassa", text: "Ombor va shu omborning fiskal kassasini tanlang; mijoz ixtiyoriy." },
    { title: "Tovarlar", text: "Tovar, miqdor va sotuv narxini (QQSsiz) kiriting — QQS ustiga qo'shiladi." },
    { title: "To'lovlar", text: "«To'lov qo'shish»: to'lov usuli va summasi; to'langan summa chek jamiga teng bo'lishi shart." },
    { title: "Rasmiylashtiring", text: "«Rasmiylashtirish» → «Saqlash va tasdiqlash» (yoki qoralama)." },
  ],
  fieldGroups: [
    {
      title: "Chek sarlavhasi",
      fields: [
        { n: 1, name: "Hujjat sanasi", required: true, enter: "Sotuv sanasi. Standart — bugun." },
        {
          n: 2,
          name: "Mijoz (ixtiyoriy)",
          enter: "Odatda bo'sh — ro'yxatda «Chakana xaridor» ko'rinadi. Ma'lum xaridor bo'lsa tanlanadi.",
        },
        {
          n: 3,
          name: "Ombor",
          required: true,
          enter: "Tovar chiqadigan ombor (do'kon).",
          onChange: "Tovar qatorlari va fiskal kassa tozalanadi.",
        },
        {
          n: 4,
          name: "Fiskal kassa",
          required: true,
          enter: "Shu omborga biriktirilgan kassa (avval omborni tanlang).",
          affects: "Kassa bo'yicha tushum hisobotlari.",
        },
        {
          n: 5,
          name: "Debitorlik hisobvarag'i",
          required: true,
          enter: "Odatda 4090 — sozlamadan o'zi qo'yiladi.",
          affects: "Chek shu hisob orqali o'tadi va to'lov bilan yopiladi (qoldiq 0).",
        },
        { n: 6, name: "QQS hisobvarag'i", enter: "Odatda 6410; QQS bo'lsa majburiy. Faqat QQS to'lovchida." },
      ],
    },
    {
      title: "To'lovlar",
      fields: [
        { n: 7, name: "Jami sotuv · To'langan · Qoldiq", enter: "Chek jami, kiritilgan to'lovlar va qolgan summa." },
        { n: 8, name: "Holat belgisi", enter: "To'lanmagan, Qisman to'langan yoki To'liq to'langan." },
        { n: 9, name: "To'lov kartochkasi", enter: "Usul, summa va debet hisobi; qalam — tahrirlash, savat — o'chirish." },
        { n: 10, name: "To'lov qo'shish", enter: "To'lov oynasini ochadi; summa qolgan summa bilan to'ladi." },
      ],
    },
    {
      title: "Tovarlar",
      fields: [
        {
          n: 11,
          name: "Markirovka bilan",
          enter: "Yoqilgan — markirovkali tovar kodlari skanerlanadi; o'chiq — donalar navbat bo'yicha chiqadi.",
        },
        { n: 12, name: "Rasmiylashtirish", enter: "Saqlash oynasini ochadi: «Qoralama sifatida saqlash» yoki «Saqlash va tasdiqlash»." },
        {
          n: 13,
          name: "Sotuv narxi (QQSsiz)",
          required: true,
          enter: "Bir birlik narxi QQSsiz; QQS ustiga qo'shiladi.",
          affects: "Tushum: Dt 4090 Kt 9020.",
        },
        { n: 14, name: "QQS (stavka va summa)", enter: "Sotuv qoidasidagi stavka; QQS to'lovchi bo'lmasa — QQSsiz." },
        { n: 15, name: "Hisobvaraqlar", enter: "Qator hisoblari (2910 / 9020 / 9120); qalam bilan o'zgartiriladi." },
      ],
    },
    {
      title: "To'lov oynasi",
      fields: [
        {
          n: 16,
          name: "To'lov usuli",
          required: true,
          enter: "Naqd pul, Bank kartasi, Click, Payme, Mobil to'lov, Bank o'tkazmasi, Boshqa.",
          onChange: "Qabul qilish nuqtasi va debet hisobi tozalanadi.",
        },
        {
          n: 17,
          name: "To'lovni qabul qilish nuqtasi",
          enter: "Karta terminali, Click/Payme hisobi — naqd puldan boshqa usulda majburiy; naqd pulda bo'lmaydi.",
          affects: "Karta to'lovi nuqtada pul sifatida qayd etiladi va keyin bankka tushadi.",
        },
        {
          n: 18,
          name: "Debet hisobvarag'i",
          required: true,
          enter: "Pul tushadigan hisob: naqdda 50xx (masalan, 5010.2 Operatsion kassa), kartada 57xx.",
          affects: "Provodka: Dt shu hisob Kt 4090.",
        },
        { n: 19, name: "Summa", enter: "To'lov summasi; barcha to'lovlar yig'indisi chek jamiga teng bo'lishi shart." },
        { n: 20, name: "Tranzaksiya raqami", enter: "Ixtiyoriy: terminal yoki to'lov tizimi raqami." },
        { n: 21, name: "Saqlash", enter: "To'lovni chekka qo'shadi." },
      ],
    },
    {
      title: "Tasdiqlangan chek",
      fields: [
        { n: 22, name: "Holat", enter: "Qoralama, O'tkazilgan yoki Bekor qilingan." },
        { n: 23, name: "Shartnoma · Provodkalar", enter: "Chek uchun hujjatni shablondan chiqarish; chek provodkalari." },
        { n: 24, name: "Qaytarish yaratish", enter: "Shu chek asosida chakana qaytarish ochadi." },
        {
          n: 25,
          name: "Bekor qilish",
          enter: "Chekni bekor qiladi (tasdiqlash so'raladi).",
          affects: "Provodkalar storno, tovar omborga qaytadi. Asosida qaytarish bo'lsa — avval uni bekor qiling.",
        },
        { n: 26, name: "To'lovlar", enter: "Chek to'lovlari: usul, nuqta, debet hisobi, tranzaksiya, summa." },
      ],
    },
  ],
  postings: {
    intro: "Misol: Chilonzor do'konida 2 ta choynak × 160 000 + QQS 12%, naqd 358 400.",
    entries: [
      { when: "Tushum", debit: "4090", credit: "9020", amount: "320 000" },
      { when: "QQS", debit: "4090", credit: "6410", amount: "38 400" },
      { when: "Tannarx", debit: "9120", credit: "2910", amount: "211 470", note: "Partiyalar bo'yicha (FIFO)." },
      { when: "Naqd to'lov", debit: "5010", credit: "4090", amount: "358 400", note: "Kartada — 57xx (to'lov nuqtasi orqali)." },
    ],
    cancel: "provodkalar storno, tovar omborga qaytadi, to'lov nuqtasi operatsiyalari bekor bo'ladi.",
  },
  errors: [
    {
      message: "To'lovlar jami … hujjat jami … ga teng bo'lishi kerak.",
      cause: "To'lovlar yig'indisi chek jamiga teng emas.",
      fix: "To'lov summasini to'g'rilang yoki yana to'lov qo'shing.",
    },
    {
      message: "Naqd pulsiz to'lov uchun qabul qilish nuqtasini tanlang",
      cause: "Karta yoki Click/Payme to'lovida nuqta tanlanmagan.",
      fix: "To'lovni qabul qilish nuqtasini tanlang.",
    },
    {
      message: "Ombor yoki fiskal kassa topilmadi, faol emas yoki kassa boshqa omborga biriktirilgan …",
      cause: "Kassa boshqa omborniki yoki passiv.",
      fix: "Omborni va kassani qayta tanlang.",
    },
    {
      message: "Chakana savdo faqat so'mda yuritiladi.",
      cause: "Valyuta so'm emas.",
      fix: "Chekni so'mda kiriting.",
    },
    {
      message: "«…» omborida «…» yetarli emas …",
      cause: "Do'kon omborida tovar yetarli emas.",
      fix: "Tovarni do'konga ko'chiring yoki miqdorni kamaytiring.",
    },
  ],
  tips: [
    "Aralash to'lovda avval naqd summani, keyin qolganini karta bilan qo'shing — yangi to'lov qolgan summa bilan ochiladi.",
    "Do'konda sotishdan oldin tovarni markaziy ombordan do'kon omboriga ko'chiring.",
  ],
  topics: [
    { title: "Chakana xaridordan qaytarish", articleId: "sales/retail-return" },
    { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
    { title: "To'lov qabul qilish nuqtalari", articleId: "cash/acceptance-points" },
  ],
};
