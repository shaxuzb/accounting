import type { ManualArticle } from "../../types";
import { px } from "./px";

const list = px(1568, 250);
const editor = px(1568, 665);
const posted = px(1338, 330);

/**
 * «Omborlararo ko'chirish»: goods moved from one warehouse to another at their cost. It follows
 * WarehouseTransferListPage, WarehouseTransferDetailPage, WarehouseTransferLifecycleService and
 * WarehouseTransferContextBuilder; the example is the demo organization's transfer of 40 kettles
 * and 10 vacuum cleaners to its Chilonzor shop.
 */
export const transfersArticle: ManualArticle = {
  id: "warehouse/transfers",
  sectionId: "warehouse",
  title: "Omborlararo ko'chirish",
  summary:
    "Tovarni bir ombordan boshqasiga ko'chirish: hujjatni to'ldirish, tasdiqlash, tannarx bilan provodka va bekor qilish.",
  routes: ["/main/warehouses/transfers"],
  screenshots: [
    {
      src: "/manual/warehouse/transfer-list.jpg",
      alt: "Ko'chirishlar ro'yxati",
      caption: "Ombor → Omborlar orasida ko'chirish. Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 250,
      markers: [
        list(1, 1430, 96, [1430, 96, 1521, 121]),
        list(2, 390, 146, [283, 165, 405, 235]),
        list(3, 570, 146, [405, 165, 577, 235]),
        list(4, 1282, 146, [1265, 165, 1388, 235]),
        list(5, 1458, 146, [1390, 165, 1462, 235]),
        list(6, 1540, 146, [1464, 165, 1540, 235]),
      ],
    },
    {
      src: "/manual/warehouse/transfer-editor.jpg",
      alt: "Yangi ko'chirish hujjati",
      caption: "«Qo'shish» bosilganda ochiladigan hujjat.",
      width: 1568,
      height: 665,
      markers: [
        editor(7, 520, 196, [256, 212, 527, 242]),
        editor(8, 798, 196, [538, 212, 806, 242]),
        editor(9, 1080, 196, [819, 212, 1088, 242]),
        editor(10, 1080, 271, [256, 288, 1088, 318]),
        editor(11, 1529, 213, [1127, 213, 1529, 239]),
        editor(12, 1529, 249, [1127, 249, 1529, 275]),
        editor(13, 1529, 285, [1127, 285, 1529, 311]),
        editor(14, 955, 390, [962, 378, 1087, 403]),
        editor(15, 657, 472, [270, 488, 664, 517]),
        editor(16, 862, 472, [678, 488, 869, 518]),
        editor(17, 1066, 472, [882, 488, 1073, 518]),
        editor(18, 300, 609, [270, 624, 347, 644]),
        editor(19, 470, 609, [448, 624, 660, 644]),
        editor(20, 1035, 440, [1052, 430, 1068, 450]),
      ],
    },
    {
      src: "/manual/warehouse/transfer-posted.jpg",
      alt: "Tasdiqlangan ko'chirish",
      caption: "Tasdiqlangan ko'chirish: maydonlar qulflanadi, «Qoldiq» endi ko'chirishdan keyingi miqdorni ko'rsatadi.",
      width: 1338,
      height: 330,
      markers: [
        posted(21, 1100, 38, [1117, 26, 1205, 50]),
        posted(22, 1299, 195, [897, 195, 1299, 221]),
        posted(23, 1299, 287, [897, 287, 1299, 313]),
      ],
    },
  ],
  purpose:
    "Tovarni bir ombordan (masalan, markaziy ombor) boshqasiga (do'kon) o'tkazish. Tovar o'z tannarxi bilan ko'chadi, foyda yoki zarar yuzaga kelmaydi.",
  why:
    "Har ombor qoldig'i alohida yuritiladi: do'konda sotish uchun tovar avval o'sha omborga ko'chirilishi kerak, aks holda sotuvda «yetarli emas» xatosi chiqadi.",
  prerequisites: [
    { title: "Kamida ikkita faol ombor bor", route: "/main/settings/warehouse" },
    { title: "Manba omborda tovar qoldig'i bor", articleId: "warehouse/stock" },
    { title: "Hujjat hisoblari sozlamasida «Omborlararo ko'chirish» uchun 2910", articleId: "start/document-accounts" },
    { title: "Ikkala omborda ham faol inventarizatsiya yo'q", articleId: "warehouse/inventory" },
  ],
  related: {
    center: "Ko'chirish",
    items: [
      { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
      { title: "Sotuv", articleId: "sales/sale" },
      { title: "Inventarizatsiya", articleId: "warehouse/inventory" },
      { title: "Provodkalar jurnali", articleId: "accounting/journal" },
    ],
  },
  steps: [
    {
      title: "Omborlarni tanlang",
      text: "«Qo'shish» → sana, manba ombor (qayerdan) va qabul qiluvchi ombor (qayerga).",
    },
    {
      title: "Tovarlarni kiriting",
      text: "Har qatorda tovar va miqdor. «Qoldiq» belgisi manba omborda hujjat sanasida qancha borligini ko'rsatadi.",
    },
    {
      title: "Saqlang",
      text: "«Saqlash» — hujjat qoralama sifatida yoziladi va ochiq qoladi.",
    },
    {
      title: "Tasdiqlang",
      text: "«Tasdiqlash» — tovar ko'chadi va provodka yoziladi.",
    },
  ],
  fieldGroups: [
    {
      title: "Ro'yxat",
      fields: [
        { n: 1, name: "Qo'shish", enter: "Yangi ko'chirish hujjatini ochadi." },
        { n: 2, name: "Hujjat raqami", enter: "Saqlashda avtomatik beriladi. Bosilsa, hujjat ochiladi." },
        { n: 3, name: "Provodkalar hisoboti", enter: "Tasdiqlangan hujjat provodkalarini ochadi (qoralamada o'chiq)." },
        {
          n: 4,
          name: "Holati",
          enter: "Qoralama, O'tkazilgan yoki Bekor qilingan.",
          affects: "Faqat o'tkazilgan ko'chirish qoldiqqa ta'sir qiladi.",
        },
        {
          n: 5,
          name: "Faolligi",
          enter: "Aktiv yoki Passiv. O'chirilgan qoralama ro'yxatda «Passiv» bo'lib qoladi.",
        },
        {
          n: 6,
          name: "Amallar",
          enter: "Tahrirlash va o'chirish — faqat qoralama uchun.",
        },
      ],
    },
    {
      title: "Hujjat sarlavhasi",
      fields: [
        {
          n: 7,
          name: "Sana",
          required: true,
          enter: "Ko'chirish sanasi. Standart — bugun.",
          onChange: "Qatorlardagi «Qoldiq» shu sana bo'yicha qayta hisoblanadi.",
          affects: "Tovar shu sanada mavjud partiyalardan chiqadi; yopilgan oyga tasdiqlab bo'lmaydi.",
        },
        {
          n: 8,
          name: "Manba ombor",
          required: true,
          enter: "Tovar chiqadigan ombor.",
          onChange: "Tovarlar ro'yxati va qoldiqlar shu ombor bo'yicha yuklanadi. Tanlanmaguncha tovar tanlab bo'lmaydi.",
          affects: "Provodkada kredit tomondagi ombor analitikasi.",
        },
        {
          n: 9,
          name: "Qabul qiluvchi ombor",
          required: true,
          enter: "Tovar kiradigan ombor. Manba ombordan farqli bo'lishi shart.",
          affects: "Provodkada debet tomondagi ombor; bu yerda yangi partiya ochiladi.",
        },
        { n: 10, name: "Izoh", enter: "Ixtiyoriy: sabab, mas'ul shaxs va hokazo." },
      ],
    },
    {
      title: "Amallar",
      fields: [
        {
          n: 11,
          name: "Saqlash",
          enter: "Qoralamani saqlaydi. Yangi hujjat saqlangach, shu hujjat ochiq qoladi.",
          affects: "Qoldiq va provodkaga ta'sir qilmaydi.",
        },
        {
          n: 12,
          name: "Tasdiqlash",
          enter: "Saqlangan qoralamani o'tkazadi (saqlanmagan o'zgarishlar avval saqlanadi).",
          affects: "Tovar manba ombordan chiqib qabul qiluvchi omborga kiradi, provodka yoziladi.",
        },
        {
          n: 13,
          name: "Bekor qilish",
          enter: "Qoralamani «Bekor qilingan» holatiga o'tkazadi (tasdiqlash so'ralmaydi).",
        },
      ],
    },
    {
      title: "Mahsulot qatorlari",
      fields: [
        { n: 14, name: "Qator qo'shish", enter: "Yangi qator qo'shadi." },
        {
          n: 15,
          name: "Mahsulot nomi",
          required: true,
          enter: "Manba ombordagi tovar.",
          onChange: "Qoldiq bo'lsa miqdor 1 qo'yiladi, birlik o'zi to'ladi; markirovkali tovarda kod tanlash oynasi ochiladi.",
        },
        {
          n: 16,
          name: "Miqdor",
          required: true,
          enter: "Ko'chiriladigan miqdor. Markirovkali tovarda — tanlangan kodlar soni.",
          affects: "Qoldiqdan ko'p bo'lsa, tasdiqlashda xato chiqadi.",
        },
        { n: 17, name: "Birlik", enter: "Tovardan o'zi to'ladi." },
        {
          n: 18,
          name: "Qoldiq",
          enter: "Manba omborda hujjat sanasidagi qoldiq.",
        },
        {
          n: 19,
          name: "Markirovka",
          enter:
            "Markirovkali tovar uchun kodlarni tanlash oynasi. Markirovkasiz tovarda o'chiq — «Bu mahsulot markirovkasiz».",
          affects: "Tanlangan kodlar qabul qiluvchi omborga o'tadi.",
        },
        { n: 20, name: "Qatorni o'chirish", enter: "Qatorni olib tashlaydi (oxirgi qatorni o'chirib bo'lmaydi)." },
      ],
    },
    {
      title: "Tasdiqlangan hujjat",
      fields: [
        { n: 21, name: "Holat", enter: "«O'tkazilgan» — hujjat qulflangan." },
        {
          n: 22,
          name: "Ko'chirishni bekor qilish",
          enter: "Tasdiqlash so'raladi.",
          onChange: "Provodkalar storno qilinadi, tovar va markirovkali donalar manba omborga qaytadi, hujjat «Bekor qilingan» bo'ladi.",
          affects: "Ko'chirilgan markirovkali dona keyin sotilgan yoki yana ko'chirilgan bo'lsa, bekor qilib bo'lmaydi.",
        },
        { n: 23, name: "Provodkalar hisoboti", enter: "Hujjat provodkalarini ochadi." },
      ],
    },
  ],
  postings: {
    intro: "Misol: 40 ta choynak (tannarx 105 735) va 10 ta changyutgich (659 060) Markaziy ombordan Chilonzor do'koniga.",
    entries: [
      {
        when: "Tovar ko'chdi",
        debit: "2910 (Chilonzor do'koni)",
        credit: "2910 (Markaziy ombor)",
        amount: "Choynak 4 229 400; changyutgich 6 590 600",
        note: "Bir xil hisob, farq faqat ombor analitikasida. Summa — manba partiyalarning FIFO bo'yicha tannarxi; qabul qiluvchi omborda shu tannarx bilan yangi partiya ochiladi.",
      },
    ],
    cancel:
      "provodkalar storno qilinadi, tovar manba omborga qaytadi. Ko'chirilgan tovar qabul qiluvchi omborda sotilgan bo'lsa, avval o'sha sotuvni bekor qiling.",
  },
  errors: [
    {
      message: "Majburiy maydonlarni to'ldiring",
      cause: "Sana, ombor, tovar, birlik yoki miqdor bo'sh.",
      fix: "Bo'sh maydonlarni to'ldiring.",
    },
    {
      message: "Jo'natuvchi va qabul qiluvchi omborlar turli bo'lishi kerak.",
      cause: "Ikkala ombor bir xil tanlangan.",
      fix: "Qabul qiluvchi omborni o'zgartiring.",
    },
    {
      message: "«…» omborida «…» yetarli emas (hujjat sanasidagi qoldiq): kerak …, mavjud …",
      cause: "Miqdor manba ombordagi qoldiqdan ko'p yoki sana tovar kirimidan oldin.",
      fix: "Miqdorni kamaytiring yoki sanani tekshiring.",
    },
    {
      message: "… xizmat mahsulotini omborlararo ko'chirishda ishlatib bo'lmaydi.",
      cause: "Qatorda xizmat tanlangan.",
      fix: "Faqat tovarlarni ko'chiring.",
    },
    {
      message: "Ko'chirish uchun zaxira hisobi sozlanmagan. …",
      cause: "Hujjat hisoblari sozlamasida «Omborlararo ko'chirish» uchun hisob yo'q.",
      fix: "Sozlamalar → Hujjat-hisob sozlamalarida 2910 ni tanlang.",
    },
    {
      message: "…-omborda faol inventarizatsiya mavjud. …",
      cause: "Manba yoki qabul qiluvchi omborda inventarizatsiya o'tkazilmoqda.",
      fix: "Inventarizatsiyani yakunlang, keyin tasdiqlang.",
    },
    {
      message: "… hisob davri yopilgan",
      cause: "Sana yopilgan oyda.",
      fix: "Sanani ochiq oyga o'zgartiring.",
    },
  ],
  tips: [
    "Ko'chirish faqat ombor analitikasini o'zgartiradi: 2910 hisobining umumiy qoldig'i va tannarx o'zgarmaydi.",
    "Do'konda sotishdan oldin tovarni ko'chiring — sotuv faqat tanlangan ombor qoldig'idan chiqadi.",
  ],
  topics: [
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Inventarizatsiya", articleId: "warehouse/inventory" },
    { title: "Sotuv", articleId: "sales/sale" },
    { title: "Hujjat hisoblari sozlamasi", articleId: "start/document-accounts" },
  ],
};
