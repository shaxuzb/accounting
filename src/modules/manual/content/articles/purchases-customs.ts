import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 700);
const posted = px(1568, 508);

/**
 * «Bojxona deklaratsiyasi» (1C «Таможенная декларация (импорт)»): duty, fee and excise on an
 * import purchase go into the goods' cost and the import VAT is taken to 4410.5, all owed to
 * the budget through 6490. It follows CustomsEditorPage, CustomsDeclarationService,
 * PurchaseBatchCostAllocator and CustomsDeclarationDocContextBuilder; the example is the demo
 * organization's import purchase №2 from China.
 */
export const customsArticle: ManualArticle = {
  id: "purchases/customs",
  sectionId: "purchases",
  title: "Bojxona deklaratsiyasi",
  summary:
    "Import qilingan tovar uchun boj, aksiz, bojxona yig'imi va import QQSni rasmiylashtirish: to'lovlar tovar tannarxiga qo'shiladi, import QQS hisobga olinadi, byudjet oldidagi qarz yoziladi.",
  routes: ["/main/purchases/customs-declarations"],
  screenshots: [
    {
      src: "/manual/purchases/customs-editor.jpg",
      alt: "Bojxona deklaratsiyasini to'ldirish",
      caption:
        "Xaridlar → Bojxona deklaratsiyalari → «Yangi bojxona deklaratsiyasi» yoki o'tkazilgan import xaridi ichidagi «Bojxona deklaratsiyasi» tugmasi. Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 700,
      markers: [
        editor(1, 540, 112, [376, 129, 548, 155]),
        editor(2, 737, 112, [562, 129, 745, 155]),
        editor(3, 1532, 112, [758, 129, 1540, 155]),
        editor(4, 1190, 180, [257, 195, 1199, 222]),
        editor(5, 1362, 182, [1213, 197, 1369, 223]),
        editor(6, 1505, 212, [1380, 200, 1490, 224]),
        editor(7, 667, 246, [257, 263, 675, 292]),
        editor(8, 1100, 246, [689, 263, 1108, 292]),
        editor(9, 1533, 246, [1122, 263, 1541, 292]),
        editor(10, 328, 423, [257, 385, 400, 411]),
        editor(11, 455, 423, [407, 385, 503, 411]),
        editor(12, 700, 533, [550, 562, 712, 645]),
        editor(13, 795, 533, [717, 562, 817, 645]),
        editor(14, 955, 533, [822, 562, 974, 645]),
        editor(15, 1100, 533, [980, 562, 1120, 645]),
        editor(16, 1142, 533, [1124, 562, 1258, 645]),
        editor(17, 1380, 533, [1263, 562, 1393, 645]),
        editor(18, 1525, 533, [1398, 562, 1548, 645]),
        editor(19, 735, 668, [750, 656, 1548, 682], { callout: "Deklaratsiya bo'yicha jami", calloutSide: "left" }),
      ],
    },
    {
      src: "/manual/purchases/customs-posted.jpg",
      alt: "O'tkazilgan bojxona deklaratsiyasi",
      caption: "O'tkazilgandan keyin: to'lovlar va har partiya tannarxiga qancha qo'shilgani.",
      width: 1568,
      height: 508,
      markers: [
        posted(20, 311, 119, [257, 74, 366, 100]),
        posted(21, 417, 119, [372, 74, 463, 100]),
        posted(22, 945, 385, [873, 418, 1205, 500]),
        posted(23, 1357, 347, [1296, 418, 1418, 500]),
      ],
    },
  ],
  purpose:
    "Chet eldan olingan tovar bojxonadan o'tganda to'langan boj, aksiz, bojxona yig'imi va import QQSni hisobga olish. Deklaratsiya import xaridiga bog'lanadi.",
  why:
    "Boj, aksiz va yig'im import tovarining tannarxiga kiradi — ularsiz tovar arzon ko'rinadi va sotuvda foyda noto'g'ri chiqadi. Import QQS esa hisobga olinadigan QQS bo'lib, QQS deklaratsiyasida chegirishga kiradi.",
  prerequisites: [
    { title: "Import xaridi o'tkazilgan (tovar omborga kirgan)", articleId: "purchases/purchase" },
    { title: "Bojxona posti kontragent sifatida yaratilgan (ixtiyoriy)", route: "/main/settings/counterparty" },
    { title: "Hisob rejasida 6490 va 4410.5 (bo'lmasa, o'zi qo'shiladi)", articleId: "start/chart-of-accounts" },
    { title: "Hujjat sanasi ochiq oyda", articleId: "accounting/period-close" },
  ],
  related: {
    center: "Bojxona deklaratsiyasi",
    items: [
      { title: "Import xaridi", articleId: "purchases/purchase" },
      { title: "Qo'shimcha xarajatlar", articleId: "purchases/extra-costs" },
      { title: "Ombor partiyalari", articleId: "warehouse/stock" },
      { title: "Bank: byudjetga to'lov", articleId: "bank/operations" },
    ],
  },
  steps: [
    {
      title: "Xaridni tanlang",
      text: "BYuD raqamini yozing va «Xarid (import)» dan tovar kelgan xaridni tanlang — tovarlar va bojxona qiymati o'zi to'ladi.",
    },
    {
      title: "Bojxona posti va yig'im",
      text: "Bojxona organini tanlang va deklaratsiya bo'yicha bojxona yig'imini kiriting — u tovarlarga o'zi taqsimlanadi.",
    },
    {
      title: "Boj, aksiz va QQS",
      text: "Har tovarga boj foizini (yoki summasini), aksizni va import QQS stavkasini kiriting — QQS o'zi hisoblanadi.",
    },
    {
      title: "Tekshirib o'tkazing",
      text: "Pastdagi jami summalarni BYuD bilan solishtiring va «O'tkazish» ni bosing.",
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
          enter: "BYuD rasmiylashtirilgan sana va vaqt. Standart — hozirgi vaqt.",
          onChange: "Standart hisoblar va QQS to'lovchi belgisi shu sana bo'yicha olinadi.",
          affects: "Xarid sanasidan oldin bo'la olmaydi; yopilgan oyga o'tkazib bo'lmaydi.",
        },
        {
          n: 2,
          name: "Deklaratsiya raqami (BYuD)",
          enter: "Bojxona yuk deklaratsiyasi raqami, masalan 26001/09.10.2026/0001234. Ixtiyoriy.",
          affects:
            "Import QQS provodkasida hisob-faktura sifatida shu raqam yoziladi (bo'sh bo'lsa — hujjat raqami). Ro'yxatda u bo'yicha qidiriladi.",
        },
        {
          n: 3,
          name: "Xarid (import)",
          required: true,
          enter: "Tovarlari bojxonadan o'tgan o'tkazilgan xarid.",
          onChange:
            "Jadval shu xaridning tovar qatorlari bilan qayta to'ladi (xizmatlar kirmaydi): bojxona qiymati = xarid summasi so'mda, QQS stavkasi — xarid qatoridagi. Qo'lda kiritilganlar tozalanadi.",
          affects: "Faqat shu xarid ochgan partiyalar tannarxi oshadi.",
        },
        {
          n: 4,
          name: "Bojxona organi (kontragent)",
          enter: "Bojxona posti, masalan «Toshkent-Tovar bojxona posti». Ixtiyoriy.",
          affects: "Import QQS provodkasida (Dt 4410.5) kontragent analitikasi sifatida yoziladi.",
        },
        {
          n: 5,
          name: "Bojxona yig'imi",
          enter: "Butun deklaratsiya bo'yicha to'langan yig'im.",
          onChange: "Tovarlarga bojxona qiymatiga mutanosib taqsimlanadi («Yig'im ulushi» ustuni); Jami to'lov qayta hisoblanadi.",
          affects: "Tovar tannarxiga qo'shiladi.",
        },
        {
          n: 6,
          name: "Jami to'lov",
          enter: "Avtomatik: boj + aksiz + import QQS + yig'im.",
          affects: "Byudjet oldidagi qarz — Kt 6490 shu summaga.",
        },
      ],
    },
    {
      title: "Hisoblar va tugmalar",
      fields: [
        {
          n: 7,
          name: "Bojxona to'lovlari hisobi (6490)",
          enter: "Odatda 6490 (yoki uning subhisobi). O'zi qo'yiladi.",
          affects: "Barcha provodkalarning kredit hisobi. Rejada bo'lmasa, o'tkazishda namunaviy rejadan o'zi qo'shiladi.",
        },
        {
          n: 8,
          name: "Import QQS hisobi (4410.5)",
          enter: "Odatda 4410.5. Tashkilot QQS to'lovchi bo'lmasa, maydon o'chirilgan.",
          affects: "Import QQS shu hisobga olinadi. Rejada bo'lmasa, o'zi qo'shiladi.",
        },
        {
          n: 9,
          name: "Sotilgan tovar tannarxi hisobi",
          enter: "Odatda 9120. «Hujjat hisoblari sozlamasi» dan olinadi.",
          affects: "Xarid tovarining omborda yo'q qismi ulushi shu hisobga yoziladi.",
        },
        {
          name: "Izoh",
          enter: "Ixtiyoriy matn: konteyner raqami, post va hokazo.",
        },
        {
          n: 10,
          name: "Qoralama saqlash",
          enter: "Deklaratsiyani qoralama sifatida saqlaydi (xarid tanlangandan keyin faol).",
          affects: "Tannarx, provodka va qarzga ta'sir qilmaydi.",
        },
        {
          n: 11,
          name: "O'tkazish",
          enter: "Saqlaydi va o'tkazadi (tasdiqlash huquqi bilan).",
          affects: "Partiyalar tannarxi oshadi, provodkalar yoziladi. To'lov nolga teng bo'lsa, o'tkazilmaydi.",
        },
        {
          name: "O'chirish (savat belgisi)",
          enter: "Saqlangan qoralamani o'chiradi (tasdiqlash so'raladi).",
        },
      ],
    },
    {
      title: "Tovarlar va bojxona to'lovlari",
      fields: [
        {
          n: 12,
          name: "Bojxona qiymati",
          enter: "Tovarning bojxona qiymati so'mda. Xarid summasidan olinadi; BYuD dagi qiymat boshqacha bo'lsa, tuzating.",
          onChange: "Boj va import QQS qayta hisoblanadi.",
          affects: "Boj va QQS hisoblash asosi; yig'im ham shunga mutanosib taqsimlanadi.",
        },
        {
          n: 13,
          name: "Boj, %",
          enter: "Boj stavkasi (4 xonagacha kasr).",
          onChange: "Boj = bojxona qiymati × foiz va import QQS qayta hisoblanadi.",
        },
        {
          n: 14,
          name: "Boj",
          enter: "Boj summasi. Foizdan o'zi hisoblanadi; BYuD dagi summa bilan farq qilsa, qo'lda yozing.",
          onChange: "Import QQS qayta hisoblanadi.",
          affects: "Tovar tannarxiga qo'shiladi.",
        },
        {
          n: 15,
          name: "Aksiz",
          enter: "Aksizli tovar uchun aksiz summasi.",
          onChange: "Import QQS qayta hisoblanadi.",
          affects: "Tovar tannarxiga qo'shiladi.",
        },
        {
          n: 16,
          name: "Yig'im ulushi",
          enter: "Avtomatik: bojxona yig'imining shu tovarga tushgan qismi.",
          affects: "Tovar tannarxiga qo'shiladi.",
        },
        {
          n: 17,
          name: "QQS stavkasi",
          enter: "Import QQS stavkasi (odatda 12%). Xarid qatoridan olinadi — chet el xaridi QQSsiz bo'lsa, bu yerda 12% ni tanlang.",
          onChange: "Import QQS qayta hisoblanadi.",
        },
        {
          n: 18,
          name: "Import QQS",
          enter: "Avtomatik: (bojxona qiymati + boj + aksiz) × stavka. BYuD bilan farq bo'lsa, qo'lda tuzating.",
          affects:
            "QQS to'lovchida — Dt 4410.5 (hisobga olinadi). QQS to'lovchi bo'lmasa — tovar tannarxiga qo'shiladi.",
        },
        {
          n: 19,
          name: "Jami qatori",
          enter: "Bojxona qiymati, boj, aksiz, yig'im va import QQS yig'indilari.",
          affects: "BYuD bilan solishtirish uchun.",
        },
      ],
    },
    {
      title: "O'tkazilgan deklaratsiya",
      fields: [
        {
          n: 20,
          name: "Bekor qilish",
          enter: "O'tkazilgan deklaratsiyani bekor qiladi (tasdiqlash so'raladi).",
          onChange: "Partiyalar tannarxidan qo'shilgan summa ayiriladi, provodkalar storno qilinadi.",
          affects: "Deklaratsiyadan keyin partiyadan tovar sotilgan yoki ko'chirilgan bo'lsa, rad etiladi.",
        },
        {
          n: 21,
          name: "Provodkalar",
          enter: "Deklaratsiya yozgan provodkalarni ochadi.",
        },
        {
          n: 22,
          name: "Natija",
          enter: "«Omborda — tannarx oshdi» yoki «Sotilgan — 9120 ga» (tovar deklaratsiyadan oldin chiqib ketgan bo'lsa).",
        },
        {
          n: 23,
          name: "Birlik tannarxiga qo'shildi",
          enter: "Har donaning tannarxi qanchaga oshgani: (boj + yig'im ulushi + aksiz) ÷ miqdor.",
          affects: "Masalan, choynak: (1 900 000 + 247 000) ÷ 200 = 10 735 so'm har donaga.",
        },
      ],
    },
  ],
  postings: {
    intro:
      "Misol: Xitoydan 200 ta choynak (19 000 000, boj 10%) va 50 ta changyutgich (31 000 000, boj 5%), yig'im 650 000, import QQS 12%.",
    entries: [
      {
        when: "Boj, yig'im va aksiz — omborda turgan tovar",
        debit: "2910",
        credit: "6490",
        amount: "Choynak 2 147 000; changyutgich 1 953 000",
        note: "Har partiya bo'yicha; partiyaning birlik tannarxi oshadi. Boshqa omborga ko'chirilgan qismi o'sha partiyaga yoziladi.",
      },
      {
        when: "Boj, yig'im va aksiz — omborda yo'q qism",
        debit: "9120",
        credit: "6490",
        amount: "Sotilgan qism ulushi",
        note: "Tovar deklaratsiyadan oldin sotilgan bo'lsa.",
      },
      {
        when: "Import QQS",
        debit: "4410.5",
        credit: "6490",
        amount: "6 414 000",
        note: "Faqat QQS to'lovchida; analitika — bojxona posti va BYuD raqami.",
      },
    ],
    cancel:
      "partiyalar tannarxi qaytariladi va provodkalar storno qilinadi. Deklaratsiyadan keyin tovar sotilgan yoki ko'chirilgan bo'lsa, avval o'sha hujjatlarni bekor qilish kerak. Deklaratsiyasi bor xaridni bekor qilib bo'lmaydi.",
  },
  errors: [
    {
      message: "Bojxona deklaratsiyasi faqat o'tkazilgan xarid tovarlariga rasmiylashtiriladi.",
      cause: "Tanlangan xarid qoralama yoki bekor qilingan.",
      fix: "Avval import xaridini tasdiqlang.",
    },
    {
      message: "Deklaratsiya sanasi xarid sanasidan oldin bo'lishi mumkin emas.",
      cause: "Sana xarid sanasidan oldinroq.",
      fix: "Sanani xarid sanasi yoki undan keyinga o'zgartiring.",
    },
    {
      message: "Deklaratsiyada kamida bitta tovar qatori bo'lishi kerak.",
      cause: "Xaridda tovar yo'q (faqat xizmat) yoki qatorlar o'chirilgan.",
      fix: "Tovarli xaridni tanlang.",
    },
    {
      message: "Deklaratsiyada to'lov yo'q: boj, aksiz, yig'im yoki QQS summasini kiriting.",
      cause: "Barcha to'lovlar 0.",
      fix: "Kamida bitta to'lovni kiriting.",
    },
    {
      message: "Hisob ko'rsatilmagan va rejada topilmadi: … Hujjatda tanlang.",
      cause: "9120 (yoki 6490/4410.5) hisobini topib bo'lmadi.",
      fix: "Hisobni hujjatda tanlang yoki hujjat hisoblari sozlamasida belgilang.",
    },
    {
      message: "«…»: deklaratsiyadan keyin tovar sotilgan yoki ko'chirilgan — u oshgan tannarx bilan chiqqan. Avval o'sha hujjatlarni bekor qiling.",
      cause: "Bekor qilmoqchisiz, lekin partiyadan tovar keyin chiqqan.",
      fix: "Avval keyingi sotuv yoki ko'chirishni bekor qiling.",
    },
    {
      message: "Bu xarid tovarlariga bojxona deklaratsiyasi o'tkazilgan — avval deklaratsiyani bekor qiling.",
      cause: "Xaridni bekor qilmoqchisiz.",
      fix: "Avval deklaratsiyani, keyin xaridni bekor qiling.",
    },
  ],
  tips: [
    "Deklaratsiyani tovar sotilishidan oldin kiriting — boj va yig'im to'liq partiya tannarxiga kiradi.",
    "Import QQS bojxona qiymati, boj va aksizdan hisoblanadi; BYuD dagi summa bilan tiyinigacha farq qilsa, «Import QQS» ni qo'lda tuzating.",
    "Byudjetga to'lov bank orqali Dt 6490 bilan yopiladi.",
  ],
  topics: [
    { title: "Sotib olish", articleId: "purchases/purchase" },
    { title: "Qo'shimcha xarajatlar", articleId: "purchases/extra-costs" },
    { title: "Bank operatsiyalari", articleId: "bank/operations" },
    { title: "Hisoblar rejasi", articleId: "start/chart-of-accounts" },
  ],
};
