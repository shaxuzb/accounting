import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 410);

/**
 * «Chakana xaridordan qaytarish» (1C «Возврат товаров от покупателя» по чеку): goods a shop
 * customer brings back, on the basis of the posted check, with the money paid back. It follows
 * ReturnEditorPage (retail kind), ReturnDocService and ReturnDocContextBuilder; the example is the
 * demo organization's kettle returned at its Chilonzor shop.
 */
export const retailReturnArticle: ManualArticle = {
  id: "sales/retail-return",
  sectionId: "sales",
  title: "Chakana xaridordan qaytarish",
  summary:
    "Do'kon xaridori qaytargan tovarni chek asosida rasmiylashtirish: tushum va QQS kamayadi, tovar omborga qaytadi, pul to'langan joyidan qaytariladi.",
  routes: ["/main/sales/retail-returns"],
  screenshots: [
    {
      src: "/manual/sales/retail-return-editor.jpg",
      alt: "Chakana qaytarish",
      caption:
        "Sotuv → Chakana qaytarish → «Yangi qaytarish» yoki tasdiqlangan chekdagi «Qaytarish yaratish». Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 410,
      markers: [
        editor(1, 540, 112, [376, 129, 548, 155]),
        editor(2, 1036, 112, [562, 129, 1044, 155]),
        editor(3, 1535, 112, [1058, 129, 1540, 155]),
        editor(4, 500, 176, [252, 166, 490, 187]),
        editor(5, 336, 242, [257, 198, 416, 224]),
        editor(6, 467, 242, [423, 198, 511, 224]),
        editor(7, 565, 242, [517, 198, 613, 224]),
        editor(8, 1212, 340, [1193, 255, 1298, 357]),
        editor(9, 1318, 300, [1299, 255, 1422, 357]),
        editor(10, 1310, 376, [1330, 362, 1554, 390], { callout: "Qaytariladigan summa", calloutSide: "left" }),
      ],
    },
  ],
  purpose:
    "Chakana xaridor tovarni qaytarganda: tushum va QQS kamayadi, tovar sotilgandagi tannarxi bilan omborga qaytadi, pul chekda to'langan joyidan (kassadan) qaytariladi.",
  why:
    "Chekni bekor qilish emas, qaytarish qilinadi: chek o'z kunida qoladi, qaytarish o'z sanasida yoziladi, kassa va tushum hisobotlari to'g'ri chiqadi.",
  prerequisites: [
    { title: "Asos chek tasdiqlangan", articleId: "sales/retail" },
    { title: "Kassada qaytariladigan pul bor", articleId: "cash/book" },
  ],
  related: {
    center: "Chakana qaytarish",
    items: [
      { title: "Chakana sotuv", articleId: "sales/retail" },
      { title: "Kassa", articleId: "cash/book" },
      { title: "Ombor qoldig'i", articleId: "warehouse/stock" },
    ],
  },
  steps: [
    { title: "Chekni tanlang", text: "Tasdiqlangan chekdan «Qaytarish yaratish» ni bosing yoki «Asos hujjat» dan chekni tanlang." },
    { title: "Miqdor", text: "Qaytgan tovar miqdorini «Qaytariladi» ga yozing." },
    { title: "Sabab", text: "Izohga qaytarish sababini yozing." },
    { title: "O'tkazing", text: "«O'tkazish» — tovar omborga qaytadi, pul kassadan chiqadi." },
  ],
  fieldGroups: [
    {
      title: "Hujjat",
      fields: [
        { n: 1, name: "Sana", required: true, enter: "Qaytarish sanasi va vaqti. Chek sanasidan oldin bo'la olmaydi." },
        {
          n: 2,
          name: "Asos hujjat",
          required: true,
          enter: "Tasdiqlangan chek: «№ · sana · summa».",
          affects: "Ombor, narx, QQS, hisoblar va pul qaytariladigan joy chekdan olinadi.",
        },
        { n: 3, name: "Izoh", enter: "Qaytarish sababi." },
        { n: 4, name: "Ombor · Valyuta", enter: "Chekdan; tovar shu omborga qaytadi." },
        { n: 5, name: "Hammasini qaytarish", enter: "Barcha qatorlarga to'liq miqdorni qo'yadi." },
        { n: 6, name: "Saqlash", enter: "Qoralama sifatida saqlaydi." },
        { n: 7, name: "O'tkazish", enter: "Saqlaydi va o'tkazadi.", affects: "Tovar qaytadi, pul kassadan chiqadi, provodkalar yoziladi." },
      ],
    },
    {
      title: "Qatorlar",
      fields: [
        { n: 8, name: "Qaytarish mumkin", enter: "Chekdagi miqdor, oldingi qaytarishlar ayirilgan." },
        { n: 9, name: "Qaytariladi", required: true, enter: "Qaytgan miqdor (markirovkali tovarda — kodlar)." },
        { n: 10, name: "Summa", enter: "Qaytariladigan summa; o'tkazilgandan keyin QQS bilan jami." },
      ],
    },
  ],
  postings: {
    intro: "Misol: 1 ta choynak qaytarildi — 160 000 + QQS 19 200, naqd pul qaytarildi.",
    entries: [
      { when: "Tushum kamaydi", debit: "9040", credit: "4090", amount: "160 000" },
      { when: "QQS kamaydi", debit: "6410", credit: "4090", amount: "19 200" },
      { when: "Tovar omborga qaytdi", debit: "2910", credit: "9120", amount: "105 735", note: "Sotilgandagi tannarxi bilan." },
      { when: "Pul qaytarildi", debit: "4090", credit: "5010", amount: "179 200", note: "Chekda to'langan joyidan." },
    ],
    cancel: "provodkalar storno qilinadi, tovar ombordan qayta chiqadi, pul kassaga qaytadi.",
  },
  errors: [
    {
      message: "Qaytarish faqat o'tkazilgan (tasdiqlangan) hujjat asosida qilinadi.",
      cause: "Chek tasdiqlanmagan yoki bekor qilingan.",
      fix: "Tasdiqlangan chekni tanlang.",
    },
    {
      message: "«…»: ko'pi bilan N qaytarish mumkin …",
      cause: "Miqdor chekdagidan (oldingi qaytarishlar ayirilgan) ko'p.",
      fix: "Miqdorni kamaytiring.",
    },
    {
      message: "Bu hujjat asosida o'tkazilgan qaytarish bor — avval qaytarishni bekor qiling.",
      cause: "Chekni bekor qilmoqchisiz, unga qaytarish bor.",
      fix: "Avval qaytarishni bekor qiling.",
    },
  ],
  tips: ["Karta bilan to'langan chek qaytarilsa, pul to'lov nuqtasi orqali qaytariladi — kassa qoldig'iga ta'sir qilmaydi."],
  topics: [
    { title: "Chakana sotuv", articleId: "sales/retail" },
    { title: "Xaridordan qaytarish", articleId: "sales/customer-return" },
  ],
};
