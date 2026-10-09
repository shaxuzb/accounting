import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 750);

/**
 * «Qo'shimcha xarajatlar» (1C «Поступление доп. расходов»): transport, loading and similar costs
 * added to a posted purchase's goods. It follows ExtraCostEditorPage, PurchaseExtraCostService,
 * PurchaseBatchCostAllocator and PurchaseExtraCostDocContextBuilder; the example is the demo
 * organization's transport cost on purchase №1 after one washing machine went back.
 */
export const extraCostsArticle: ManualArticle = {
  id: "purchases/extra-costs",
  sectionId: "purchases",
  title: "Qo'shimcha xarajatlar",
  summary:
    "Transport, yuklash-tushirish va boshqa xarajatlarni xarid qilingan tovarlar tannarxiga qo'shish: xarajat tovarlarga taqsimlanadi, omborda qolgan tovarning tannarxi oshadi.",
  routes: ["/main/purchases/extra-costs"],
  screenshots: [
    {
      src: "/manual/purchases/extra-cost-editor.jpg",
      alt: "Qo'shimcha xarajat hujjatini to'ldirish",
      caption:
        "Xaridlar → Qo'shimcha xarajatlar → «Yangi qo'shimcha xarajat» yoki o'tkazilgan xarid ichidagi «Qo'shimcha xarajat» tugmasi. Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 750,
      markers: [
        editor(1, 540, 112, [376, 129, 548, 155]),
        editor(2, 1520, 112, [562, 129, 1528, 155]),
        editor(3, 878, 180, [257, 195, 886, 222]),
        editor(4, 1520, 184, [899, 198, 1528, 223]),
        editor(5, 406, 242, [257, 258, 414, 283]),
        editor(6, 577, 242, [427, 258, 585, 283]),
        editor(7, 734, 242, [598, 258, 742, 283]),
        editor(8, 868, 271, [755, 260, 852, 283]),
        editor(9, 1212, 262, [912, 262, 1202, 285]),
        editor(10, 663, 305, [257, 322, 671, 350]),
        editor(11, 1092, 305, [685, 322, 1100, 350]),
        editor(12, 1520, 305, [1113, 322, 1528, 350]),
        editor(13, 1520, 392, [257, 405, 1528, 431]),
        editor(14, 328, 486, [257, 444, 400, 470]),
        editor(15, 455, 486, [407, 444, 503, 470]),
        editor(16, 1425, 593, [1410, 575, 1542, 740], { callout: "Har tovarga tushadigan ulush", calloutSide: "left" }),
      ],
    },
  ],
  purpose:
    "Xaridga bog'liq, lekin boshqa yetkazib beruvchi (yoki o'sha yetkazib beruvchi) alohida hisob bergan xarajatni — transport, yuklash, sug'urta — xarid tovarlarining tannarxiga qo'shish.",
  why:
    "Tovarning haqiqiy tannarxi faqat narxdan emas, uni omborga keltirish xarajatlaridan ham iborat. Xarajat tannarxga kirmasa, sotuvda foyda oshib ko'rinadi, ombor qiymati esa kam bo'ladi.",
  prerequisites: [
    { title: "Xarid o'tkazilgan va unda tovar bor (xizmat emas)", articleId: "purchases/purchase" },
    { title: "Xarajat yetkazib beruvchisi kontragent sifatida yaratilgan", route: "/main/settings/counterparty" },
    { title: "Hujjat hisoblari sozlangan (6010, 4410, 9120)", articleId: "start/document-accounts" },
    { title: "Hujjat sanasi ochiq oyda", articleId: "accounting/period-close" },
  ],
  related: {
    center: "Qo'shimcha xarajat",
    items: [
      { title: "Sotib olish", articleId: "purchases/purchase" },
      { title: "Ombor partiyalari", articleId: "warehouse/stock" },
      { title: "Omborlararo ko'chirish", articleId: "warehouse/transfers" },
      { title: "Sotuv", articleId: "sales/sale" },
    ],
  },
  steps: [
    {
      title: "Xaridni tanlang",
      text: "Xarajat qaysi xarid tovarlariga tegishli bo'lsa, o'shani «Xarid hujjati» dan tanlang yoki xariddan «Qo'shimcha xarajat» tugmasi bilan oching.",
    },
    {
      title: "Kim va nima uchun",
      text: "Xarajatni bergan kontragentni (masalan, transport kompaniyasi) va xarajat mazmunini kiriting.",
    },
    {
      title: "Summa va QQS",
      text: "Summani QQSsiz kiriting, stavkani tanlang — QQS va Jami o'zi hisoblanadi. Taqsimlash usulini tanlang.",
    },
    {
      title: "Taqsimotni tekshirib o'tkazing",
      text: "Pastdagi «Tovarlarga taqsimot» da har tovarga qancha tushishini ko'ring va «O'tkazish» ni bosing.",
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
          enter: "Xarajat hujjati (yuk xati, dalolatnoma) sanasi. Standart — hozirgi vaqt.",
          onChange: "QQS to'lovchi belgisi va standart hisoblar shu sana bo'yicha olinadi.",
          affects: "Xarid sanasidan oldin bo'la olmaydi; yopilgan oyga o'tkazib bo'lmaydi.",
        },
        {
          n: 2,
          name: "Xarid hujjati",
          required: true,
          enter: "Xarajat taqsimlanadigan o'tkazilgan xarid: «№ · sana · yetkazib beruvchi · summa». Raqam bo'yicha qidiriladi, oxirgi 200 ta chiqadi.",
          onChange: "Xarajat yetkazib beruvchisi va shartnoma shu xaridnikiga qaytadi; taqsimot jadvali yangilanadi.",
          affects: "Faqat shu xaridning tovar qatorlari va ular ochgan partiyalar xarajat oladi. Xizmat qatorlari olmaydi.",
        },
        {
          n: 3,
          name: "Xarajat yetkazib beruvchisi",
          enter: "Xarajat uchun hisob bergan kontragent (masalan, transport kompaniyasi). Standart — xaridning yetkazib beruvchisi.",
          onChange: "Boshqa kontragent tanlansa, shartnoma xariddan olinmaydi (tozalanadi).",
          affects: "Shu kontragent oldida qarz (Kt 6010) yoziladi; unga avans berilgan bo'lsa, avans hisobga olinadi.",
        },
        {
          n: 4,
          name: "Xarajat mazmuni",
          enter: "Qanday xarajat: «Transport xizmati», «Yuklash-tushirish» va hokazo.",
          affects: "Ro'yxatda ko'rinadi va u bo'yicha qidirish mumkin.",
        },
      ],
    },
    {
      title: "Summa va taqsimlash",
      fields: [
        {
          n: 5,
          name: "Summa (QQSsiz)",
          required: true,
          enter: "Xarajat summasi QQSsiz, so'mda. Noldan katta bo'lishi shart.",
          onChange: "QQS summasi = summa × stavka avtomatik qayta hisoblanadi; taqsimot jadvali yangilanadi.",
          affects: "QQS to'lovchida shu summa tovarlarga taqsimlanadi.",
        },
        {
          n: 6,
          name: "QQS stavkasi",
          enter: "Xarajat hisob-fakturasidagi stavka (12%, 0%, QQSsiz ...). Tozalash mumkin.",
          onChange: "QQS summasi qayta hisoblanadi.",
        },
        {
          n: 7,
          name: "QQS summasi",
          enter: "Avtomatik hisoblanadi; stavka tanlangandan keyin qo'lda tuzatish mumkin (hisob-fakturadagi summaga moslash uchun).",
          affects:
            "QQS to'lovchida — alohida Dt 4410 Kt 6010. QQS to'lovchi bo'lmasa — QQS ham tannarxga qo'shilib taqsimlanadi.",
        },
        {
          n: 8,
          name: "Jami",
          enter: "Avtomatik: Summa + QQS.",
          affects: "Xarajat yetkazib beruvchisi oldidagi qarz shu summaga oshadi.",
        },
        {
          n: 9,
          name: "Taqsimlash usuli",
          enter:
            "«Summaga mutanosib» (standart) — qimmat tovar ko'proq ulush oladi. «Miqdorga mutanosib» — har dona teng ulush oladi (masalan, og'irligi bir xil tovarlar uchun).",
          onChange: "Taqsimot jadvalidagi ulushlar darhol qayta hisoblanadi.",
          affects: "Har tovar partiyasining tannarxi qanchaga oshishini belgilaydi.",
        },
      ],
    },
    {
      title: "Hisoblar",
      fields: [
        {
          n: 10,
          name: "Yetkazib beruvchi bilan hisob-kitob hisobi",
          enter: "Odatda 6010. «Hujjat hisoblari sozlamasi» dan o'zi qo'yiladi.",
          affects: "Barcha provodkalarning kredit hisobi.",
        },
        {
          n: 11,
          name: "QQS hisobi",
          enter: "Odatda 4410.3. Tashkilot QQS to'lovchi bo'lmasa, maydon o'chirilgan.",
          affects: "Xarajat QQSi shu hisobga olinadi.",
        },
        {
          n: 12,
          name: "Sotilgan tovar tannarxi hisobi",
          enter: "Odatda 9120. Sozlamadan o'zi qo'yiladi.",
          affects: "Xarid tovarining omborda yo'q qismi (sotilgan, qaytarilgan, hisobdan chiqarilgan) ulushi shu hisobga yoziladi.",
        },
        {
          n: 13,
          name: "Izoh",
          enter: "Ixtiyoriy matn, masalan, yuk xati raqami.",
        },
      ],
    },
    {
      title: "Tugmalar va taqsimot",
      fields: [
        {
          n: 14,
          name: "Qoralama saqlash",
          enter: "Hujjatni qoralama sifatida saqlaydi va raqam beradi.",
          affects: "Tannarx, provodka va qarzga ta'sir qilmaydi.",
        },
        {
          n: 15,
          name: "O'tkazish",
          enter: "Saqlaydi va o'tkazadi (tasdiqlash huquqi bilan). O'tkazishda taqsimot xaridning joriy holati bo'yicha qayta hisoblanadi.",
          affects: "Partiyalar tannarxi oshadi, provodkalar yoziladi, qarz yoziladi. Jadval o'rniga «O'tkazish natijasi partiyalar bo'yicha» chiqadi.",
        },
        {
          name: "O'chirish / Bekor qilish / Provodkalar",
          enter:
            "Qoralamani o'chirish (savat belgisi); o'tkazilganni bekor qilish — partiya tannarxi qaytariladi, provodkalar storno qilinadi; «Provodkalar» — yozilgan provodkalarni ochadi.",
          affects: "Xarajat qo'shilgandan keyin tovar sotilgan yoki ko'chirilgan bo'lsa, bekor qilib bo'lmaydi.",
        },
        {
          n: 16,
          name: "Tovarlarga taqsimot",
          enter: "Har tovar: miqdor, tovar summasi va unga tushadigan xarajat ulushi. Qoralamada kiritish bilan birga yangilanadi.",
          affects:
            "O'tkazilgandan keyin har partiya bo'yicha natija ko'rinadi: «Omborda — tannarx oshdi» yoki «Sotilgan — 9120 ga» va birlik tannarxiga qancha qo'shilgani.",
        },
      ],
    },
  ],
  postings: {
    intro:
      "Misol: xarid №1 ga transport 1 500 000 + QQS 180 000, summaga mutanosib. Xariddan 1 dona kir yuvish mashinasi oldin qaytarilgan — uning ulushi omborda emas.",
    entries: [
      {
        when: "Omborda turgan tovar ulushi",
        debit: "2910",
        credit: "6010",
        amount: "Muzlatgich 461 538,46; kir yuvish (3 dona) 246 634,61; konditsioner 709 615,39",
        note: "Har partiya bo'yicha; partiyaning birlik tannarxi oshadi. Boshqa omborga ko'chirilgan qismi o'sha ombordagi partiyaga yoziladi.",
      },
      {
        when: "Omborda yo'q qism ulushi (sotilgan, qaytarilgan)",
        debit: "9120",
        credit: "6010",
        amount: "Kir yuvish (1 dona) — 82 211,54",
        note: "Tovar allaqachon chiqib ketgan — xarajat sotilgan tovar tannarxiga yoziladi.",
      },
      {
        when: "Xarajat QQSi",
        debit: "4410.3",
        credit: "6010",
        amount: "180 000",
        note: "Faqat QQS to'lovchida; aks holda QQS taqsimlanadigan summaga qo'shiladi.",
      },
      {
        when: "Xarajat yetkazib beruvchisiga avans berilgan bo'lsa",
        debit: "6010",
        credit: "4310",
        amount: "Avans va qarzning kichigi",
      },
    ],
    cancel:
      "partiyalar tannarxidan qo'shilgan summa ayiriladi, provodkalar storno qilinadi, qarz kamayadi. Agar xarajat qo'shilgandan keyin partiyadagi tovar sotilgan yoki ko'chirilgan bo'lsa, bekor qilish rad etiladi — avval o'sha hujjatlarni bekor qiling.",
  },
  errors: [
    {
      message: "Qo'shimcha xarajat faqat o'tkazilgan xarid tovarlariga taqsimlanadi.",
      cause: "Tanlangan xarid qoralama yoki bekor qilingan.",
      fix: "Xaridni tasdiqlang yoki boshqa xaridni tanlang.",
    },
    {
      message: "Xaridda tovar yo'q — xarajatni taqsimlaydigan narsa yo'q (xizmatlarga qo'shimcha xarajat taqsimlanmaydi).",
      cause: "Xaridda faqat xizmatlar bor.",
      fix: "Xarajatni tovarli xaridga biriktiring yoki to'g'ridan-to'g'ri xarajat sifatida (Xizmat kirimi) kiriting.",
    },
    {
      message: "Qo'shimcha xarajat sanasi xarid sanasidan oldin bo'lishi mumkin emas.",
      cause: "Sana xarid sanasidan oldinroq.",
      fix: "Sanani xarid sanasi yoki undan keyinga o'zgartiring.",
    },
    {
      message: "Xarajat summasini kiriting (noldan katta).",
      cause: "Summa bo'sh yoki 0.",
      fix: "Summa (QQSsiz) maydonini to'ldiring.",
    },
    {
      message: "Hisob ko'rsatilmagan: … Hujjatda tanlang yoki hujjat hisoblari sozlamasida belgilang.",
      cause: "6010, 9120 yoki (QQS to'lovchida) 4410 hisobi tanlanmagan.",
      fix: "Hisoblar qatorida tanlang yoki Sozlamalar → Hujjat hisoblari sozlamasida belgilang.",
    },
    {
      message: "«…»: xarid kirim qilgan partiya topilmadi.",
      cause: "Xarid qatori uchun ombor partiyasi yo'q (ma'lumot buzilgan yoki xarid qayta o'tkazilmoqda).",
      fix: "Xaridni tekshiring; kerak bo'lsa administratorga murojaat qiling.",
    },
    {
      message: "«…»: xarajat qo'shilgandan keyin tovar sotilgan yoki ko'chirilgan — u oshgan tannarx bilan chiqqan. Avval o'sha hujjatlarni bekor qiling.",
      cause: "Bekor qilmoqchisiz, lekin partiyadan tovar keyin chiqqan.",
      fix: "Avval keyingi sotuv yoki ko'chirishni bekor qiling yoki xarajatni bekor qilmang.",
    },
    {
      message: "Bu xaridga qo'shimcha xarajat o'tkazilgan — avval qo'shimcha xarajat hujjatini bekor qiling.",
      cause: "Xaridni bekor qilmoqchisiz, unga xarajat o'tkazilgan.",
      fix: "Avval qo'shimcha xarajatni, keyin xaridni bekor qiling.",
    },
  ],
  tips: [
    "Xarajatni tovar sotilishidan oldin kiriting: shunda u to'liq tannarxga kiradi va sotuvda to'g'ri foyda chiqadi.",
    "Hujjat hozircha faqat so'mda kiritiladi; valyutadagi xarajatni so'mga o'girib yozing.",
  ],
  topics: [
    { title: "Sotib olish", articleId: "purchases/purchase" },
    { title: "Bojxona deklaratsiyasi", articleId: "purchases/customs" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Hujjat hisoblari sozlamasi", articleId: "start/document-accounts" },
  ],
};
