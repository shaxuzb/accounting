import type { ManualArticle } from "../../types";
import { px } from "./px";

const editor = px(1568, 500);
const posted = px(1568, 400);
const entries = px(1568, 620);

/**
 * «Yetkazib beruvchiga qaytarish»: a return on the basis of a posted purchase. It follows
 * ReturnEditorPage, ReturnDocService and ReturnDocContextBuilder; the example is the demo
 * organization's return of one washing machine from purchase №1.
 */
export const supplierReturnArticle: ManualArticle = {
  id: "purchases/supplier-return",
  sectionId: "purchases",
  title: "Yetkazib beruvchiga qaytarish",
  summary:
    "Sotib olingan tovarni (nuqsonli, ortiqcha yoki noto'g'ri kelgan) yetkazib beruvchiga qaytarish: xarid asosida hujjat ochish, miqdorni kiritish va o'tkazish.",
  routes: ["/main/purchases/purchase-returns"],
  screenshots: [
    {
      src: "/manual/purchases/return-editor.jpg",
      alt: "Yetkazib beruvchiga qaytarish hujjatini to'ldirish",
      caption:
        "Yangi qaytarish: Xaridlar → Yetkazuvchiga qaytarish → «Yangi qaytarish» yoki o'tkazilgan xarid ichidagi «Qaytarish yaratish» tugmasi. Raqam ustiga boring — izoh shu yerda chiqadi.",
      width: 1568,
      height: 500,
      markers: [
        editor(1, 540, 112, [376, 129, 548, 155]),
        editor(2, 1028, 112, [562, 129, 1033, 155]),
        editor(3, 1535, 112, [1058, 129, 1540, 155]),
        editor(4, 745, 176, [252, 166, 712, 187]),
        editor(5, 336, 242, [257, 198, 416, 224]),
        editor(6, 467, 242, [423, 198, 511, 224]),
        editor(7, 565, 242, [517, 198, 613, 224]),
        editor(8, 1212, 380, [1193, 255, 1298, 450]),
        editor(9, 1318, 426, [1299, 255, 1422, 450]),
        editor(10, 1445, 332, [1423, 255, 1554, 450]),
        editor(11, 1300, 470, [1318, 456, 1554, 484], { callout: "Qaytariladigan summa avtomatik", calloutSide: "left" }),
      ],
    },
    {
      src: "/manual/purchases/return-posted.jpg",
      alt: "O'tkazilgan qaytarish hujjati",
      caption: "O'tkazilgan qaytarish: hujjat endi faqat o'qiladi, faqat qaytarilgan qatorlar ko'rinadi.",
      width: 1568,
      height: 400,
      markers: [
        posted(12, 312, 110, [268, 134, 338, 154]),
        posted(13, 311, 242, [257, 198, 366, 224]),
        posted(14, 417, 242, [372, 198, 463, 224]),
        posted(15, 1245, 300, [1193, 312, 1298, 348], { callout: "Endi qolgani: 4 − 1 = 3", calloutSide: "left" }),
      ],
    },
    {
      src: "/manual/purchases/return-entries.jpg",
      alt: "Qaytarish provodkalari",
      caption: "«Provodkalar» tugmasi: qaytarish yozgan provodkalar va ularning analitikasi.",
      width: 1568,
      height: 620,
      markers: [
        entries(16, 690, 250, [470, 250, 690, 382]),
        entries(17, 1072, 238, [880, 234, 1072, 398]),
        entries(18, 1072, 410, [880, 404, 1072, 606]),
        entries(19, 1133, 250, [1080, 290, 1186, 530]),
      ],
    },
  ],
  purpose:
    "Xarid qilingan tovarning bir qismini yoki hammasini yetkazib beruvchiga qaytarish: tovar aynan o'sha xarid partiyasidan omborni tark etadi, yetkazib beruvchi oldidagi qarz va kiruvchi QQS kamayadi.",
  why:
    "Nuqsonli yoki ortiqcha kelgan tovar omborda «osilib» qolmasligi, yetkazib beruvchi bilan solishtirma dalolatnomasi to'g'ri chiqishi va QQS hisobga olishdan chiqarilishi uchun. Asl xaridni bekor qilish shart emas — u o'zgarmay qoladi.",
  prerequisites: [
    { title: "Asos bo'ladigan xarid o'tkazilgan (tasdiqlangan)", articleId: "purchases/purchase" },
    { title: "Qaytariladigan tovar shu xarid omborida hali bor", articleId: "warehouse/stock" },
    { title: "Qaytarish sanasi ochiq oyda", articleId: "accounting/period-close" },
    { title: "Omborda faol inventarizatsiya yo'q", articleId: "warehouse/inventory" },
  ],
  related: {
    center: "Qaytarish",
    items: [
      { title: "Sotib olish", articleId: "purchases/purchase" },
      { title: "Ombor qoldig'i", articleId: "warehouse/stock" },
      { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
      { title: "Provodkalar jurnali", articleId: "accounting/journal" },
    ],
  },
  steps: [
    {
      title: "Asos xaridni tanlang",
      text: "O'tkazilgan xariddan «Qaytarish yaratish» ni bosing yoki yangi qaytarishda «Asos hujjat» ro'yxatidan xaridni tanlang.",
    },
    {
      title: "Sanani tekshiring",
      text: "Standart — hozirgi vaqt. Sana xarid sanasidan oldin va yopilgan oyda bo'lmasin.",
    },
    {
      title: "Miqdorlarni kiriting",
      text: "Har qatorda «Qaytariladi» ga qaytayotgan miqdorni yozing yoki «Hammasini qaytarish» ni bosing. Qaytmaydigan qatorlarni bo'sh qoldiring.",
    },
    {
      title: "O'tkazing",
      text: "Izohga sababini yozing va «O'tkazish» ni bosing — hujjat saqlanadi va shu zahoti o'tkaziladi.",
    },
  ],
  fieldGroups: [
    {
      title: "Hujjat sarlavhasi",
      fields: [
        {
          name: "№ va holat",
          enter: "Raqam saqlanganda avtomatik beriladi; yangi hujjatda «Yangi» va «Qoralama» deb turadi.",
          affects: "Faqat ro'yxat va hisobotlarda hujjatni topish uchun.",
        },
        {
          n: 1,
          name: "Sana",
          required: true,
          enter: "Tovar yetkazib beruvchiga topshirilgan sana va vaqt. Standart — hozirgi vaqt.",
          onChange: "Qatorlar o'zgarmaydi. QQS to'lovchi belgisi shu sana bo'yicha qayta olinadi va summa ustuni nomi («Summa (QQSsiz)» yoki «Jami») shunga qarab almashadi.",
          affects:
            "Provodka va ombor harakati shu sana bilan yoziladi. Xarid sanasidan oldin bo'lsa yoki oy yopilgan bo'lsa, o'tkazib bo'lmaydi.",
        },
        {
          n: 2,
          name: "Asos hujjat",
          required: true,
          enter:
            "Tovar kelgan xarid: «№ · sana · yetkazib beruvchi · summa» ko'rinishida. Raqam yoki yetkazib beruvchi nomini yozib qidiring. Faqat o'tkazilgan xaridlar chiqadi.",
          onChange: "Kiritilgan miqdorlar va markirovka kodlari tozalanadi, jadval yangi xarid qatorlari bilan to'ladi. Hujjat saqlangandan keyin asosni o'zgartirib bo'lmaydi.",
          affects:
            "Kontragent, shartnoma, ombor, valyuta, narx, QQS stavkasi va hisoblar to'liq shu xariddan olinadi — ularni qo'lda o'zgartirib bo'lmaydi.",
        },
        {
          n: 3,
          name: "Izoh",
          enter: "Qaytarish sababi: masalan, «Nuqsonli: 1 dona kir yuvish mashinasi». Ixtiyoriy.",
          affects: "Faqat hujjat kartochkasida ko'rinadi; provodkaga ta'sir qilmaydi.",
        },
        {
          n: 4,
          name: "Kontragent · Ombor · Valyuta",
          enter: "O'zgartirilmaydi — asos xariddan ko'rsatiladi.",
          affects:
            "Tovar shu ombordan chiqadi; qarz shu yetkazib beruvchi va xarid shartnomasi bo'yicha kamayadi. Valyutadagi xarid o'sha valyutada qaytariladi.",
        },
      ],
    },
    {
      title: "Tugmalar",
      fields: [
        {
          n: 5,
          name: "Hammasini qaytarish",
          enter: "Har qatorga qaytarish mumkin bo'lgan butun miqdorni qo'yadi (markirovkali tovarlarda — barcha kodlarni).",
          onChange: "Keyin istalgan qatorni qo'lda kamaytirish yoki tozalash mumkin.",
        },
        {
          n: 6,
          name: "Saqlash",
          enter: "Hujjatni qoralama sifatida saqlaydi va unga raqam beradi.",
          affects: "Ombor, provodka va qarzga ta'sir qilmaydi. Qoralamani keyin ochib tahrirlash yoki o'chirish mumkin.",
        },
        {
          n: 7,
          name: "O'tkazish",
          enter: "Hujjatni saqlaydi va shu zahoti o'tkazadi (tasdiqlash huquqi bo'lsa ko'rinadi).",
          onChange:
            "O'tkazishda miqdorlar qayta tekshiriladi: qoralama saqlangandan keyin boshqa qaytarish o'tkazilgan bo'lsa, ortig'i rad etiladi.",
          affects: "Tovar ombordan chiqadi, provodkalar yoziladi, yetkazib beruvchi qarzi kamayadi.",
        },
        {
          name: "O'chirish (savat belgisi)",
          enter: "Saqlangan qoralamani butunlay o'chiradi (tasdiqlash so'raladi).",
          affects: "Faqat qoralamada ko'rinadi — o'tkazilgan hujjat o'chirilmaydi, bekor qilinadi.",
        },
      ],
    },
    {
      title: "Qatorlar jadvali",
      fields: [
        {
          name: "Mahsulot va Narx",
          enter: "Xarid qatorlari o'z narxi bilan (QQSsiz). O'zgartirilmaydi.",
          affects: "Qaytarish summasi = narx × qaytariladigan miqdor.",
        },
        {
          n: 8,
          name: "Qaytarish mumkin",
          enter: "Xariddagi miqdor, oldingi o'tkazilgan qaytarishlar ayirilgan holda.",
          affects: "«Qaytariladi» bundan katta bo'la olmaydi. Xizmatlar jadvalga chiqmaydi — ular omborga qaytmaydi.",
        },
        {
          n: 9,
          name: "Qaytariladi",
          required: true,
          enter:
            "Qaytayotgan miqdor. Markirovkali (dona-dona) tovarda son o'rniga qaytayotgan kodlar tanlanadi — miqdor kodlar soniga teng bo'ladi.",
          onChange: "Shu qator summasi va pastdagi jami darhol qayta hisoblanadi. Bo'sh yoki 0 qolgan qator hujjatga kirmaydi.",
          affects: "Ombordan aynan shu xarid partiyasidan shuncha tovar chiqadi.",
        },
        {
          n: 10,
          name: "Summa (QQSsiz) / Jami",
          enter: "Avtomatik: narx × miqdor. QQS to'lovchida QQSsiz ko'rsatiladi; o'tkazilgandan keyin QQS bilan jami chiqadi.",
          affects: "Yetkazib beruvchi qarzi shu summaga (QQS bilan) kamayadi.",
        },
        {
          n: 11,
          name: "Jadval ostidagi jami",
          enter: "Barcha qatorlar yig'indisi va valyuta.",
          affects: "Hujjat summasi — ro'yxat va hisobotlarda shu ko'rinadi.",
        },
      ],
    },
    {
      title: "O'tkazilgan qaytarish",
      fields: [
        {
          n: 12,
          name: "Holat",
          enter: "Qoralama — tahrirlanadi. O'tkazilgan — faqat o'qiladi. Bekor qilingan — yakuniy holat.",
          affects: "Faqat o'tkazilgan qaytarish omborda, provodkalarda va qarzda hisoblanadi.",
        },
        {
          n: 13,
          name: "Bekor qilish",
          enter: "O'tkazilgan qaytarishni bekor qiladi (tasdiqlash so'raladi).",
          onChange: "Provodkalar storno qilinadi, tovar omborga qaytadi, yetkazib beruvchi qarzi tiklanadi.",
          affects: "Qaytarish mumkin bo'lgan miqdor yana oshadi; xaridni bekor qilish yo'li ochiladi.",
        },
        {
          n: 14,
          name: "Provodkalar",
          enter: "Qaytarish yozgan buxgalteriya provodkalarini analitikasi bilan ochadi.",
        },
        {
          n: 15,
          name: "Qaytarish mumkin (o'tkazilgandan keyin)",
          enter: "Shu qaytarishdan keyin xariddan yana qancha qaytarish mumkinligi.",
          affects: "Keyingi qaytarish shu miqdordan oshmaydi.",
        },
      ],
    },
    {
      title: "Provodkalar oynasi",
      fields: [
        {
          n: 16,
          name: "Debet 6010 analitikasi",
          enter: "Kontragent va shartnoma — asos xariddagidek.",
          affects: "Qarz aynan shu shartnoma bo'yicha kamayadi; solishtirma dalolatnomasida qaytarish shu shartnoma ostida chiqadi.",
        },
        {
          n: 17,
          name: "Kredit 2910 analitikasi",
          enter: "Nomenklatura, partiya (asos xarid) va ombor.",
          affects: "Tovar FIFO bo'yicha emas, aynan xarid partiyasidan, o'sha partiya tannarxida chiqadi.",
        },
        {
          n: 18,
          name: "Kredit 4410 analitikasi",
          enter: "Kontragent, olingan hisob-faktura (asos xarid) va QQS turi.",
          affects: "Shu hisob-faktura bo'yicha hisobga olingan QQS kamayadi.",
        },
        {
          n: 19,
          name: "Summa",
          enter: "Har provodka summasi: tovar — partiya qiymati, QQS — qaytgan qismning QQSi.",
        },
      ],
    },
  ],
  postings: {
    intro: "Misol: xarid №1 dan 1 dona kir yuvish mashinasi qaytarildi — 2 850 000 + QQS 12% (342 000) = 3 192 000.",
    entries: [
      {
        when: "Tovar yetkazib beruvchiga qaytdi",
        debit: "6010",
        credit: "2910",
        amount: "Partiya qiymati — 2 850 000",
        note: "Xarid partiyasi tannarxida. Partiyaga qo'shimcha xarajat yoki boj qo'shilgan bo'lsa, shu oshgan qiymat bilan. QQS to'lovchi bo'lmasa — QQS partiya ichida, alohida provodka yo'q.",
      },
      {
        when: "Kiruvchi QQS qaytarildi",
        debit: "6010",
        credit: "4410.3",
        amount: "QQS — 342 000",
        note: "Faqat QQS to'lovchi tashkilotda, xarid QQSi hisobga olingan bo'lsa.",
      },
    ],
    cancel:
      "ikkala provodka storno qilinadi, tovar o'sha partiyaga omborga qaytadi, yetkazib beruvchi qarzi tiklanadi, markirovka kodlari yana «omborda» holatiga o'tadi.",
  },
  errors: [
    {
      message: "Qaytarish faqat o'tkazilgan (tasdiqlangan) hujjat asosida qilinadi.",
      cause: "Asos xarid qoralama yoki bekor qilingan.",
      fix: "Avval xaridni tasdiqlang yoki boshqa (o'tkazilgan) xaridni tanlang.",
    },
    {
      message: "Qaytariladigan kamida bitta qatorni miqdori bilan kiriting.",
      cause: "Hech bir qatorda «Qaytariladi» to'ldirilmagan.",
      fix: "Kamida bitta qatorga miqdor yozing yoki «Hammasini qaytarish» ni bosing.",
    },
    {
      message: "«…»: ko'pi bilan N qaytarish mumkin (asos hujjatdagi miqdor, avvalgi qaytarishlar ayirilgan).",
      cause: "Miqdor qolgan miqdordan katta — ko'pincha boshqa qaytarish orada o'tkazilgan.",
      fix: "Miqdorni ko'rsatilgan songa tushiring.",
    },
    {
      message: "Qaytarish sanasi asos hujjat sanasidan oldin bo'lishi mumkin emas.",
      cause: "Sana xarid sanasidan oldin qo'yilgan.",
      fix: "Sanani xarid sanasi yoki undan keyingi kunga o'zgartiring.",
    },
    {
      message: "«…» markirovka bilan yuritiladi: tanlangan kodlar qaytarib bo'lmaydi yoki yetarli emas …",
      cause: "Tanlangan kod allaqachon sotilgan, ko'chirilgan yoki hisobdan chiqarilgan.",
      fix: "Faqat shu omborda turgan kodlarni tanlang; kerak bo'lsa avval o'sha hujjatni bekor qiling.",
    },
    {
      message: "«…» omborida «…» yetarli emas (hujjat sanasidagi qoldiq): kerak …, mavjud …",
      cause: "Xarid partiyasidagi tovar qisman sotilgan yoki boshqa omborga ko'chirilgan.",
      fix: "Faqat omborda qolgan miqdorni qaytaring yoki avval ko'chirishni bekor qiling.",
    },
    {
      message: "… hisob davri yopilgan",
      cause: "Qaytarish sanasi yopilgan oyga to'g'ri keladi.",
      fix: "Sanani ochiq oyga o'zgartiring yoki oyni qayta oching.",
    },
    {
      message: "Bu hujjat asosida o'tkazilgan qaytarish bor — avval qaytarishni bekor qiling.",
      cause: "Xaridni bekor qilmoqchisiz, lekin unga qaytarish o'tkazilgan.",
      fix: "Avval qaytarishni, keyin xaridni bekor qiling.",
    },
  ],
  tips: [
    "Qaytarishni xaridning o'zidan oching («Qaytarish yaratish» tugmasi) — asos hujjat o'zi tanlanadi.",
    "Bitta xariddan bir necha marta qisman qaytarish mumkin: har safar «Qaytarish mumkin» qolgan miqdorni ko'rsatadi.",
    "Xizmatdan voz kechish qaytarish bilan emas, tuzatish hujjati bilan rasmiylashtiriladi — xizmat omborga qaytmaydi.",
  ],
  topics: [
    { title: "Sotib olish", articleId: "purchases/purchase" },
    { title: "Ombordagi qoldiqlar", articleId: "warehouse/stock" },
    { title: "Debitor va kreditor qarzlar", articleId: "reports/settlements" },
    { title: "Provodkalar jurnali", articleId: "accounting/journal" },
  ],
};
