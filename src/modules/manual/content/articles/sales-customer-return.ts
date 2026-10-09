import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 455);
const posted = px(1568, 400);

/**
 * «Xaridordan qaytarish» (1C «Возврат товаров от покупателя»): goods a customer gives back, on the
 * basis of the posted sale. It follows ReturnEditorPage, ReturnDocService and
 * ReturnDocContextBuilder; the example is the demo organization's return of an air conditioner
 * from BARAKA MARKET.
 */
export const customerReturnArticle: ManualArticle = {
  id: "sales/customer-return",
  sectionId: "sales",
  title: "Xaridordan qaytarish",
  summary:
    "Mijoz qaytargan tovarni sotuv asosida rasmiylashtirish: tushum va QQS kamayadi, tovar sotilgandagi tannarxi bilan omborga qaytadi, mijoz qarzi kamayadi.",
  routes: ["/main/sales/sale-returns"],
  screenshots: [
    {
      src: "/manual/sales/customer-return-editor.jpg",
      alt: "Xaridordan qaytarish hujjati",
      caption:
        "Sotuv → Xaridordan qaytarish → «Yangi qaytarish» yoki o'tkazilgan sotuvdagi «Qaytarish yaratish». Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 455,
      markers: [
        editor(1, 540, 112, [376, 129, 548, 155]),
        editor(2, 1036, 112, [562, 129, 1044, 155]),
        editor(3, 1535, 112, [1058, 129, 1540, 155]),
        editor(4, 724, 176, [252, 166, 712, 187]),
        editor(5, 336, 242, [257, 198, 416, 224]),
        editor(6, 467, 242, [423, 198, 511, 224]),
        editor(7, 565, 242, [517, 198, 613, 224]),
        editor(8, 1212, 380, [1193, 255, 1298, 404]),
        editor(9, 1318, 340, [1299, 255, 1422, 404]),
        editor(10, 1445, 332, [1423, 255, 1554, 404]),
        editor(11, 1310, 422, [1318, 409, 1554, 437], { callout: "Qaytariladigan summa", calloutSide: "left" }),
      ],
    },
    {
      src: "/manual/sales/customer-return-posted.jpg",
      alt: "O'tkazilgan qaytarish",
      caption: "O'tkazilgan qaytarish: faqat qaytgan qatorlar ko'rinadi.",
      width: 1568,
      height: 400,
      markers: [
        posted(12, 350, 128, [268, 134, 338, 154]),
        posted(13, 311, 242, [257, 198, 366, 224]),
        posted(14, 417, 242, [372, 198, 463, 224]),
        posted(15, 1245, 300, [1193, 312, 1298, 348], { callout: "Sotuvdan yana qaytarish mumkin bo'lgan qoldiq", calloutSide: "left" }),
      ],
    },
  ],
  purpose:
    "Mijoz sotib olingan tovarning bir qismini yoki hammasini qaytarganda uni hujjat bilan rasmiylashtirish: daromad va QQS kamayadi, tovar omborga qaytadi, mijoz qarzi kamayadi.",
  why:
    "Sotuvni bekor qilish o'rniga qaytarish qilinadi: sotuv o'z davrida qoladi, qaytarish esa o'z sanasida yoziladi (1C dagi kabi), akt-sverka va QQS deklaratsiyasi to'g'ri chiqadi.",
  prerequisites: [
    { title: "Asos sotuv o'tkazilgan", articleId: "sales/sale" },
    { title: "Qaytarish sanasi ochiq oyda", articleId: "accounting/period-close" },
    { title: "Omborda faol inventarizatsiya yo'q", articleId: "warehouse/inventory" },
  ],
  related: {
    center: "Qaytarish",
    items: [
      { title: "Sotuv", articleId: "sales/sale" },
      { title: "Ombor qoldig'i", articleId: "warehouse/stock" },
      { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
      { title: "Bank: pulni qaytarish", articleId: "bank/operations" },
    ],
  },
  steps: [
    { title: "Sotuvni tanlang", text: "O'tkazilgan sotuvdan «Qaytarish yaratish» ni bosing yoki «Asos hujjat» dan sotuvni tanlang." },
    { title: "Miqdorni kiriting", text: "Qaytgan tovar qatorida «Qaytariladi» ni yozing yoki «Hammasini qaytarish» ni bosing." },
    { title: "Sababini yozing", text: "Izohga qaytarish sababini yozing." },
    { title: "O'tkazing", text: "«O'tkazish» — tovar omborga qaytadi, provodkalar yoziladi." },
  ],
  fieldGroups: [
    {
      title: "Hujjat",
      fields: [
        {
          n: 1,
          name: "Sana",
          required: true,
          enter: "Tovar qaytarilgan sana va vaqt. Standart — hozir.",
          affects: "Sotuv sanasidan oldin va yopilgan oyda bo'la olmaydi.",
        },
        {
          n: 2,
          name: "Asos hujjat",
          required: true,
          enter: "O'tkazilgan sotuv: «№ · sana · mijoz · summa». Saqlangandan keyin o'zgartirilmaydi.",
          onChange: "Kiritilgan miqdorlar tozalanadi, jadval yangi sotuv qatorlari bilan to'ladi.",
          affects: "Mijoz, shartnoma, ombor, valyuta, narx, QQS va hisoblar sotuvdan olinadi.",
        },
        { n: 3, name: "Izoh", enter: "Qaytarish sababi." },
        { n: 4, name: "Kontragent · Ombor · Valyuta", enter: "Sotuvdan ko'rsatiladi; tovar shu omborga qaytadi." },
        { n: 5, name: "Hammasini qaytarish", enter: "Har qatorga qaytarish mumkin bo'lgan butun miqdorni qo'yadi." },
        { n: 6, name: "Saqlash", enter: "Qoralama sifatida saqlaydi (ombor va provodkaga ta'sir qilmaydi)." },
        {
          n: 7,
          name: "O'tkazish",
          enter: "Saqlaydi va o'tkazadi.",
          affects: "Tovar omborga qaytadi, provodkalar yoziladi, mijoz qarzi kamayadi.",
        },
      ],
    },
    {
      title: "Qatorlar",
      fields: [
        {
          n: 8,
          name: "Qaytarish mumkin",
          enter: "Sotilgan miqdor, oldingi qaytarishlar ayirilgan holda.",
          affects: "«Qaytariladi» bundan oshmaydi.",
        },
        {
          n: 9,
          name: "Qaytariladi",
          required: true,
          enter: "Qaytgan miqdor. Markirovkali tovarda qaytgan kodlar tanlanadi.",
          onChange: "Qator summasi va jami qayta hisoblanadi.",
        },
        { n: 10, name: "Summa (QQSsiz) / Jami", enter: "Narx × miqdor; o'tkazilgandan keyin QQS bilan jami." },
        { n: 11, name: "Jami", enter: "Qaytarish summasi.", affects: "Mijoz qarzi shuncha kamayadi (QQS bilan)." },
      ],
    },
    {
      title: "O'tkazilgan qaytarish",
      fields: [
        { n: 12, name: "Holat", enter: "O'tkazilgan — faqat o'qiladi." },
        {
          n: 13,
          name: "Bekor qilish",
          enter: "Qaytarishni bekor qiladi (tasdiqlash so'raladi).",
          affects: "Provodkalar storno, tovar yana ombordan chiqadi, mijoz qarzi tiklanadi.",
        },
        { n: 14, name: "Provodkalar", enter: "Qaytarish provodkalari." },
        { n: 15, name: "Qaytarish mumkin", enter: "Sotuvdan yana qancha qaytarish mumkinligi." },
      ],
    },
  ],
  postings: {
    intro: "Misol: BARAKA MARKET 1 ta konditsionerni qaytardi — 5 300 000 + QQS 636 000.",
    entries: [
      {
        when: "Tushum kamaydi",
        debit: "9040",
        credit: "4010",
        amount: "5 300 000",
        note: "«Qaytarilgan tovarlar» hisobi; oy yopilganda sotuv daromadini kamaytiradi.",
      },
      { when: "Sotuv QQSi kamaydi", debit: "6410", credit: "4010", amount: "636 000", note: "Faqat QQS to'lovchida." },
      {
        when: "Tovar omborga qaytdi",
        debit: "2910",
        credit: "9120",
        amount: "4 218 269,23",
        note: "Sotilgandagi tannarxi bilan; omborda yangi partiya ochiladi.",
      },
    ],
    cancel: "provodkalar storno qilinadi, tovar ombordan qayta chiqadi, mijoz qarzi tiklanadi.",
  },
  errors: [
    {
      message: "Qaytarish faqat o'tkazilgan (tasdiqlangan) hujjat asosida qilinadi.",
      cause: "Sotuv o'tkazilmagan yoki bekor qilingan.",
      fix: "O'tkazilgan sotuvni tanlang.",
    },
    {
      message: "«…»: ko'pi bilan N qaytarish mumkin …",
      cause: "Miqdor qolgan miqdordan katta.",
      fix: "Miqdorni kamaytiring.",
    },
    {
      message: "Qaytarish sanasi asos hujjat sanasidan oldin bo'lishi mumkin emas.",
      cause: "Sana sotuvdan oldin.",
      fix: "Sanani to'g'rilang.",
    },
    {
      message: "Bu hujjat asosida o'tkazilgan qaytarish bor — avval qaytarishni bekor qiling.",
      cause: "Sotuvni bekor qilmoqchisiz, unga qaytarish bor.",
      fix: "Avval qaytarishni bekor qiling.",
    },
  ],
  tips: [
    "Mijozga pul qaytarilsa, bank yoki kassadan to'lov hujjatini qiling — qaytarish faqat qarzni kamaytiradi.",
    "Xizmatdan voz kechish qaytarish bilan emas, tuzatish hujjati bilan rasmiylashtiriladi.",
  ],
  topics: [
    { title: "Sotuv", articleId: "sales/sale" },
    { title: "Yetkazib beruvchiga qaytarish", articleId: "purchases/supplier-return" },
    { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
  ],
};
