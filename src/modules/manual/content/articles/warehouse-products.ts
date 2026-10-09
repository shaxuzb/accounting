import type { ManualArticle } from "../../types";
import { px } from "./px";

const list = px(1568, 400);
const group = px(1568, 520);
const modal = px(492, 468);

/**
 * «Tovarlar va xizmatlar»: the catalog, kept as product groups with their products (or service
 * groups with services). It follows ProductListPage, ProductAddEditPage, ProductItemModal and
 * ProductGroupService; the example is the demo organization's «Maishiy texnika» group.
 */
export const productsArticle: ManualArticle = {
  id: "warehouse/products",
  sectionId: "warehouse",
  title: "Tovarlar va xizmatlar",
  summary:
    "Tovar va xizmatlar katalogi: guruh yaratish, guruh ichida tovar qo'shish, MXIK kodi, birlik, QQS stavkasi va markirovka belgisi.",
  routes: ["/main/warehouses/products"],
  screenshots: [
    {
      src: "/manual/warehouse/products-list.jpg",
      alt: "Mahsulotlar ro'yxati",
      caption: "Ombor → Mahsulotlar. Guruh qatorini «+» bilan ochsangiz, ichidagi tovarlar ko'rinadi.",
      width: 1568,
      height: 400,
      markers: [
        list(1, 395, 62, [244, 61, 394, 84]),
        list(2, 588, 62, [404, 61, 588, 84]),
        list(3, 1462, 62, [1462, 61, 1555, 84]),
        list(4, 263, 118, [255, 137, 272, 153]),
        list(5, 430, 145, [320, 133, 415, 157]),
        list(6, 755, 183, [283, 166, 1540, 375]),
        list(7, 1525, 145, [1488, 133, 1512, 157]),
      ],
    },
    {
      src: "/manual/warehouse/product-group.jpg",
      alt: "Mahsulot guruhini o'zgartirish",
      caption: "Guruh nomini bosganda ochiladigan sahifa: guruh va uning tovarlari.",
      width: 1568,
      height: 520,
      markers: [
        group(8, 412, 122, [322, 112, 399, 133]),
        group(9, 670, 155, [257, 170, 677, 200]),
        group(10, 1101, 155, [688, 170, 1109, 200]),
        group(11, 1460, 122, [1473, 110, 1540, 134]),
        group(12, 1408, 271, [1419, 258, 1540, 284]),
        group(13, 945, 308, [840, 325, 1087, 508]),
        group(14, 1215, 308, [1088, 325, 1232, 508]),
        group(15, 1420, 308, [1348, 325, 1428, 508]),
        group(16, 1522, 308, [1430, 325, 1525, 508]),
      ],
    },
    {
      src: "/manual/warehouse/product-modal.jpg",
      alt: "Mahsulotni o'zgartirish oynasi",
      caption: "«Mahsulot yaratish» yoki qalam belgisi bilan ochiladigan oyna.",
      width: 492,
      height: 468,
      markers: [
        modal(17, 233, 51, [20, 67, 240, 98]),
        modal(18, 465, 51, [251, 67, 472, 98]),
        modal(19, 233, 127, [20, 143, 240, 174]),
        modal(20, 465, 127, [251, 143, 472, 174]),
        modal(21, 465, 202, [20, 218, 472, 249]),
        modal(22, 465, 278, [20, 294, 472, 325]),
        modal(23, 205, 357, [20, 344, 189, 371]),
        modal(24, 440, 353, [251, 346, 472, 396]),
        modal(25, 395, 428, [404, 415, 472, 441]),
      ],
    },
  ],
  purpose:
    "Tashkilot sotib oladigan va sotadigan har bir tovar va xizmatni bir marta katalogga kiritish. Keyin xarid, sotuv, ko'chirish va boshqa hujjatlarda faqat ro'yxatdan tanlanadi.",
  why:
    "Ombor qoldig'i, tannarx va hisobotlar tovar kesimida yuritiladi. MXIK kodi va birlik hisob-faktura va soliq hisobotlari uchun majburiy; QQS stavkasi va markirovka belgisi hujjatlarni o'zi to'ldiradi.",
  prerequisites: [
    { title: "Tovarning MXIK (IKPU) kodi ma'lum — 17 raqam" },
    { title: "Qaysi tovarlar markirovka bilan yuritilishi aniq" },
  ],
  related: {
    center: "Tovar",
    items: [
      { title: "Sotib olish", articleId: "purchases/purchase" },
      { title: "Sotuv", articleId: "sales/sale" },
      { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
      { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
    ],
  },
  steps: [
    {
      title: "Guruh yarating",
      text: "«Mahsulotlar» yoki «Servislar» ni tanlang, «Qo'shish» ni bosing va guruh nomini yozing (masalan, «Maishiy texnika»).",
    },
    {
      title: "Tovar qo'shing",
      text: "«Mahsulot yaratish» ni bosing: nomi, MXIK, birlik, QQS stavkasi va markirovka belgisini kiriting, oynada «Saqlash».",
    },
    {
      title: "Guruhni saqlang",
      text: "Oynadagi «Saqlash» faqat ro'yxatga qo'shadi — barchasini bazaga yozish uchun sahifaning yuqorisidagi «Saqlash» ni bosing.",
    },
    {
      title: "Hujjatlarda tanlang",
      text: "Tovar endi xarid, sotuv va ko'chirish hujjatlarida ro'yxatdan chiqadi.",
    },
  ],
  fieldGroups: [
    {
      title: "Ro'yxat sahifasi",
      fields: [
        {
          n: 1,
          name: "Mahsulotlar / Servislar",
          enter: "Tovar guruhlari yoki xizmat guruhlari o'rtasida almashtirish.",
          affects: "Xizmatlar omborga kirmaydi va qoldiqqa ega bo'lmaydi.",
        },
        {
          n: 2,
          name: "Qidirish",
          enter: "Guruh yoki tovar nomi bo'yicha. Mos kelgan guruhlar o'zi ochiladi va topilgan tovarlar ko'rsatiladi.",
        },
        {
          n: 3,
          name: "Qo'shish",
          enter: "Yangi guruh sahifasini ochadi.",
        },
        {
          n: 4,
          name: "«+» (ochish)",
          enter: "Guruh ichidagi tovarlarni shu yerda ko'rsatadi.",
        },
        {
          n: 5,
          name: "Mahsulot turi (guruh nomi)",
          enter: "Bosilsa, guruhni tahrirlash sahifasi ochiladi.",
        },
        {
          n: 6,
          name: "Guruh tovarlari",
          enter: "Mahsulot nomi, MXIK kodi, shtrix-kod, birlik va holati.",
        },
        {
          n: 7,
          name: "Amallar",
          enter: "Guruhni tahrirlash yoki o'chirish.",
          affects: "O'chirilgan guruh passiv bo'ladi — ma'lumotlar yo'qolmaydi.",
        },
      ],
    },
    {
      title: "Guruh sahifasi",
      fields: [
        {
          n: 8,
          name: "Guruh turi",
          enter: "«Mahsulotlar» yoki «Servislar» — o'zgartirilmaydi.",
          affects: "Guruhdagi barcha qatorlar shu turda bo'ladi (tovar yoki xizmat).",
        },
        {
          n: 9,
          name: "Nomi",
          required: true,
          enter: "Guruh nomi, 250 belgigacha.",
        },
        {
          n: 10,
          name: "Holati",
          enter: "Faqat tahrirlashda: Aktiv yoki Passiv.",
        },
        {
          n: 11,
          name: "Saqlash",
          enter: "Guruhni va undagi barcha tovar o'zgarishlarini bazaga yozadi. O'zgarish bo'lmasa, o'chiq turadi.",
          affects: "Bosilmasa, oynada qo'shilgan tovarlar saqlanmaydi.",
        },
        {
          n: 12,
          name: "Mahsulot yaratish",
          enter: "Yangi tovar (yoki «Servis yaratish» — xizmat) oynasini ochadi.",
        },
        {
          n: 13,
          name: "Sotiladi / Xarid qilinadi",
          enter: "Tovar sotiladimi va sotib olinadimi — Ha/Yo'q.",
        },
        {
          n: 14,
          name: "Markirovkali",
          enter: "Ha — har dona o'z kodi bilan hisoblanadi; Yo'q — miqdor bo'yicha.",
        },
        {
          n: 15,
          name: "Holati",
          enter: "«Yangi» (hali saqlanmagan), «Faol» yoki «Deaktiv».",
          affects: "Deaktiv tovar hujjatlarda tanlanmaydi.",
        },
        {
          n: 16,
          name: "Amallar",
          enter: "Qalam — tahrirlash oynasi; savat — o'chirish.",
          affects:
            "Saqlanmagan yangi qator butunlay o'chadi; saqlangan tovar «Deaktiv» bo'ladi (hech qachon butunlay o'chirilmaydi — eski hujjatlar uchun).",
        },
      ],
    },
    {
      title: "Tovar oynasi",
      fields: [
        {
          n: 17,
          name: "Nomi",
          required: true,
          enter: "Tovarning to'liq nomi, masalan «Elektr choynak 1,7 L».",
          affects: "Hujjatlar, hisob-faktura va hisobotlarda shu nom chiqadi.",
        },
        {
          n: 18,
          name: "MXIK",
          enter: "Mahsulot va xizmatlarning identifikatsiya kodi — aynan 17 raqam. Ixtiyoriy, lekin hisob-faktura uchun kerak.",
          affects:
            "Excel'dan xarid importida tovar MXIK bo'yicha topiladi; hisob-faktura va soliq hisobotlarida ko'rinadi.",
        },
        {
          n: 19,
          name: "Birlik",
          required: true,
          enter: "O'lchov birligi: dona, kg, litr va hokazo.",
          affects: "Hujjat qatorida birlik o'zi qo'yiladi.",
        },
        {
          n: 20,
          name: "Standart QQS stavkasi",
          enter: "Tovarning odatiy QQS stavkasi (12%, 0%, QQSsiz ...). Ixtiyoriy.",
          affects: "Xarid va sotuv qatorida tovar tanlanganda stavka o'zi qo'yiladi (keyin o'zgartirish mumkin).",
        },
        {
          n: 21,
          name: "Ma'lumot",
          enter: "Qo'shimcha izoh, 1000 belgigacha.",
        },
        {
          n: 22,
          name: "Holati",
          enter: "Faqat mavjud tovarni tahrirlashda: Aktiv yoki Deaktiv.",
        },
        {
          n: 23,
          name: "Sotiladi / Xarid qilinadi",
          enter: "Ikkala tugma ham standart yoqilgan. Kamida bittasi yoqilgan bo'lishi shart.",
        },
        {
          n: 24,
          name: "Markirovkali",
          enter:
            "Faqat tovarlarda. Yoqilsa — har dona o'z markirovka kodi bilan hisobga olinadi; o'chiq — miqdor bo'yicha. Yangi tovarda standart yoqilgan.",
          onChange: "Tovar bo'yicha omborda harakat bo'lgandan keyin o'zgartirib bo'lmaydi.",
          affects:
            "Xarid, ko'chirish va qaytarishda markirovka kodlarini kiritish/tanlash oynasi ochiladi; ombor qoldig'ida kodlar ro'yxati ko'rinadi.",
        },
        {
          n: 25,
          name: "Saqlash (oynada)",
          enter: "Tovarni guruh ro'yxatiga qo'shadi yoki o'zgartiradi.",
          affects: "Bazaga hali yozilmaydi — guruh sahifasidagi «Saqlash» ni bosing.",
        },
      ],
    },
  ],
  errors: [
    {
      message: "… majburiy",
      cause: "Nomi yoki birlik bo'sh.",
      fix: "Majburiy maydonlarni to'ldiring.",
    },
    {
      message: "MXIK aynan 17 ta raqamdan iborat bo'lishi kerak",
      cause: "MXIK kodi qisqa yoki uzun.",
      fix: "Kodni tekshiring (tasnif.soliq.uz) yoki maydonni bo'sh qoldiring.",
    },
    {
      message: "Mahsulot «Sotiladi» yoki «Xarid qilinadi»dan kamida bittasi bilan belgilanishi kerak",
      cause: "Ikkala tugma ham o'chirilgan.",
      fix: "Kamida bittasini yoqing.",
    },
    {
      message: "'…' bo'yicha omborda harakat bor — markirovkali/markirovkasiz hisobini endi o'zgartirib bo'lmaydi.",
      cause: "Tovar allaqachon xarid yoki boshqa hujjatda ishlatilgan.",
      fix: "Hisob usulini o'zgartirish kerak bo'lsa, yangi tovar yarating.",
    },
    {
      message: "Kodi '…' bo'lgan tovar guruhi allaqachon mavjud.",
      cause: "Shunday guruh oldin yaratilgan.",
      fix: "Mavjud guruhni oching va unga tovar qo'shing.",
    },
  ],
  tips: [
    "Markirovka belgisini birinchi xariddan oldin to'g'ri qo'ying — keyin o'zgartirib bo'lmaydi.",
    "Xizmatlarni (transport, ijara, maslahat) «Servislar» bo'limida alohida guruhga kiriting.",
    "Katalogda yo'q tovarlarni xarid importida «Topilmagan MXIK kodlarini belgilash» bilan ham birdaniga yaratish mumkin.",
  ],
  topics: [
    { title: "Sotib olish", articleId: "purchases/purchase" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
    { title: "Sotuv", articleId: "sales/sale" },
  ],
};
