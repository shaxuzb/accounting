import type { ManualArticle } from "../../types";
import { px } from "./px";

const stock = px(1568, 430);

/**
 * «Ombordagi qoldiqlar» (Ombor → Omborxona): what each warehouse holds now, at cost, by product
 * group. It follows ProductSummaryListPage, WarehouseProductsTable, ProductTableService and
 * WarehouseInventoryService; the example is the demo organization's stock after its purchases,
 * the return, the extra cost and the customs declaration.
 */
export const stockArticle: ManualArticle = {
  id: "warehouse/stock",
  sectionId: "warehouse",
  title: "Ombordagi qoldiqlar",
  summary:
    "Omborda hozir nima va qancha borligini tannarxi bilan ko'rish: guruhlar, tovarlar, omborlar bo'yicha filtr va markirovka kodlari.",
  routes: ["/main/warehouses/warehouse"],
  screenshots: [
    {
      src: "/manual/warehouse/stock.jpg",
      alt: "Omborxona — qoldiqlar",
      caption: "Ombor → Omborxona. Guruh qatorini «+» bilan ochsangiz, har bir tovar qoldig'i va tannarxi ko'rinadi.",
      width: 1568,
      height: 430,
      markers: [
        stock(1, 428, 62, [244, 61, 428, 84]),
        stock(2, 1365, 62, [1365, 61, 1521, 84]),
        stock(3, 1542, 95, [1528, 61, 1555, 84]),
        stock(4, 263, 110, [255, 132, 272, 150]),
        stock(5, 1465, 140, [700, 128, 1540, 152]),
        stock(6, 388, 160, [345, 195, 395, 375]),
        stock(7, 1100, 175, [1015, 195, 1115, 375]),
        stock(8, 1218, 175, [1200, 195, 1355, 375]),
        stock(9, 1382, 175, [1356, 195, 1540, 375]),
        stock(10, 1400, 394, [283, 380, 1540, 410], { callout: "2910 hisobi qoldig'iga teng", calloutSide: "left" }),
      ],
    },
  ],
  purpose:
    "Har bir tovarning hozirgi qoldig'i, o'rtacha tannarxi va jami qiymatini ko'rish — barcha omborlar bo'yicha yoki bitta ombor bo'yicha.",
  why:
    "Sotishdan oldin tovar bormi, qayerda va qancha turibdi, ombor qiymati buxgalteriya (2910) bilan mosmi — shu sahifadan tekshiriladi.",
  prerequisites: [
    { title: "Tovarlar katalogda", articleId: "warehouse/products" },
    { title: "Tovar xarid yoki boshlang'ich qoldiq bilan kirim qilingan", articleId: "purchases/purchase" },
  ],
  related: {
    center: "Ombor qoldig'i",
    items: [
      { title: "Sotib olish", articleId: "purchases/purchase" },
      { title: "Sotuv", articleId: "sales/sale" },
      { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
      { title: "Inventarizatsiya", articleId: "warehouse/inventory" },
    ],
  },
  steps: [
    {
      title: "Omborni tanlang",
      text: "Barcha omborlar yig'indisi uchun maydonni bo'sh qoldiring yoki bitta omborni tanlang.",
    },
    {
      title: "Guruhni oching",
      text: "Guruh qatoridagi «+» ni bosing — har bir tovar qoldig'i, tannarxi va summasi chiqadi.",
    },
    {
      title: "Qidiring",
      text: "Tovar yoki guruh nomini yozing — mos guruhlar o'zi ochiladi.",
    },
    {
      title: "Markirovkalarni ko'ring",
      text: "Markirovkali tovarda «CH» tugmasi omborda turgan har bir kodni ko'rsatadi.",
    },
  ],
  fieldGroups: [
    {
      title: "Filtrlar",
      fields: [
        {
          n: 1,
          name: "Qidirish",
          enter: "Guruh yoki tovar nomi (tovar ichida MXIK kodi bo'yicha ham).",
          onChange: "Mos kelgan guruhlar o'zi ochiladi va faqat mos tovarlar ko'rinadi.",
        },
        {
          n: 2,
          name: "Ombor",
          enter: "Bitta ombor. Bo'sh — barcha omborlar qo'shib ko'rsatiladi.",
          onChange: "Ochilgan guruhlar yopiladi, raqamlar shu ombor bo'yicha qayta hisoblanadi.",
        },
        {
          n: 3,
          name: "Yangilash",
          enter: "Ma'lumotni qayta yuklaydi (boshqa oynada hujjat o'tkazilgan bo'lsa).",
        },
      ],
    },
    {
      title: "Guruhlar jadvali",
      fields: [
        {
          n: 4,
          name: "«+» (ochish)",
          enter: "Guruh tovarlarini shu yerda ko'rsatadi. Guruh nomini bossangiz, alohida sahifada ochiladi.",
        },
        {
          n: 5,
          name: "Miqdori · Tannarx · Umumiy narx",
          enter:
            "Guruhdagi barcha tovarlar soni, bir birlikning o'rtacha tannarxi va qoldiqning tannarx bo'yicha jami qiymati.",
          affects: "Umumiy narx guruh ichidagi tovarlar «Umumiy narx» yig'indisiga teng.",
        },
      ],
    },
    {
      title: "Tovarlar jadvali",
      fields: [
        {
          n: 6,
          name: "CH (markirovkalar)",
          enter: "Bosilsa, shu tovarning omborda turgan markirovka kodlari ro'yxati ochiladi (nusxa olish mumkin).",
          affects: "Markirovkasiz tovarda ro'yxat bo'sh — «Markirovkalar topilmadi».",
        },
        {
          n: 7,
          name: "Qoldiq",
          enter: "Hozirgi miqdor (bugungi holat; o'tgan sanadagi qoldiq hujjatlar ichida ko'rinadi).",
          affects: "Sotuv va ko'chirishda shundan ortiq chiqarib bo'lmaydi.",
        },
        {
          n: 8,
          name: "Tannarx",
          enter: "Bir birlikning o'rtacha tannarxi: qoldiq partiyalari qiymati ÷ miqdor.",
          affects:
            "Qo'shimcha xarajat va bojxona deklaratsiyasi partiya tannarxini oshiradi; tovar hisob siyosatidagi usulda chiqadi: FIFO — eng eski partiyadan, o'rtacha — har partiyadan qoldiq ulushiga mutanosib (o'rtacha tannarxda).",
        },
        {
          n: 9,
          name: "Umumiy narx",
          enter: "Qoldiqning tannarx bo'yicha qiymati: har partiya miqdori × birlik tannarxi.",
          affects: "Barcha tovarlar yig'indisi buxgalteriyadagi ombor hisobi (2910) qoldig'iga teng bo'lishi kerak.",
        },
        {
          n: 10,
          name: "Jami",
          enter: "Guruh bo'yicha qoldiq qiymati.",
        },
      ],
    },
  ],
  errors: [
    {
      message: "Tovar ro'yxatda yo'q",
      cause: "Tovar hali kirim qilinmagan yoki boshqa ombor tanlangan.",
      fix: "«Ombor» filtrini tozalang; xarid tasdiqlanganini tekshiring.",
    },
    {
      message: "Qiymat 2910 hisobi qoldig'iga teng emas",
      cause: "Ombor hisobiga qo'lda provodka yozilgan yoki hujjat qayta o'tkazilmagan.",
      fix: "Aylanma-saldo vedomostida 2910 ni tovarlar kesimida solishtiring, kerak bo'lsa hujjatlarni qayta o'tkazing.",
    },
    {
      message: "Markirovka raqami '…' bo'lgan tovar topilmadi.",
      cause: "Qidirilgan kod tizimda yo'q.",
      fix: "Kodni to'liq va to'g'ri kiriting.",
    },
  ],
  tips: [
    "Bitta ombor qoldig'ini tekshirish uchun avval «Ombor» filtrini tanlang, keyin guruhni oching.",
    "Tannarx partiyalardan hisoblanadi: qo'shimcha xarajat yoki boj kiritilgandan keyin bu yerdagi tannarx o'zi oshadi.",
  ],
  topics: [
    { title: "Tovarlar va xizmatlar", articleId: "warehouse/products" },
    { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
    { title: "Qo'shimcha xarajatlar", articleId: "purchases/extra-costs" },
    { title: "Aylanma-saldo vedomosti", articleId: "accounting/trial-balance" },
  ],
};
