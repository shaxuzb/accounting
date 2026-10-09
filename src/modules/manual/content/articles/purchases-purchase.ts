import type { ManualArticle, ManualMarker } from "../../types";

/** A marker by the screenshot's pixels (the shots are 1568 px wide), turned into percent. */
const px = (w: number, h: number) =>
  (n: number, x: number, y: number, box?: [number, number, number, number], extra?: Partial<ManualMarker>): ManualMarker => ({
    n,
    x: (x / w) * 100,
    y: (y / h) * 100,
    box: box && [(box[0] / w) * 100, (box[1] / h) * 100, ((box[2] - box[0]) / w) * 100, ((box[3] - box[1]) / h) * 100],
    ...extra,
  });
const editor = px(1568, 655);
const posted = px(1568, 455);

/**
 * «Sotib olish»: the purchase editor and the posted purchase. Every statement here follows the
 * code (PurchaseEditorPage, PurchaseImportHeader, PurchaseLifecycleService,
 * PurchaseDocContextBuilder); the example amounts are the demo organization's purchase.
 */
export const purchaseArticle: ManualArticle = {
  id: "purchases/purchase",
  sectionId: "purchases",
  title: "Sotib olish (tovar va xizmat kirimi)",
  summary:
    "Yetkazib beruvchidan olingan tovarlarni omborga kirim qilish va xizmatlarni xarajatga olish: hujjatni to'ldirish, tasdiqlash va undan keyingi amallar.",
  routes: ["/main/purchases/purchase"],
  screenshots: [
    {
      src: "/manual/purchases/purchase-editor.jpg",
      alt: "Sotib olish hujjatini to'ldirish oynasi",
      caption: "Yangi xarid hujjati: Xaridlar → Xaridlar → «Sotib olish importi» tugmasi. Raqam ustiga boring — pastdagi jadvalda shu maydon izohi yoritiladi.",
      width: 1568,
      height: 655,
      markers: [
        editor(1, 437, 117, [253, 133, 452, 163]),
        editor(2, 655, 117, [471, 133, 670, 163]),
        editor(3, 873, 117, [690, 133, 888, 163]),
        editor(4, 1092, 117, [908, 133, 1107, 163]),
        editor(5, 1316, 117, [1127, 133, 1326, 163]),
        editor(6, 1548, 108, [1346, 109, 1554, 152]),
        editor(7, 340, 229, [255, 238, 424, 262]),
        editor(8, 566, 229, [435, 238, 572, 262]),
        editor(9, 698, 229, [582, 238, 704, 262]),
        editor(10, 360, 287, [286, 276, 513, 416]),
        editor(11, 625, 287, [515, 276, 660, 416]),
        editor(12, 755, 287, [661, 276, 766, 416]),
        editor(13, 944, 287, [866, 276, 947, 416]),
        editor(14, 1045, 287, [948, 276, 1062, 416]),
        editor(15, 1350, 287, [1178, 276, 1364, 416]),
        editor(16, 1500, 268, [1478, 276, 1556, 416]),
        editor(17, 1112, 500, [257, 443, 1540, 500], { callout: "Yakuniy summalar avtomatik hisoblanadi", calloutSide: "bottom" }),
        editor(18, 1544, 238, [1476, 238, 1544, 262]),
      ],
    },
    {
      src: "/manual/purchases/purchase-save-dialog.jpg",
      alt: "Hujjatni saqlash oynasi",
      caption: "«Saqlash» bosilganda yangi hujjat uchun ochiladigan oyna.",
      width: 1568,
      height: 655,
      markers: [
        editor(19, 765, 387, [599, 387, 765, 412], { callout: "Faqat saqlanadi — ombor va provodkaga tushmaydi", calloutSide: "bottom" }),
        editor(20, 913, 387, [772, 387, 913, 412], { callout: "Darhol o'tkaziladi: ombor, provodka, qarz", calloutSide: "right" }),
      ],
    },
    {
      src: "/manual/purchases/purchase-posted.jpg",
      alt: "O'tkazilgan xarid hujjati",
      caption: "O'tkazilgan (tasdiqlangan) xarid: hujjat endi faqat o'qiladi, asosida yangi hujjatlar yaratiladi.",
      width: 1568,
      height: 455,
      markers: [
        posted(21, 751, 186, [707, 195, 795, 220]),
        posted(22, 874, 186, [822, 195, 927, 220]),
        posted(23, 1006, 186, [934, 195, 1078, 220]),
        posted(24, 1160, 186, [1085, 195, 1234, 220]),
        posted(25, 1325, 186, [1242, 195, 1407, 220]),
        posted(26, 1479, 186, [1415, 195, 1543, 220]),
      ],
    },
  ],
  purpose:
    "Yetkazib beruvchi yoki ijrochidan olingan tovar va xizmatlarni hisobga olish: tovar omborga partiya bo'lib kiradi, yetkazib beruvchi oldidagi qarz va kiruvchi QQS yoziladi.",
  why:
    "Xaridsiz tovar omborda bo'lmaydi va uni sotib bo'lmaydi. Tannarx, ombor qoldig'i, yetkazib beruvchi bilan hisob-kitob va QQS hisobi aynan shu hujjatdan boshlanadi.",
  prerequisites: [
    { title: "Kontragent (yetkazib beruvchi) yaratilgan", route: "/main/settings/counterparty" },
    { title: "Shu sanada amal qiladigan shartnoma bor", articleId: "purchases/contracts" },
    { title: "Ombor yaratilgan", route: "/main/settings/warehouse" },
    { title: "Tovarlar MXIK, birlik va QQS stavkasi bilan kiritilgan", articleId: "warehouse/products" },
    { title: "Hujjat hisoblari sozlangan (6010, 2910, 4410)", articleId: "start/document-accounts" },
    { title: "Hisob siyosatida QQS to'lovchi belgisi to'g'ri", articleId: "start/accounting-policy" },
  ],
  related: {
    center: "Sotib olish",
    items: [
      { title: "Yetkazib beruvchilar", route: "/main/settings/counterparty" },
      { title: "Shartnomalar", articleId: "purchases/contracts" },
      { title: "Ombor", articleId: "warehouse/stock" },
      { title: "Hisobvaraqlar", articleId: "start/chart-of-accounts" },
      { title: "MXIK kodlari", articleId: "warehouse/products" },
    ],
  },
  steps: [
    {
      title: "Sana va yetkazib beruvchini tanlang",
      text: "Hujjat sanasini qo'ying va ro'yxatdan yetkazib beruvchini tanlang — uning shartnomasi o'zi tanlanadi.",
    },
    {
      title: "Ombor va hisobvaraqni belgilang",
      text: "Tovar qabul qilinadigan omborni tanlang. Yetkazib beruvchi hisobvarag'i (6010) sozlamadan o'zi qo'yiladi.",
    },
    {
      title: "Tovarlarni kiriting",
      text: "«Tovar qo'shish» bilan qator qo'shing yoki Excel'dan yuklang: tovar, miqdor, narx va QQS stavkasi.",
    },
    {
      title: "Tekshirib saqlang",
      text: "Pastdagi jami summalarni tekshiring, «Saqlash» → «Qoralama sifatida saqlash» yoki «Saqlash va tasdiqlash».",
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
          enter: "Yetkazib beruvchining hujjati (yuk xati, hisob-faktura) sanasi. Standart — bugun.",
          onChange:
            "Shartnoma tozalanadi va shu sanada amal qiladigan birinchi shartnoma qayta tanlanadi. Sana oxirgi xarid sanasidan oldin bo'la olmaydi.",
          affects:
            "Provodkalar va partiya shu sana bilan yoziladi; QQS to'lovchi ekanligi va valyuta kursi shu sana bo'yicha olinadi. Yopilgan oyga tasdiqlab bo'lmaydi.",
        },
        {
          n: 2,
          name: "Yetkazib beruvchi",
          required: true,
          enter: "Tovarni sotgan kontragent. Xizmat kirimida maydon «Ijrochi» deb ataladi. «+» bilan yangi kontragent qo'shish mumkin.",
          onChange: "Shartnoma tozalanadi va yangi kontragentning birinchi shartnomasi tanlanadi.",
          affects:
            "Barcha provodkalarda kontragent analitikasi; yetkazib beruvchi oldidagi qarz (6010) va unga berilgan avans (4310) shu kontragent bo'yicha hisoblanadi.",
        },
        {
          n: 3,
          name: "Shartnoma",
          required: true,
          enter:
            "Shu kontragent bilan hujjat sanasida amal qiladigan shartnoma. Birinchisi avtomatik tanlanadi; «+» bilan yangi shartnoma qo'shish mumkin.",
          onChange: "«Narx QQS bilan» belgisi shartnomadagi qiymatga o'tadi (o'zgartirsa bo'ladi).",
          affects:
            "Provodkalarda shartnoma analitikasi. Hisob-kitob shartnoma bo'yicha yuritilsa, avans faqat shu shartnoma bo'yicha berilganidan hisobga olinadi; akt-sverka shartnoma kesimida chiqadi.",
        },
        {
          n: 4,
          name: "Ombor",
          required: true,
          enter: "Tovar qabul qilinadigan ombor.",
          onChange: "Faqat qoralamada o'zgartiriladi.",
          affects:
            "Tovar va partiya shu omborga kiradi (Dt 2910 ombor analitikasi). Omborda faol inventarizatsiya bo'lsa, hujjatni tasdiqlab ham, bekor qilib ham bo'lmaydi.",
        },
        {
          n: 5,
          name: "Yetkazib beruvchi hisobvarag'i",
          required: true,
          enter:
            "Yetkazib beruvchi bilan hisob-kitob hisobi, odatda 6010. «Hujjat hisoblari sozlamasi»dagi standart hisob o'zi tanlanadi.",
          onChange:
            "Tovar kirimi va Xizmat kirimi o'rtasida o'tilganda tozalanib, yangi turning standart hisobi qo'yiladi. Sozlamada «o'zgartirib bo'lmaydi» bo'lsa, maydon qulflangan.",
          affects: "Barcha provodkalarning kredit hisobi (Kt 6010) va avansni hisobga olish (Dt 6010 Kt 4310).",
        },
        {
          n: 6,
          name: "Narx QQS bilan",
          enter:
            "O'chiq — narx QQSsiz, QQS ustiga qo'shiladi. Yoqiq — narx ichida QQS bor, u summadan ajratiladi. Standart qiymat shartnomadan olinadi.",
          onChange: "Barcha qatorlarning QQSsiz summasi, QQS va Jami hamda pastdagi jami summalar darhol qayta hisoblanadi.",
          affects: "Tovarning tannarxi (QQSsiz summa) va kiruvchi QQS summasi (4410).",
        },
      ],
    },
    {
      title: "Jadval ustidagi tugmalar",
      fields: [
        {
          n: 7,
          name: "Tovar kirimi / Xizmat kirimi",
          enter:
            "Tovar kirimi — omborga kiradigan tovarlar. Xizmat kirimi — omborga kirmaydigan xizmatlar (transport, ijara, litsenziya ...).",
          onChange:
            "Birorta qatorga tovar tanlangandan keyin almashtirib bo'lmaydi. Xizmat kirimida MXIK va Markirovka ustunlari yo'q, yetkazib beruvchi «Ijrochi» bo'ladi, hisobvaraqlar qayta tanlanadi.",
          affects:
            "Tovar — Dt 2910 (ombor, partiya). Xizmat — xarajat hisobiga (masalan 9430) yoki kelgusi davr xarajatlariga (31xx); omborga kirmaydi.",
        },
        {
          n: 8,
          name: "Excel'dan import",
          enter:
            "Yetkazib beruvchining .xlsx/.xls faylini yuklang: varaqni tanlang, so'ng har bir ustun ostida qaysi maydon ekanini belgilang (Mahsulot nomi, MXIK kodi, Markirovka, Narxi).",
          onChange:
            "Yuklangan qatorlar jadvaldagi qatorlar o'rnini egallaydi. Tovar faqat MXIK kodi bo'yicha topiladi; topilmagan MXIK qizil bo'ladi.",
          affects: "Faqat jadvalni to'ldiradi; hujjat saqlanmaguncha hech narsa yozilmaydi.",
        },
        {
          n: 9,
          name: "Tovar qo'shish",
          enter: "Jadvalga bo'sh qator qo'shadi. Yetkazib beruvchi tanlanmaguncha faol emas.",
          affects: "—",
        },
        {
          name: "Topilmagan MXIK kodlarini belgilash / o'chirish",
          enter:
            "Excel'dan kelgan, katalogda yo'q MXIK kodlari uchun. «Belgilash» — ular uchun tovarlarni birdaniga yaratadi (tovar turi va birlik so'raladi). «O'chirish» — shu qatorlarni olib tashlaydi.",
          affects: "Yaratilgan tovarlar Ombor → Tovarlar ro'yxatiga qo'shiladi.",
        },
      ],
    },
    {
      title: "Tovarlar jadvali",
      fields: [
        {
          n: 10,
          name: "Tovar",
          required: true,
          enter: "Katalogdagi tovar (yoki xizmat). Qidirib tanlang.",
          onChange:
            "Tovarning MXIK, birlik, xarid narxi, QQS stavkasi va standart hisobvaraqlari qatorga o'zi qo'yiladi.",
          affects: "Omborda shu tovarning yangi partiyasi ochiladi.",
        },
        {
          n: 11,
          name: "MXIK",
          enter: "Tovar tanlangach o'zi to'ladi. Tovar tanlanmagan bo'lsa, MXIK kodini yozsangiz — tovar shu kod bo'yicha topiladi.",
          onChange: "Tovar tanlangandan keyin qulflanadi.",
          affects: "Hisob-faktura va soliq hisobotlari.",
        },
        {
          n: 12,
          name: "Markirovka",
          enter:
            "Markirovkali tovarlar uchun kodlar. Bosing — kodlarni bittalab yozing yoki Excel'dan bir nechtasini birdan joylang.",
          onChange: "Miqdor kodlar soniga teng bo'ladi va qo'lda o'zgartirilmaydi. Bir xil kod ikki marta kiritilmaydi.",
          affects:
            "Har bir kod alohida birlik sifatida omborga kiradi; sotuv, qaytarish va ko'chirish shu kodlar bilan bo'ladi.",
        },
        {
          n: 13,
          name: "Miqdori",
          required: true,
          enter: "Olingan miqdor, tovar birligida. Markirovkali tovarda — butun son.",
          onChange: "Qatorning summalari qayta hisoblanadi.",
          affects: "Ombor qoldig'i va partiya miqdori; 2910 dagi miqdor.",
        },
        {
          n: 14,
          name: "Narxi",
          required: true,
          enter: "Bir birlik narxi, «Narx QQS bilan» belgisiga qarab QQSsiz yoki QQS bilan.",
          onChange: "QQSsiz summa = miqdor × narx (QQS bilan bo'lsa, QQS ajratiladi); QQS va Jami qayta hisoblanadi.",
          affects: "Partiyaning tannarxi — keyin sotilganda shu narx 9120 ga (sotilgan tovar tannarxi) o'tadi.",
        },
        {
          n: 15,
          name: "QQS (foiz va summa)",
          enter: "QQS stavkasi (12%, 0%, QQSsiz). Tovarning standart stavkasi o'zi qo'yiladi.",
          onChange:
            "QQS = QQSsiz summa × stavka (narx QQS bilan bo'lsa — summa × stavka / (100 + stavka)); 2 xonagacha yaxlitlanadi.",
          affects:
            "QQS to'lovchi tashkilotda — kiruvchi QQS (Dt 4410). QQS to'lovchi bo'lmasa — QQS tovar tannarxiga qo'shiladi va ustun «QQS (tannarxga qo'shiladi)» deb ataladi.",
        },
        {
          n: 16,
          name: "Hisobvaraqlar",
          enter:
            "Qator uchun «Debet / QQS» hisoblari (masalan 2910 / 4410.3). Qalam belgisi bilan o'zgartiring; «Barcha satrlarga qo'llash» mumkin.",
          onChange:
            "Tovar uchun faqat ombor hisobi (2910, 1010 ...) ruxsat etiladi, xizmat uchun — ombor bo'lmagan hisob. Kelgusi davr xarajati hisobida (31xx) qaysi xarajat ekanini tanlash so'raladi.",
          affects: "Provodkaning debet hisobi va QQS hisobi.",
        },
      ],
    },
    {
      title: "Jami va saqlash",
      fields: [
        {
          n: 17,
          name: "QQSsiz summa · QQS summasi · Jami",
          enter: "Avtomatik: to'liq to'ldirilgan qatorlar yig'indisi.",
          onChange: "Har qanday qator yoki «Narx QQS bilan» o'zgarsa, qayta hisoblanadi.",
          affects: "Jami — yetkazib beruvchiga qarz (6010) va hujjat summasi.",
        },
        {
          name: "Izoh",
          enter: "Ixtiyoriy matn (1000 belgigacha), jami summalar ostida.",
          affects: "Hujjat kartochkasida «Tavsif» bo'lib ko'rinadi.",
        },
        {
          n: 18,
          name: "Saqlash",
          enter:
            "Yangi hujjatda oyna ochiladi: «Qoralama sifatida saqlash» — faqat saqlanadi; «Saqlash va tasdiqlash» — darhol o'tkaziladi (ombor va provodka).",
          onChange:
            "Tasdiqlashda xato bo'lsa, hech narsa saqlanmaydi va siz formada xato bilan qolasiz. To'ldirilmay qolgan qator saqlashga to'sqinlik qiladi.",
          affects: "Tasdiqlangan hujjat ombor, provodka va yetkazib beruvchi qarziga yoziladi.",
        },
        {
          n: 19,
          name: "Qoralama sifatida saqlash",
          enter: "Hujjat faqat saqlanadi va ro'yxatda «Qoralama» holatida turadi; keyin ochib tahrirlash va tasdiqlash mumkin.",
          onChange: "Hujjatga raqam beriladi; to'ldirilgan ma'lumotlar brauzer xotirasidan tozalanadi.",
          affects: "Ombor, provodka va yetkazib beruvchi qarziga ta'sir qilmaydi.",
        },
        {
          n: 20,
          name: "Saqlash va tasdiqlash",
          enter: "Hujjat saqlanadi va shu zahoti o'tkaziladi (faqat tasdiqlash huquqi bo'lsa ko'rinadi).",
          onChange: "Tasdiqlashda xato chiqsa (masalan, hisob davri yopilgan), hujjat umuman saqlanmaydi va siz formada xato bilan qolasiz.",
          affects: "Tovar omborga kiradi, provodkalar yoziladi, yetkazib beruvchi qarzi oshadi.",
        },
        {
          name: "Bekor qilish (jadval ustida)",
          enter: "Faqat ortga qaytadi — hech narsa saqlanmaydi va hujjat bekor qilinmaydi.",
          affects: "—",
        },
      ],
    },
    {
      title: "O'tkazilgan xarid sahifasi",
      fields: [
        {
          n: 21,
          name: "Holat",
          enter: "Qoralama — tahrirlanadi va tasdiqlanadi. O'tkazilgan — faqat o'qiladi. Bekor qilingan — yakuniy holat.",
          affects: "Faqat o'tkazilgan hujjat omborda, provodkalarda va hisobotlarda ko'rinadi.",
        },
        {
          n: 22,
          name: "Shartnoma",
          enter: "«Xarid» turidagi Word shablon asosida shartnoma hujjatini tuzadi.",
          affects: "Hisobga ta'sir qilmaydi.",
        },
        {
          n: 23,
          name: "Qaytarish yaratish",
          enter: "Shu xarid asosida yetkazib beruvchiga qaytarish hujjatini ochadi — qatorlar, narx va hisoblar xariddan olinadi.",
          affects: "Qaytarish o'tkazilsa, Dt 6010 Kt 2910 va QQS qaytariladi.",
        },
        {
          n: 24,
          name: "Qo'shimcha xarajat",
          enter: "Transport, yuklash kabi xarajatlarni shu xarid tovarlariga taqsimlaydi.",
          affects: "Omborda qolgan tovar partiyasining tannarxi oshadi (Dt 2910), sotilgan qismi 9120 ga yoziladi.",
        },
        {
          n: 25,
          name: "Bojxona deklaratsiyasi",
          enter: "Import tovarlari uchun boj, yig'im, aksiz va import QQS.",
          affects: "Boj, yig'im va aksiz tannarxga (Dt 2910), import QQS Dt 4410.5; hammasi Kt 6490.",
        },
        {
          n: 26,
          name: "Xaridni bekor qilish",
          enter: "O'tkazilgan xaridni storno qiladi (tasdiqlash so'raladi).",
          onChange:
            "Provodkalar teskari yoziladi, tovar ombordan chiqariladi, yetkazib beruvchi qarzi kamayadi. Tovar sotilgan yoki qaytarilgan bo'lsa, avval o'sha hujjatlarni bekor qilish kerak.",
          affects: "Ombor qoldig'i, 2910, 4410, 6010 va hisobotlar.",
        },
      ],
    },
  ],
  postings: {
    intro: "Hujjat tasdiqlanganda yoziladigan provodkalar. Misol: 3 xil tovar, QQSsiz 52 000 000, QQS 12% — 6 240 000.",
    entries: [
      {
        when: "Tovar omborga kirdi",
        debit: "2910",
        credit: "6010",
        amount: "QQSsiz summa — 52 000 000",
        note: "Tovar, ombor va partiya bo'yicha; miqdor bilan. QQS to'lovchi bo'lmasa — QQS bilan birga (58 240 000).",
      },
      {
        when: "Kiruvchi QQS",
        debit: "4410.3",
        credit: "6010",
        amount: "QQS — 6 240 000",
        note: "Faqat QQS to'lovchi tashkilotda.",
      },
      {
        when: "Xizmat (Xizmat kirimi)",
        debit: "9430 / 31xx",
        credit: "6010",
        amount: "Xizmat summasi",
        note: "Kelgusi davr xarajati (31xx) oy yopilganda jadval bo'yicha hisobdan chiqariladi.",
      },
      {
        when: "Yetkazib beruvchiga avval avans berilgan bo'lsa",
        debit: "6010",
        credit: "4310",
        amount: "Avans qoldig'i va qarzning kichigi",
        note: "Hisob-kitob shartnoma bo'yicha yuritilsa — faqat shu shartnoma avansi.",
      },
    ],
    cancel:
      "barcha provodkalar storno qilinadi (teskari yoziladi), tovar ombordan chiqariladi, yetkazib beruvchi qarzi kamayadi. Asosida o'tkazilgan qaytarish, qo'shimcha xarajat yoki bojxona deklaratsiyasi bo'lsa, avval ular bekor qilinadi.",
  },
  errors: [
    {
      message: "Majburiy maydonlarni to'ldiring",
      cause: "Sana, yetkazib beruvchi, shartnoma yoki ombor bo'sh.",
      fix: "Qizil bilan belgilangan sarlavha maydonlarini to'ldiring.",
    },
    {
      message: "Yetkazib beruvchi hisobvarag'ini tanlang",
      cause: "Hisob tanlanmagan yoki hujjat hisoblari sozlamasida yo'q.",
      fix: "Ro'yxatdan 6010 ni tanlang yoki Sozlamalar → Hujjat hisoblari sozlamasida qo'shing.",
    },
    {
      message: "Qator(lar) to'liq emas: … Miqdor, narx, birlik va hisobvaraqlarni to'ldiring yoki qatorni o'chiring",
      cause: "Tovar tanlangan qatorda miqdor, narx, birlik yoki hisobvaraq yetishmaydi.",
      fix: "Ko'rsatilgan qatorlarni to'ldiring yoki o'chiring — chala qator saqlanmaydi.",
    },
    {
      message: "Hujjat sanasi oxirgi hujjat sanasidan oldin bo'lishi mumkin emas",
      cause: "Sana oxirgi xarid hujjatidan oldinroq qo'yilgan.",
      fix: "Sanani oxirgi xarid sanasidan keyinroq qiling.",
    },
    {
      message: "«…»: tovar uchun ombor hisobini tanlang (2910, 1010 ...)",
      cause: "Tovar qatorida debet hisobi ombor hisobi emas.",
      fix: "Hisobvaraqlar ustunida 2910 yoki boshqa ombor hisobini tanlang; xarajat bo'lsa — Xizmat kirimi orqali kiriting.",
    },
    {
      message: "Marking raqami allaqachon ro'yxatda bor",
      cause: "Shu markirovka kodi boshqa hujjatda yoki tovarda bor.",
      fix: "Kodni tekshiring — bitta kod tizimda faqat bir marta bo'ladi.",
    },
    {
      message: "… hisob davri yopilgan",
      cause: "Hujjat sanasi yopilgan oyga to'g'ri keladi.",
      fix: "Sanani ochiq oyga o'zgartiring yoki Buxgalteriya → Hisob davrlarida oyni qayta oching.",
    },
    {
      message: "… omborda faol inventarizatsiya mavjud",
      cause: "Tanlangan omborda inventarizatsiya o'tkazilmoqda.",
      fix: "Inventarizatsiyani yakunlang, so'ng hujjatni tasdiqlang.",
    },
  ],
  tips: [
    "Yetkazib beruvchining faylini «Excel'dan import» orqali yuklang — tovarlar MXIK bo'yicha o'zi topiladi. Katalogda yo'q MXIK kodlari uchun tovarlarni «Topilmagan MXIK kodlarini belgilash» bilan birdaniga yarating.",
    "Hujjatni avval qoralama sifatida saqlang va tekshiring: qoralama omborga ham, provodkaga ham ta'sir qilmaydi.",
  ],
  topics: [
    { title: "Yetkazib beruvchiga qaytarish", articleId: "purchases/supplier-return" },
    { title: "Qo'shimcha xarajatlar", articleId: "purchases/extra-costs" },
    { title: "Bojxona deklaratsiyasi", articleId: "purchases/customs" },
    { title: "Shartnomalar", articleId: "purchases/contracts" },
    { title: "Hujjat hisoblari sozlamasi", articleId: "start/document-accounts" },
    { title: "Provodkalar jurnali", articleId: "accounting/journal" },
  ],
};
