import type { ManualArticle } from "../../types";
import { px } from "./px";

const upload = px(1568, 330);
const parsed = px(1568, 711);
const missingBank = px(1568, 480);
const missingCounterparty = px(1568, 520);
const save = px(1568, 250);

/**
 * «Bank ko'chirmasini import qilish»: loading the bank's statement, checking and completing its
 * operations and saving them as bank documents. Every statement here follows the code
 * (BankStatementImportPage, BankStatementCard, the two «belgilash» modals, bankOffsetDefaults,
 * BankStatementParserService, BankOperationClassifier, BankOperationService.CreateMany); the
 * example is the demo organization's October statement from «O'zsanoatqurilishbank».
 */
export const bankStatementImportArticle: ManualArticle = {
  id: "bank/statement-import",
  sectionId: "bank",
  title: "Bank ko'chirmasini import qilish",
  summary:
    "Bankdan olingan ko'chirmani (Excel yoki bank-klientning 1C fayli) yuklab, undagi barcha to'lov va tushumlarni bir yo'la bank hujjatlariga aylantirish: tizim operatsiyalarni o'zi tasniflaydi, kontragent va hisobvaraqlarni topadi, siz faqat yetishmaganini to'ldirasiz.",
  routes: ["/main/bank/import"],
  screenshots: [
    {
      src: "/manual/bank/statement-upload.jpg",
      alt: "Bank ko'chirmasini yuklash oynasi",
      caption: "Bank → Bank operatsiyalari → «Import». Avval bankni tanlang, keyin faylni yuklang. Raqam ustiga boring — izoh shu yerning o'zida chiqadi.",
      width: 1568,
      height: 330,
      markers: [
        upload(1, 1232, 100, [1119, 108, 1347, 139]),
        upload(2, 898, 192, [257, 172, 1541, 296]),
        upload(3, 1400, 98, [1355, 108, 1446, 135]),
        upload(4, 1497, 98, [1455, 108, 1540, 135]),
      ],
    },
    {
      src: "/manual/bank/statement-parsed.jpg",
      alt: "Yuklangan ko'chirma: xulosa, hisob kartochkasi va operatsiyalar",
      caption: "Fayl o'qilgandan keyin: tepada xulosa, pastda hisob raqami kartochkasi va uning operatsiyalari.",
      width: 1568,
      height: 711,
      markers: [
        parsed(5, 872, 104, [770, 117, 975, 141]),
        parsed(6, 1075, 104, [986, 117, 1164, 141]),
        parsed(7, 1254, 104, [1173, 117, 1336, 141]),
        parsed(8, 336, 214, [256, 205, 352, 250]),
        parsed(9, 648, 205, [515, 218, 782, 237]),
        parsed(10, 1100, 203, [949, 214, 1257, 240]),
        parsed(11, 1397, 203, [1266, 214, 1528, 240]),
        parsed(12, 360, 286, [282, 292, 440, 385]),
        parsed(13, 838, 286, [455, 292, 1222, 333]),
        parsed(14, 1278, 286, [1232, 300, 1325, 327]),
        parsed(15, 1430, 286, [1332, 300, 1528, 327]),
        parsed(16, 551, 404, [470, 412, 633, 440]),
        parsed(17, 715, 404, [634, 412, 797, 440]),
        parsed(18, 896, 404, [798, 412, 994, 440]),
        parsed(19, 1093, 404, [995, 412, 1191, 440]),
        parsed(20, 1298, 404, [1192, 412, 1405, 440]),
        parsed(21, 1467, 404, [1418, 412, 1516, 440]),
      ],
    },
    {
      src: "/manual/bank/statement-columns.jpg",
      alt: "Operatsiyalar jadvalining o'ng qismi",
      caption: "Jadvalni o'ngga suring: izoh, shartnoma, summa va qarama-qarshi hisobvaraq ustunlari.",
      width: 1568,
      height: 711,
      markers: [
        parsed(22, 736, 404, [614, 412, 859, 440]),
        parsed(23, 950, 404, [860, 412, 1040, 440]),
        parsed(24, 1138, 404, [1041, 412, 1236, 440]),
        parsed(25, 1326, 404, [1237, 412, 1417, 440], {
          callout: "Tasnifga qarab o'zi tanlanadi: 4010, 6010, 9430, 64xx…",
          calloutSide: "bottom",
        }),
      ],
    },
    {
      src: "/manual/bank/statement-missing-bank.jpg",
      alt: "Yetishmayotgan bank ma'lumotlarini belgilash oynasi",
      caption: "Ko'chirmadagi hisob raqami tashkilotda hali yo'q bo'lsa ochiladigan oyna.",
      width: 1568,
      height: 480,
      markers: [
        missingBank(26, 872, 328, [772, 339, 973, 370]),
        missingBank(27, 1071, 328, [987, 339, 1155, 370]),
        missingBank(28, 783, 404, [394, 412, 1173, 445], {
          callout: "Bank hisobi tanlanmasa — ko'chirmadagi raqam bilan yangi hisob yaratiladi",
          calloutSide: "bottom",
        }),
      ],
    },
    {
      src: "/manual/bank/statement-missing-counterparty.jpg",
      alt: "Topilmagan kontragentlarni yaratish oynasi",
      caption: "Ko'chirmadagi STIR bo'yicha topilmagan kontragentlarni shu yerning o'zida yaratish.",
      width: 1568,
      height: 520,
      markers: [
        missingCounterparty(29, 268, 270, [51, 280, 486, 440]),
        missingCounterparty(30, 607, 270, [550, 280, 665, 440]),
        missingCounterparty(31, 823, 270, [666, 280, 980, 440]),
        missingCounterparty(32, 1243, 270, [981, 280, 1505, 440]),
        missingCounterparty(33, 783, 450, [51, 453, 1516, 485]),
      ],
    },
    {
      src: "/manual/bank/statement-save.jpg",
      alt: "Saqlashni tasdiqlash oynasi",
      caption: "«Saqlash» bosilganda nechta operatsiya saqlanishi va nechtasi ekranda qolishi aytiladi.",
      width: 1568,
      height: 250,
      markers: [
        save(34, 784, 74, [614, 83, 954, 231], {
          callout: "Hujjatlar qoralama bo'lib saqlanadi — provodka tasdiqlanganda yoziladi",
          calloutSide: "right",
        }),
      ],
    },
  ],
  purpose:
    "Bank ko'chirmasidagi har bir tushum va to'lovni alohida bank hujjati (bank kirimi yoki bank chiqimi) qilib kiritish — qo'lda birma-bir yozmasdan. Tizim faylni o'qiydi, har bir operatsiyani tasniflaydi (kontragent, bank komissiyasi, inkassatsiya …), kontragent, shartnoma va qarama-qarshi hisobvaraqni o'zi qo'yadi; siz tekshirasiz, yetishmaganini to'ldirasiz va saqlaysiz.",
  why:
    "Bank hisobidagi pul harakati faqat bank hujjatlari orqali hisobga tushadi: 5110 qoldig'i, xaridor va yetkazib beruvchilar bilan hisob-kitob (4010, 6010), soliq to'lovlari va bank xarajatlari shu hujjatlardan keladi. Ko'chirmani import qilish bu hujjatlarni tez va xatosiz kiritadi, bir operatsiya ikki marta kiritilishiga yo'l qo'ymaydi va hisobdagi qoldiqni ko'chirma bilan solishtiradi.",
  prerequisites: [
    { title: "Bankdan ko'chirma: .xlsx / .xlsm yoki bank-klientning 1C fayli (.txt), 5 MB gacha" },
    { title: "Tashkilot STIRi ko'chirmadagi STIR bilan bir xil", articleId: "start/organization" },
    { title: "Hisoblar rejasida 5110 (valyuta uchun 5210) bor", articleId: "start/chart-of-accounts" },
    { title: "Kontragentlarning shartnomalari kiritilgan (bo'lmasa, shu yerda «+» bilan qo'shiladi)", articleId: "purchases/contracts" },
    { title: "Valyuta hisobi uchun — operatsiya sanalariga Markaziy bank kursi yuklangan" },
  ],
  related: {
    center: "Ko'chirma importi",
    items: [
      { title: "Bank operatsiyalari", articleId: "bank/operations" },
      { title: "Tashkilot bank hisoblari", route: "/main/settings/org-bank-accounts" },
      { title: "Kontragentlar", route: "/main/settings/counterparty" },
      { title: "Shartnomalar", articleId: "purchases/contracts" },
      { title: "Hisoblar rejasi", articleId: "start/chart-of-accounts" },
    ],
  },
  steps: [
    {
      title: "Bankni tanlang va faylni yuklang",
      text: "Ro'yxatdan ko'chirma qaysi bankdan ekanini tanlang (tizim faylni shu bankning shabloni bo'yicha o'qiydi), so'ng faylni maydonga tashlang yoki bosib tanlang.",
    },
    {
      title: "Bank hisobini belgilang",
      text: "Ko'chirmadagi hisob raqami tashkilotda hali bo'lmasa, «Yetishmayotgan bank ma'lumotlarini belgilash» ni bosing: mavjud hisobni tanlang yoki bo'sh qoldiring — yangi hisob o'zi yaratiladi.",
    },
    {
      title: "Topilmagan kontragentlarni yarating",
      text: "«Topilmagan kontragentlarni belgilash» oynasida telefon va manzilni to'ldiring — kontragentlar bir yo'la yaratilib, operatsiyalarga qo'yiladi.",
    },
    {
      title: "Qizil qatorlarni tekshiring",
      text: "«Tekshirish talab etiladi» bo'lgan qatorlarga tasnif va qarama-qarshi hisobvaraqni tanlang; kontragent operatsiyalarida shartnoma tanlanganini tekshiring.",
    },
    {
      title: "Saqlang va hujjatlarni tasdiqlang",
      text: "«Saqlash» → «Tasdiqlash». Tayyor operatsiyalar qoralama bank hujjatlari bo'lib saqlanadi; ularni Bank operatsiyalari ro'yxatida tasdiqlaganingizda provodkalar yoziladi.",
    },
  ],
  fieldGroups: [
    {
      title: "Faylni yuklash",
      fields: [
        {
          n: 1,
          name: "Bank turi",
          required: true,
          enter: "Ko'chirma olingan bank (masalan «O'zsanoatqurilishbank» ATB, «Trastbank» XAB). Bank tanlanmaguncha fayl yuklab bo'lmaydi.",
          onChange: "Fayl shu bankning shabloni va shu bankning tasniflash qoidalari bo'yicha o'qiladi.",
          affects: "Operatsiyalarning tasnifi (komissiya, inkassatsiya, kontragent …) shu bank qoidalaridan olinadi.",
        },
        {
          n: 2,
          name: "Fayl",
          required: true,
          enter:
            "Bankning Excel ko'chirmasi (.xlsx, .xlsm) yoki bank-klientdan «1C ga eksport» qilingan fayl (1CClientBankExchange, .txt). Hajmi 5 MB gacha. Eski .xls faylni Excel'da ochib, .xlsx qilib saqlang.",
          onChange:
            "Fayl o'qiladi va har bir hisob raqami alohida kartochka bo'lib chiqadi. 1C fayli tanlangan bankdan qat'i nazar o'qiladi. Yangi fayl yuklash uchun avval «Tozalash» ni bosing.",
          affects: "Hali hech narsa saqlanmaydi — faqat ekranga chiqadi.",
        },
        {
          n: 3,
          name: "Tozalash",
          enter: "Yuklangan ko'chirmani, filtrlarni va saqlanmagan o'zgarishlarni butunlay tozalaydi.",
          affects: "Saqlangan hujjatlarga ta'sir qilmaydi.",
        },
        {
          n: 4,
          name: "Saqlash",
          enter: "Kamida bitta operatsiya to'liq bo'lganda faol bo'ladi. Pastda «Saqlash» bo'limiga qarang.",
        },
      ],
    },
    {
      title: "Filtrlar va xulosa",
      fields: [
        {
          n: 5,
          name: "Yangi / Mavjud / Barchasi",
          enter:
            "Yangi — tizimda hali yo'q operatsiyalar (standart). Mavjud — avval kiritilganlari: bank hisobi, bank hujjat raqami, sana, yo'nalish va summa bir xil bo'lgan, bekor qilinmagan hujjat bor. Barchasi — hammasi.",
          affects: "Mavjud operatsiyalar kulrang, o'zgartirilmaydi va qayta saqlanmaydi.",
        },
        {
          n: 6,
          name: "Sana oralig'i",
          enter: "Faqat shu kunlardagi operatsiyalarni ko'rsatadi.",
          affects: "Faqat ko'rinishga ta'sir qiladi — saqlashda filtrdan qat'i nazar barcha tayyor operatsiyalar saqlanadi.",
        },
        {
          n: 7,
          name: "Tasniflash (filtr)",
          enter: "Faqat tanlangan turdagi operatsiyalarni ko'rsatadi, masalan «Tekshirish talab etiladi».",
          affects: "Faqat ko'rinishga ta'sir qiladi.",
        },
        {
          n: 8,
          name: "Saqlashga tayyor",
          enter: "Hamma majburiy ma'lumoti to'ldirilgan operatsiyalar soni — «Saqlash» aynan shularni saqlaydi.",
          affects:
            "Operatsiya tayyor bo'lishi uchun: tashkilot bank hisobi va bank hisobvarag'i (5110), tasnif, qarama-qarshi hisobvaraq; «Kontragent» tasnifida — kontragent va shartnoma ham.",
        },
        {
          n: 9,
          name: "… ta operatsiyada majburiy ma'lumot yetishmaydi",
          enter: "Hali to'ldirilmagan yangi operatsiyalar soni. Ular saqlanmaydi, ekranda qoladi.",
        },
        {
          n: 10,
          name: "Yetishmayotgan bank ma'lumotlarini belgilash",
          enter: "Ko'chirmadagi hisob raqami tashkilot bank hisoblarida topilmaganda yoki valyutasi noma'lum bo'lganda faol. Oyna ochiladi (pastga qarang).",
        },
        {
          n: 11,
          name: "Topilmagan kontragentlarni belgilash",
          enter: "Ko'chirmadagi STIR bo'yicha topilmagan kontragentlar soni (bir kontragentga bir nechta operatsiya bo'lsa ham bitta). Oyna ochiladi (pastga qarang).",
        },
      ],
    },
    {
      title: "Hisob raqami kartochkasi",
      fields: [
        {
          n: 12,
          name: "Bank, fayl va hisob raqami",
          enter: "Ko'chirmadagi bank filiali, fayl nomi, operatsiyalar soni va tashkilotning hisob raqami. Sarlavhani bossangiz, jadval yig'iladi yoki ochiladi.",
        },
        {
          n: 13,
          name: "Sana · Valyuta · Boshlang'ich balans · Yakuniy qoldiq · Debet · Kredit",
          enter:
            "Ko'chirmaning o'zidan: davr, valyuta, davr boshi va oxiridagi qoldiq, kirimlar (Debet) va chiqimlar (Kredit) jami. O'zgartirilmaydi.",
          affects:
            "Hisobdagi qoldiq ko'chirmaning boshlang'ich balansidan farq qilsa, qizil yozuv chiqadi: «Hisobdagi qoldiq: … — ko'chirma bilan mos emas». Bu oldingi davr operatsiyalari to'liq kiritilmaganini bildiradi.",
        },
        {
          n: 14,
          name: "O'chirish",
          enter: "Butun kartochkani (shu hisob raqamining barcha operatsiyalarini) ekrandan olib tashlaydi.",
          affects: "Hech narsa saqlanmaydi; tizimdagi hujjatlarga ta'sir qilmaydi.",
        },
        {
          n: 15,
          name: "Bank hisobvarag'i",
          required: true,
          enter: "Bu hisob raqami qaysi buxgalteriya hisobida yuritiladi: so'm uchun 5110, valyuta uchun 5210 — o'zi qo'yiladi.",
          affects: "Barcha operatsiyalarning bank tomoni: kirimda Dt 5110, chiqimda Kt 5110.",
        },
      ],
    },
    {
      title: "Operatsiyalar jadvali",
      fields: [
        {
          name: "Sana · Bank hujjat raqami",
          enter: "Ko'chirmadan. O'zgartirilmaydi.",
          affects: "Bank hujjati shu sana bilan yoziladi; hujjat raqami takroriy kiritishni aniqlashda ishlatiladi.",
        },
        {
          n: 16,
          name: "Hisob raqami (ko'chirmadan)",
          enter: "Pul kelgan yoki ketgan kontragentning hisob raqami, ko'chirmadagidek.",
        },
        {
          n: 17,
          name: "Kontragent",
          enter: "Ko'chirmadagi nom. Tizim kontragentni STIR bo'yicha topadi; topilmasa — «Topilmagan kontragentlarni belgilash» orqali yarating.",
          affects: "Hisob-kitob shu kontragent bo'yicha yuritiladi (4010 / 6010 analitikasi).",
        },
        {
          n: 18,
          name: "Hisob raqami (kontragentniki)",
          enter:
            "Kontragentning tizimda saqlangan bank hisoblaridan biri. Yo'q bo'lsa, «+» bilan ko'chirmadagi raqamni kontragentga qo'shing — u shu kontragentning shu raqamli barcha qatorlariga qo'yiladi.",
          affects: "Majburiy emas; hujjatda kontragent hisobi sifatida ko'rinadi.",
        },
        {
          n: 19,
          name: "Tasniflash",
          required: true,
          enter:
            "Operatsiya turi: Kontragent, Bank komissiyasi, Bank xizmati, Terminal / ekvayring, Inkassatsiya, Ustav kapitaliga badal, Jismoniy shaxs kartasi. Bank qoidalari bo'yicha o'zi tanlanadi; hech bir qoidaga tushmasa — «Tekshirish talab etiladi» (qator qizil).",
          onChange:
            "Bog'langan hujjat tozalanadi, qarama-qarshi hisobvaraq yangi turga qarab qayta tanlanadi (o'zingiz tanlagan hisob saqlanadi). Kontragent va Bank xizmatidan boshqa turda kontragent va shartnoma olib tashlanadi.",
          affects: "Qaysi qarama-qarshi hisobvaraq va qaysi turdagi bank hujjati (masalan, «Xaridordan to'lov») yaratilishini belgilaydi.",
        },
        {
          n: 20,
          name: "Bog'langan hujjat",
          enter:
            "Ixtiyoriy: to'lov qaysi hujjat uchun ekanini ko'rsatish — tushumda sotuv, to'lovda xarid hujjati; inkassatsiyada inkassatsiya hujjati.",
          affects: "To'lov aynan shu hujjatni yopadi; bir inkassatsiyani ikki marta bog'lab bo'lmaydi.",
        },
        {
          n: 21,
          name: "Amallar (o'chirish)",
          enter: "Qatorni ekrandan olib tashlaydi (tasdiqlash so'raladi). Mavjud operatsiyalarda faol emas.",
          affects: "Faqat ekrandan — bu operatsiya saqlanmaydi.",
        },
        {
          n: 22,
          name: "Izoh",
          enter: "To'lov maqsadi, ko'chirmadagidek. Ustiga borsangiz to'liq matn chiqadi.",
          affects: "Saqlangan bank hujjatining izohiga yoziladi.",
        },
        {
          n: 23,
          name: "Shartnoma",
          required: true,
          enter:
            "Faqat «Kontragent» va «Bank xizmati» turlarida. Kontragentning shartnomasi o'zi qo'yiladi; yo'q bo'lsa, «+» bilan yarating — tushumda xaridor, to'lovda yetkazib beruvchi shartnomasi ochiladi.",
          affects: "Hisob-kitob shartnoma bo'yicha yuritilsa, qarz va avans shu shartnoma kesimida hisoblanadi.",
        },
        {
          n: 24,
          name: "Debet · Kredit",
          enter: "Summa: Debet — hisobga tushgan pul, Kredit — hisobdan chiqqan pul. O'zgartirilmaydi.",
        },
        {
          n: 25,
          name: "Qarama-qarshi hisobvaraq",
          required: true,
          enter:
            "Tasnif va yo'nalishga qarab o'zi tanlanadi: xaridordan tushum — 4010; yetkazib beruvchiga to'lov — 6010; bank komissiyasi va xizmati — 9430; ustav kapitaliga badal — 4610; inkassatsiya va ekvayring — 5710. To'lov maqsadida soliq belgisi bo'lsa — soliq hisobi: JShDS 6420, QQS 6410, foyda solig'i 6430, INPS 6530 va h.k.",
          onChange: "Tanlangan hisob operatsiya turiga mos kelmasa, operatsiya turi «Boshqa kirim / Boshqa chiqim» bo'ladi.",
          affects: "Provodkaning ikkinchi tomoni: kirimda Kt, chiqimda Dt shu hisob.",
        },
      ],
    },
    {
      title: "Yetishmayotgan bank ma'lumotlari oynasi",
      fields: [
        {
          n: 26,
          name: "Bank hisobi",
          enter: "Bu hisob raqamini tashkilotning mavjud bank hisoblaridan biriga bog'lash. Bo'sh qoldirilsa — yangi hisob yaratiladi.",
          affects:
            "Yangi hisob ko'chirmadagi bank, filial, raqam va valyuta bilan Sozlamalar → Tashkilot bank hisoblariga qo'shiladi (asosiy emas).",
        },
        {
          n: 27,
          name: "Valyuta",
          required: true,
          enter: "Ko'chirma valyutani ko'rsatmagan bo'lsa so'raladi (O'zbek so'mi, AQSh dollari …).",
          affects: "Bank hisobvarag'i (5110 yoki 5210) va valyuta kursi shunga qarab olinadi.",
        },
        {
          n: 28,
          name: "Yakunlash",
          enter: "Tanlanganlarni saqlaydi: kerak bo'lsa hisobni yaratadi va kartochkaga qo'yadi.",
          onChange: "Muvaffaqiyatli bo'lsa «Bank hisoblari muvaffaqiyatli qo'shildi» chiqadi va kartochka qizil rangdan chiqadi.",
        },
      ],
    },
    {
      title: "Topilmagan kontragentlar oynasi",
      fields: [
        {
          n: 29,
          name: "Kontragent · Soni",
          enter: "Ko'chirmadagi nom va shu kontragentga tegishli operatsiyalar soni. Nom yoki STIR faylda bo'lmasa, shu yerda yoziladi.",
        },
        {
          n: 30,
          name: "QQS to'lovchisi",
          enter: "Kontragent QQS to'lovchi bo'lsa belgilang.",
          affects: "Kontragent kartochkasida saqlanadi; hisob-faktura va QQS hisobida ishlatiladi.",
        },
        {
          n: 31,
          name: "Telefon raqami · Email",
          required: true,
          enter: "Telefon +998 formatida (99 123-45-67) — majburiy. Email — ixtiyoriy.",
        },
        {
          n: 32,
          name: "Viloyat · Tuman · Manzil",
          required: true,
          enter: "Kontragentning manzili. STIR bo'yicha ma'lumot topilsa, o'zi to'ladi.",
        },
        {
          n: 33,
          name: "Yakunlash",
          enter: "Barcha kontragentlarni bir yo'la yaratadi va operatsiyalarga qo'yadi.",
          onChange: "«Kontragentlar muvaffaqiyatli yaratildi» chiqadi; shartnomani keyin tanlash yoki «+» bilan yaratish kerak.",
          affects: "Kontragentlar Sozlamalar → Kontragentlar ro'yxatiga qo'shiladi.",
        },
      ],
    },
    {
      title: "Saqlash",
      fields: [
        {
          n: 34,
          name: "Saqlashni tasdiqlaysizmi?",
          enter:
            "Nechta operatsiya saqlanishi, nechtasi to'ldirilmagani uchun ekranda qolishi va nechta mavjud operatsiya qayta saqlanmasligi yoziladi. «Tasdiqlash» — saqlash, «Bekor qilish» — ortga.",
          onChange:
            "Hammasi saqlansa — «Bank operatsiyalari saqlandi» va Bank operatsiyalari ro'yxati ochiladi. Bir qismi saqlansa — saqlanganlari «Mavjud» bo'lib qoladi, qolganini to'ldirib yana saqlaysiz.",
          affects:
            "Har bir operatsiya alohida bank hujjati bo'lib, raqam bilan va «Qoralama» holatida saqlanadi. Hamma operatsiyalar bitta tranzaksiyada saqlanadi: bittasida xato bo'lsa, birortasi ham saqlanmaydi.",
        },
      ],
    },
  ],
  postings: {
    intro:
      "Import paytida provodka yozilmaydi — hujjatlar qoralama bo'lib saqlanadi. Har bir hujjatni Bank operatsiyalari ro'yxatida tasdiqlaganingizda quyidagi provodkalar yoziladi (misol — namunaviy ko'chirma).",
    entries: [
      {
        when: "Xaridordan pul tushdi",
        debit: "5110",
        credit: "4010",
        amount: "15 000 000",
        note: "Kontragent va shartnoma bo'yicha. Qarzdan ortig'i avans bo'lib qoladi.",
      },
      {
        when: "Yetkazib beruvchiga to'lov",
        debit: "6010",
        credit: "5110",
        amount: "12 500 000",
        note: "Qarzdan ortig'i yetkazib beruvchiga berilgan avans bo'ladi.",
      },
      {
        when: "Bank komissiyasi",
        debit: "9430",
        credit: "5110",
        amount: "25 000",
      },
      {
        when: "Soliq to'lovi (masalan JShDS)",
        debit: "6420",
        credit: "5110",
        amount: "4 200 000",
        note: "Hisob to'lov maqsadidagi soliq turidan tanlanadi: QQS — 6410, foyda solig'i — 6430, INPS — 6530 …",
      },
      {
        when: "Inkassatsiya yoki terminal tushumi",
        debit: "5110",
        credit: "5710",
        amount: "Tushum summasi",
      },
    ],
    cancel:
      "tasdiqlangan bank hujjati bekor qilinsa, uning provodkalari storno qilinadi. Bekor qilingan hujjat «Mavjud» hisoblanmaydi — shu operatsiyani ko'chirmadan qayta import qilish mumkin.",
  },
  errors: [
    {
      message: "Ko'chirmadagi STIR joriy tashkilot STIRiga mos emas.",
      cause: "Ko'chirma boshqa tashkilotniki yoki yuqorida boshqa tashkilot tanlangan.",
      fix: "Yuqoridagi tashkilot tanlovidan ko'chirma egasini tanlang yoki to'g'ri faylni yuklang.",
    },
    {
      message: "Eski XLS formatidagi fayl o'qilmaydi. Faylni Excel'da ochib, «Saqlash» → XLSX qilib saqlang va qayta yuklang.",
      cause: "Bank faylni eski Excel (XLS) formatida bergan.",
      fix: "Faylni Excel'da oching → «Saqlash boshqacha» → XLSX → qayta yuklang.",
    },
    {
      message: "Faylni o'qib bo'lmadi: u buzilgan yoki Excel (XLSX, XLSM) fayli emas.",
      cause: "Fayl to'liq yuklab olinmagan, buzilgan yoki kengaytmasi o'zgartirilgan.",
      fix: "Ko'chirmani bank-klientdan qayta yuklab oling va shu faylni yuklang.",
    },
    {
      message: "Bu turdagi fayl qabul qilinmaydi.",
      cause: "Fayl Excel ham, 1C almashinuv fayli ham emas (masalan, PDF yoki rasm).",
      fix: "Bank-klientdan ko'chirmani Excel (XLSX) yoki «1C ga eksport» (.txt) ko'rinishida oling.",
    },
    {
      message: "Excel fayl hajmi 5 MB dan oshmasligi kerak",
      cause: "Fayl juda katta (odatda juda uzoq davr uchun ko'chirma).",
      fix: "Bankdan ko'chirmani qisqaroq davrlarga (masalan, oyma-oy) bo'lib oling.",
    },
    {
      message: "Fayl … ko'chirmasi shakliga mos kelmadi. Bank to'g'ri tanlanganini tekshiring.",
      cause: "Tanlangan bank faylni bergan bank emas yoki bank ko'chirma shaklini o'zgartirgan.",
      fix: "Yuqoridagi bank turini tekshirib, faylni qayta yuklang. Bank to'g'ri bo'lsa, faylni qo'llab-quvvatlash xizmatiga yuboring — shakl qo'shiladi.",
    },
    {
      message: "Fayl 1C almashinuv fayli emas (1CClientBankExchange).",
      cause: ".txt fayl bank-klientning 1C formatida emas.",
      fix: "Bank-klientda «1C ga eksport» (kl_to_1c.txt) faylini qayta oling.",
    },
    {
      message: "Saqlash uchun to'liq operatsiya topilmadi",
      cause: "Birorta operatsiyada barcha majburiy ma'lumot yo'q.",
      fix: "Xulosadagi tugmalar orqali bank hisobi va kontragentlarni belgilang, qizil qatorlarda tasnif, shartnoma va hisobvaraqni tanlang.",
    },
    {
      message: "… sanadagi … bank hujjat raqamli operatsiya allaqachon mavjud.",
      cause: "Shu operatsiya siz ekranda ishlayotgan paytda boshqa yo'l bilan kiritilgan.",
      fix: "«Tozalash» ni bosib, ko'chirmani qayta yuklang — u operatsiya «Mavjud» bo'lib chiqadi.",
    },
    {
      message: "Telefon raqamini +998 formatida kiriting · Kontragent ma'lumotlarini to'liq to'ldiring",
      cause: "Topilmagan kontragentlar oynasida telefon noto'g'ri yoki majburiy maydon bo'sh.",
      fix: "Telefonni 99 123-45-67 ko'rinishida yozing; viloyat, tuman va manzilni to'ldiring.",
    },
    {
      message: "Bank ma'lumotlarini to'liq tanlang",
      cause: "Yetishmayotgan bank ma'lumotlari oynasida valyuta yoki operatsiya turi tanlanmagan.",
      fix: "Har bir qatorda valyutani tanlang va «Yakunlash» ni qayta bosing.",
    },
  ],
  tips: [
    "Ko'chirmani muntazam (masalan, har hafta) yuklang: avval kiritilgan operatsiyalar o'zi «Mavjud» bo'lib ajraladi, faqat yangilari saqlanadi — davrlar ustma-ust tushsa ham hech narsa ikki marta kiritilmaydi.",
    "Ish yarim qolsa ham tashvishlanmang: yuklangan ko'chirma va qilgan o'zgarishlaringiz brauzerda saqlanib turadi, sahifaga qaytsangiz davom etasiz. Faqat «Tozalash» yoki to'liq saqlash ularni o'chiradi.",
    "Kartochkada «Hisobdagi qoldiq … mos emas» chiqsa, avval oldingi davr ko'chirmasini import qiling — aks holda 5110 qoldig'i bank bilan mos kelmaydi.",
    "«Filtr → Tasniflash → Tekshirish talab etiladi» bilan faqat qo'lda ko'rish kerak bo'lgan qatorlarni qoldiring.",
  ],
  topics: [
    { title: "Bank operatsiyalari", articleId: "bank/operations" },
    { title: "Valyutadagi to'lovlar va kurs farqi", articleId: "bank/currency" },
    { title: "Inkassatsiya", articleId: "cash/collection" },
    { title: "Shartnomalar", articleId: "purchases/contracts" },
    { title: "Provodkalar jurnali", articleId: "accounting/journal" },
  ],
};
