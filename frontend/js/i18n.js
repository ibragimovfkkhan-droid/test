const DICT = {
  uz: {
    navHome: "Bosh sahifa", navShop: "Mahsulotlar", navAbout: "Biz haqimizda", navContact: "Aloqa", cartBtn: "Savat",
    footAbout: "Konsentrlangan kir yuvish listlari zamonaviy uy uchun. O'zbekistonda rasmiy distribyutor.",
    footNav1: "Do'kon", fL1: "Ocean", fL2: "Wild Lavender",
    footNav2: "Kompaniya", fL3: "Biz haqimizda", fL4: "Aloqa",
    footNav3: "Aloqa", footRights: "Barcha huquqlar himoyalangan",

    // HOME
    pill: "Yangi: Ocean seriyasi",
    heroTitle: "Kir yuvish<br><span class=\"accent\">juda oson</span>",
    heroSub: "Poroshoksiz, o'lchovsiz, dozasiz. Velira — konsentrlangan kir yuvish listlari, har qanday mashinaga mos.",
    ctaBtn1: "Hoziroq xarid qiling", ctaBtn2: "Qanday ishlaydi",
    stat1: "stirka bir qutida", stat2: "fosfat va xlor", stat3: "sovuq suvda ham ishlaydi",
    t1: "FOSFATSIZ", t2: "TO'LIQ ERIYDI", t3: "GIPOALLERGEN", t4: "SAFAR UCHUN QULAY",
    featEyebrow: "Nega Velira", featTitle: "Kichik list, katta natija",
    f1t: "Bioparchalanuvchi", f1d: "Tabiat va septik tizimlar uchun xavfsiz tarkib.",
    f2t: "To'liq eriydi", f2d: "Sovuq suvda ham izsiz eriydi, mashinani toza saqlaydi.",
    f3t: "Matoni asraydi", f3d: "Rangni va tolalar tuzilishini uzoq vaqt saqlaydi.",
    f4t: "Safar uchun qulay", f4d: "Yupqa, yengil, oqmaydi — chamadonga sig'adi.",
    homeProdEyebrow: "Mahsulotlar", homeProdTitle: "Ikki hid, bir formula",
    seeAll: "Barchasini ko'rish →",
    stepEyebrow: "Foydalanish", stepTitle: "Uch qadam, bir natija",
    s1t: "Listni oling", s1d: "Kerakli miqdorni ajratib oling — kichik yuklama uchun yarmi yetadi.",
    s2t: "Barabanga soling", s2d: "Kiyimlar bilan birga to'g'ridan-to'g'ri joylang.",
    s3t: "Yuvishni boshlang", s3d: "Har qanday dastur va haroratda ishlaydi.",
    homeCtaTitle: "Birinchi buyurtmangizni bering", homeCtaSub: "Toshkent bo'ylab yetkazib berish 24 soat ichida.",
    homeCtaBtn: "Xarid qilishni boshlash",

    // SHOP
    shopEyebrow: "Katalog", shopTitle: "Barcha mahsulotlar",
    shopSub: "Ikkala hidimiz ham bir xil kuchli formulaga ega — sizga yoqqanini tanlang.",
    tagOc: "Ocean", tag60: "60 stirka", tagLav: "Wild Lavender", tag100: "100 stirka",
    addToCart: "Savatga qo'shish", inCart: "Savatda",

    // CART / CHECKOUT
    cartTitle: "Sizning savatingiz", cartEmpty: "Savat hali bo'sh", cartTotal: "Jami",
    checkoutBtn: "Buyurtma berish", checkoutTitle: "Buyurtmani rasmiylashtirish",
    checkoutSub: "Ma'lumotlaringizni qoldiring — administrator siz bilan bog'lanadi.",
    labelName: "Ismingiz", labelPhone: "Telefon raqam", labelEmail: "Email", labelAddress: "Manzil (ixtiyoriy)", labelComment: "Izoh (ixtiyoriy)",
    placeholderName: "Ism Familiya", placeholderPhone: "+998 90 000 00 00", placeholderEmail: "email@example.com", placeholderAddress: "Shahar, ko'cha, uy",
    placeholderComment: "Qo'shimcha izoh...",
    submitOrder: "Buyurtmani tasdiqlash",
    orderSuccess: "Rahmat! Buyurtmangiz qabul qilindi, tez orada bog'lanamiz.",
    orderError: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring yoki Telegram orqali yozing.",
    addedToast: "Savatga qo'shildi",
    sentBtn: "Yuborildi", errorBtn: "Xatolik",

    // ABOUT
    aboutEyebrow: "Biz haqimizda", aboutTitle: "Toza kiyim — sodda marosim",
    aboutIntro: "Velira 2024-yilda Toshkentda tashkil topgan — maqsadimiz kir yuvishni og'ir yumushdan sodda va yoqimli odatga aylantirish edi.",
    missionEyebrow: "Missiyamiz", missionTitle: "Nega biz buni qilamiz",
    missionText: "Poroshok qutilari og'ir, o'lchash noqulay, ortiqcha kimyoviy moddalar esa terini quritadi. Biz bitta yupqa listda — to'g'ri doza, kuchli formula va yoqimli hidni birlashtirdik. Har bir list aniq bir marta yuvish uchun mo'ljallangan — ortiqcha sarflash yo'q.",
    valuesEyebrow: "Qadriyatlarimiz", valuesTitle: "Bizni boshqaradigan uchta narsa",
    v1t: "Halollik", v1d: "Tarkibda yashirin narsa yo'q — har bir ingredient qadoqda ko'rsatilgan.",
    v2t: "Sifat", v2d: "Har bir partiya sinovdan o'tadi, faqat standartlarga javob beradigan mahsulot yetkaziladi.",
    v3t: "G'amxo'rlik", v3d: "Mijoz savoliga tez javob, muammoga tezkor yechim — bizning odatimiz.",
    teamEyebrow: "Jamoa", teamTitle: "Kichik jamoa, katta g'amxo'rlik",
    teamText: "Velira ortida O'zbekistondagi kichik jamoa turibdi — mahsulot tanlovidan tortib, har bir buyurtmani yetkazib berishgacha. Savolingiz bo'lsa, to'g'ridan-to'g'ri Telegram orqali yozing — bot emas, jonli odam javob beradi.",

    // CONTACT
    contactEyebrow: "Aloqa", contactTitle: "Biz bilan bog'laning",
    contactSub: "Savol, taklif yoki hamkorlik uchun quyidagi forma orqali yozing — yoki to'g'ridan-to'g'ri Telegramga o'ting.",
    contactFormTitle: "Xabar yuborish",
    labelContact: "Telefon yoki Telegram", placeholderContact: "+998 90 000 00 00 yoki @username",
    labelMessage: "Xabar", placeholderMessage: "Savolingizni yozing...",
    sendMessage: "Yuborish",
    msgSuccess: "Xabaringiz yuborildi! Tez orada javob beramiz.",
    msgError: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
    contactInfoEyebrow: "Bog'lanish",
    contactInfoTitle: "To'g'ridan-to'g'ri aloqa",
    contactInfoText: "Tezkor javob uchun Telegram orqali yozishni tavsiya qilamiz.",
    telegramCtaBtn: "Telegramda yozish",
    contactFormSub: "Odatda bir necha soat ichida javob beramiz.",
    contactTelegramLabel: "Telegram", contactInstagramLabel: "Instagram", contactPhoneLabel: "Telefon", contactEmailLabel: "Email",
    contactAddressLabel: "Manzil", contactAddressValue: "Toshkent shahri, O'zbekiston",

    // HOME product cards (static, non-shop-grid)
    prodOceanDesc: "Yangi va tiniq aroma, sovuq suvda ham samarali, kundalik foydalanish uchun.",
    prodLavDesc: "Dala lavandasining nafis hidi, uy uchun uzoq muddatli yangilik.",

    // CONTACT brand strip
    brandLabel: "Brend", brandTagline: "Konsentrlangan kir yuvish listlari brendi.",
    pricesLabel: "Narxlar", price100Label: "100 talik", price60Label: "60 talik", somWord: "so'm",
    originLabel: "Kelib chiqishi", originMakeLabel: "Ishlab chiqarish", originMakeVal: "Xitoy",
    originRawLabel: "Xom-ashyo", originRawVal: "Italiya",
  },
  ru: {
    navHome: "Главная", navShop: "Продукты", navAbout: "О нас", navContact: "Контакты", cartBtn: "Корзина",
    footAbout: "Концентрированные листы для стирки для современного дома. Официальный дистрибьютор в Узбекистане.",
    footNav1: "Магазин", fL1: "Ocean", fL2: "Wild Lavender",
    footNav2: "Компания", fL3: "О нас", fL4: "Контакты",
    footNav3: "Контакты", footRights: "Все права защищены",

    // HOME
    pill: "Новинка: серия Ocean",
    heroTitle: "Стирка теперь —<br><span class=\"accent\">очень просто</span>",
    heroSub: "Без порошка, без отмеривания, без дозировки. Velira — концентрированные листы для стирки, подходят для любой машины.",
    ctaBtn1: "Купить сейчас", ctaBtn2: "Как это работает",
    stat1: "стирок в коробке", stat2: "фосфатов и хлора", stat3: "работает даже в холодной воде",
    t1: "БЕЗ ФОСФАТОВ", t2: "ПОЛНОСТЬЮ РАСТВОРЯЕТСЯ", t3: "ГИПОАЛЛЕРГЕННО", t4: "УДОБНО В ПОЕЗДКЕ",
    featEyebrow: "Почему Velira", featTitle: "Маленький лист, большой результат",
    f1t: "Биоразлагаемый", f1d: "Состав безопасен для природы и септических систем.",
    f2t: "Полностью растворяется", f2d: "Растворяется без следа даже в холодной воде, очищает саму машину.",
    f3t: "Бережёт ткани", f3d: "Сохраняет цвет и структуру волокон надолго.",
    f4t: "Удобно в дороге", f4d: "Тонкий, лёгкий, не протекает — помещается в чемодан.",
    homeProdEyebrow: "Продукты", homeProdTitle: "Два аромата, одна формула",
    seeAll: "Смотреть все →",
    stepEyebrow: "Использование", stepTitle: "Три шага, один результат",
    s1t: "Возьмите лист", s1d: "Оторвите нужное количество — для небольшой загрузки хватит половины.",
    s2t: "Положите в барабан", s2d: "Поместите прямо в барабан вместе с бельём.",
    s3t: "Начните стирку", s3d: "Работает при любой программе и температуре.",
    homeCtaTitle: "Оформите первый заказ", homeCtaSub: "Доставка по Ташкенту в течение 24 часов.",
    homeCtaBtn: "Начать покупку",

    // SHOP
    shopEyebrow: "Каталог", shopTitle: "Все продукты",
    shopSub: "Оба аромата имеют одинаково сильную формулу — выберите тот, что нравится.",
    tagOc: "Ocean", tag60: "60 стирок", tagLav: "Wild Lavender", tag100: "100 стирок",
    addToCart: "В корзину", inCart: "В корзине",

    // CART / CHECKOUT
    cartTitle: "Ваша корзина", cartEmpty: "Корзина пока пуста", cartTotal: "Итого",
    checkoutBtn: "Оформить заказ", checkoutTitle: "Оформление заказа",
    checkoutSub: "Оставьте свои данные — администратор свяжется с вами.",
    labelName: "Ваше имя", labelPhone: "Номер телефона", labelEmail: "Email", labelAddress: "Адрес (необязательно)", labelComment: "Комментарий (необязательно)",
    placeholderName: "Имя Фамилия", placeholderPhone: "+998 90 000 00 00", placeholderEmail: "email@example.com", placeholderAddress: "Город, улица, дом",
    placeholderComment: "Дополнительный комментарий...",
    submitOrder: "Подтвердить заказ",
    orderSuccess: "Спасибо! Ваш заказ принят, мы скоро свяжемся с вами.",
    orderError: "Произошла ошибка. Попробуйте ещё раз или напишите в Telegram.",
    addedToast: "Добавлено в корзину",
    sentBtn: "Отправлено", errorBtn: "Ошибка",

    // ABOUT
    aboutEyebrow: "О нас", aboutTitle: "Чистая одежда — простой ритуал",
    aboutIntro: "Velira основана в 2024 году в Ташкенте — наша цель была превратить стирку из тяжёлой рутины в простую и приятную привычку.",
    missionEyebrow: "Наша миссия", missionTitle: "Почему мы этим занимаемся",
    missionText: "Коробки с порошком тяжёлые, отмеривать неудобно, а лишняя химия сушит кожу. Мы объединили точную дозу, сильную формулу и приятный аромат в одном тонком листе. Каждый лист рассчитан ровно на одну стирку — без перерасхода.",
    valuesEyebrow: "Наши ценности", valuesTitle: "Три вещи, которые нас направляют",
    v1t: "Честность", v1d: "В составе нет ничего скрытого — каждый ингредиент указан на упаковке.",
    v2t: "Качество", v2d: "Каждая партия проходит проверку, до полки доходит только то, что соответствует стандартам.",
    v3t: "Забота", v3d: "Быстрый ответ на вопрос, оперативное решение проблемы — наша привычка.",
    teamEyebrow: "Команда", teamTitle: "Маленькая команда, большая забота",
    teamText: "За Velira стоит небольшая команда в Узбекистане — от выбора продукта до доставки каждого заказа. Если есть вопрос, пишите прямо в Telegram — отвечает не бот, а живой человек.",

    // CONTACT
    contactEyebrow: "Контакты", contactTitle: "Свяжитесь с нами",
    contactSub: "По вопросам, предложениям или сотрудничеству напишите через форму ниже — или сразу перейдите в Telegram.",
    contactFormTitle: "Отправить сообщение",
    labelContact: "Телефон или Telegram", placeholderContact: "+998 90 000 00 00 или @username",
    labelMessage: "Сообщение", placeholderMessage: "Напишите ваш вопрос...",
    sendMessage: "Отправить",
    msgSuccess: "Сообщение отправлено! Мы скоро ответим.",
    msgError: "Произошла ошибка. Попробуйте ещё раз.",
    contactInfoEyebrow: "Связь",
    contactInfoTitle: "Прямая связь",
    contactInfoText: "Для быстрого ответа рекомендуем писать в Telegram.",
    telegramCtaBtn: "Написать в Telegram",
    contactFormSub: "Обычно отвечаем в течение нескольких часов.",
    contactTelegramLabel: "Telegram", contactInstagramLabel: "Instagram", contactPhoneLabel: "Телефон", contactEmailLabel: "Email",
    contactAddressLabel: "Адрес", contactAddressValue: "г. Ташкент, Узбекистан",

    // HOME product cards (static, non-shop-grid)
    prodOceanDesc: "Свежий и чистый аромат, эффективен даже в холодной воде, для ежедневного использования.",
    prodLavDesc: "Нежный аромат полевой лаванды, долгая свежесть для дома.",

    // CONTACT brand strip
    brandLabel: "Бренд", brandTagline: "Бренд концентрированных листов для стирки.",
    pricesLabel: "Цены", price100Label: "На 100 стирок", price60Label: "На 60 стирок", somWord: "сум",
    originLabel: "Происхождение", originMakeLabel: "Производство", originMakeVal: "Китай",
    originRawLabel: "Сырьё", originRawVal: "Италия",
  }
};

function applyLang(lang) {
  document.querySelectorAll('[data-i]').forEach(el => {
    const key = el.getAttribute('data-i');
    if (DICT[lang][key] !== undefined) el.innerHTML = DICT[lang][key];
  });
  document.querySelectorAll('[data-i-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i-placeholder');
    if (DICT[lang][key] !== undefined) el.setAttribute('placeholder', DICT[lang][key]);
  });
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang;
  localStorage.setItem('velira_lang', lang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function initLang() {
  const saved = localStorage.getItem('velira_lang') || 'ru';
  applyLang(saved);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle button');
    if (btn) applyLang(btn.dataset.lang);
  });
}

document.addEventListener('DOMContentLoaded', initLang);
