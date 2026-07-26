# Velira.uz — Fullstack sayt

Kir yuvish varaqlari (Velira) uchun to'liq sayt: Bosh sahifa, Mahsulotlar (katalog + savat + buyurtma), Biz haqimizda, Aloqa. UZ/RU tillari, buyurtma va murojaatlar avtomatik ravishda Telegram'ga yuboriladi.

## Tuzilma

```
velira-fullstack/
├── backend/                 Node.js + Express server
│   ├── server.js            Asosiy fayl — API va frontendni serve qiladi
│   ├── routes/
│   │   ├── products.js      GET /api/products, /api/products/:id
│   │   ├── orders.js        POST /api/orders  (buyurtma -> Telegram)
│   │   └── contact.js       POST /api/contact (murojaat -> Telegram)
│   ├── utils/
│   │   ├── telegram.js      Telegram Bot API orqali xabar yuborish
│   │   └── store.js         data/*.json fayllarni o'qish/yozish
│   ├── data/
│   │   ├── products.json    Mahsulotlar (narx, tavsif, rasm — UZ/RU)
│   │   ├── orders.json      Kelib tushgan buyurtmalar shu yerga yoziladi
│   │   └── messages.json    Aloqa formasidan kelgan xabarlar
│   ├── .env.example         Muhit o'zgaruvchilari namunasi
│   └── package.json
└── frontend/                Statik sayt (backend orqali serve qilinadi)
    ├── index.html            Bosh sahifa
    ├── shop.html              Mahsulotlar katalogi
    ├── about.html             Biz haqimizda
    ├── contact.html           Aloqa (forma + Telegram/Instagram)
    ├── css/style.css
    ├── js/
    │   ├── components.js      Header/Footer (ijtimoiy tarmoq havolalari shu yerda)
    │   ├── i18n.js             UZ/RU lug'at va tilni almashtirish
    │   ├── api.js               Backend bilan aloqa (fetch)
    │   └── cart.js              Savat, checkout modal
    └── images/
```

Bitta Node server ham API'ni, ham saytni beradi — shuning uchun deploy qilish oson: bitta app, bitta domen (`velira.uz`).

## 1. Talablar

- Node.js 18 yoki undan yuqori (global `fetch` kerak)
- npm

## 2. O'rnatish (lokal test uchun)

```bash
cd backend
npm install
cp .env.example .env
```

`.env` faylini oching va quyidagilarni to'ldiring (pastdagi Telegram bo'limiga qarang):

```
PORT=3000
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Serverni ishga tushiring:

```bash
npm start
```

Brauzerda oching: `http://localhost:3000`

## 3. Telegram bot sozlash (buyurtmalar shu yerga keladi)

1. Telegram'da **@BotFather** ga yozing → `/newbot` → botga nom bering (masalan `Velira Orders Bot`).
2. BotFather sizga **token** beradi (masalan `7123456789:AAH...`) — buni `.env` dagi `TELEGRAM_BOT_TOKEN` ga qo'ying.
3. Endi botni xabarlarni kimga yuborishini aniqlash kerak (`chat_id`):
   - **Shaxsiy chatga** kelishini istasangiz: botga Telegram'da `/start` deb yozing, keyin **@userinfobot** ga yozib o'z `chat_id`ingizni bilib oling.
   - **Guruh/kanalga** kelishini istasangiz: botni o'sha guruhga admin qilib qo'shing, so'ng guruh `chat_id`sini oling (odatda manfiy son, masalan `-1001234567890`).
4. Olingan raqamni `.env` dagi `TELEGRAM_CHAT_ID` ga yozing.
   - **Bir nechta joyga** (masalan, o'zingizning shaxsiy chatingiz VA guruhga) yubormoqchi bo'lsangiz, ikkala `chat_id`ni vergul bilan ajratib yozing:
     ```
     TELEGRAM_CHAT_ID=6600336418,-1003851734252
     ```
5. Serverni qayta ishga tushiring — endi har bir buyurtma va "Aloqa" formasidagi xabar shu Telegram chat(lar)ga tushadi.

> **Muhim:** shaxsiy chatga (masalan `6600336418`) xabar borishi uchun o'sha odam avval botga hech bo'lmaganda bitta marta `/start` deb yozgan bo'lishi shart — aks holda Telegram "bot can't initiate conversation with a user" xatosini qaytaradi va xabar bormaydi.

Agar `.env` to'ldirilmagan bo'lsa, sayt baribir ishlayveradi (xatolik bermaydi), faqat konsolga ogohlantirish chiqadi va Telegram xabari yuborilmaydi.

## 4. Instagram / Telegram havolalari

`frontend/js/components.js` faylining tepasida:

```js
const SOCIAL_LINKS = {
  telegram: "https://t.me/velira_uz",
  instagram: "https://instagram.com/velira.uz",
  phone: "+998900000000",
  email: "hello@velira.uz",
};
```

Bu yerdagi manzillarni o'zingizning haqiqiy Telegram kanalingiz, Instagram sahifangiz, telefon va emailingizga almashtiring — header, footer va Aloqa sahifasidagi barcha havolalar avtomatik yangilanadi.

## 5. Mahsulot qo'shish / narxni o'zgartirish

`backend/data/products.json` faylini tahrirlang — yangi mahsulot qo'shish uchun massivga yangi obyekt qo'shing (id, scent, loads, price, image, name.uz/ru, description.uz/ru). Rasmni `frontend/images/` papkasiga joylang va `image` maydonida `"images/fayl-nomi.jpg"` deb ko'rsating.

## 6. velira.uz domenini ulash (production)

Eng oddiy yo'l — VPS (masalan Timeweb, Beget, DigitalOcean, yoki O'zbekistondagi hosting provayderlari):

1. VPS sotib oling, Node.js 18+ va (ixtiyoriy) PM2 o'rnating:
   ```bash
   npm install -g pm2
   ```
2. Loyihani serverga yuklang (git yoki scp orqali), `backend` papkasida `npm install` qiling, `.env` ni to'ldiring.
3. Doimiy ishlashi uchun PM2 bilan ishga tushiring:
   ```bash
   pm2 start server.js --name velira
   pm2 save
   pm2 startup
   ```
4. Nginx orqali 80/443 portlarni serverning 3000-portiga yo'naltiring (reverse proxy), so'ng Let's Encrypt (`certbot`) bilan SSL o'rnating.
5. Domen provayderingizda (velira.uz) DNS'da A-record'ni VPS IP-manziliga yo'naltiring.

Agar VPS bilan ishlashni istamasangiz, muqobil variant: Railway, Render yoki Vercel (Node backend uchun) kabi xizmatlar — ular GitHub repo'ni ulab, avtomatik deploy qiladi, keyin faqat domenni ularning nomserveriga yo'naltirasiz.

## 7. Telegram bot (captcha + telefon + do'kon + admin)

`.env` da `TELEGRAM_BOT_TOKEN` to'ldirilgan bo'lsa, `npm start` bilan birga bot ham avtomatik ishga tushadi (polling rejimida — alohida webhook/SSL sozlash shart emas).

Bot nima qiladi:
1. **`/start`** — foydalanuvchi captcha'dan (oddiy matematik savol, inline tugmalar) o'tadi, so'ng "📱 Raqamni yuborish" tugmasi orqali telefon raqamini yuboradi. Shundan keyingina asosiy menyu ochiladi.
2. Har bir yangi ro'yxatdan o'tgan foydalanuvchi (ism, username, Telegram ID, telefon) `TELEGRAM_CHAT_ID` kanaliga yuboriladi.
3. **🛍 Katalog / 🛒 Savatim** — foydalanuvchi bot ichida mahsulotlarni ko'rib, savatga qo'shib, manzil kiritib buyurtma bera oladi. Buyurtma ham saytdagi kabi bir xil `orders.json` ga va bir xil Telegram kanalga tushadi (`source: "telegram_bot"` belgisi bilan).
4. **WebApp tugmasi** — agar `.env` dagi `SITE_URL` https manzil bilan to'ldirilgan bo'lsa, bot foydalanuvchiga saytni to'g'ridan-to'g'ri Telegram ichida ochish tugmasini beradi (Telegram WebApp talabi: manzil **https** bo'lishi shart, `http://localhost` ishlamaydi).
5. **Admin (`ADMIN_TELEGRAM_ID`)** — botga `/admin` yozganda yoki "⚙️ Admin panel" tugmasi orqali: mahsulot qo'shish/o'chirish, so'nggi buyurtmalarni va ro'yxatdan o'tgan foydalanuvchilarni ko'rish mumkin. Bot orqali qo'shilgan mahsulot avtomatik saytda ham chiqadi (bitta `products.json` fayl orqali ishlaydi).

## 8. Veb-admin panel (`/admin`)

Saytga `/admin` manzili orqali kiring (masalan `http://localhost:3000/admin`), `.env` dagi `ADMIN_PASSWORD` bilan tizimga kiring. U yerda:
- Mahsulot qo'shish (rasmni to'g'ridan-to'g'ri kompyuterdan yuklash mumkin) va o'chirish,
- Barcha buyurtmalarni ko'rish va statusini o'zgartirish (yangi / tasdiqlangan / bajarilgan / bekor qilingan),
- Botdan ro'yxatdan o'tgan foydalanuvchilarni (ism, telefon, Telegram ID) ko'rish,
- Aloqa formasidagi murojaatlarni ko'rish mumkin.

**Muhim:** `ADMIN_PASSWORD` va `ADMIN_SESSION_SECRET`ni production'ga chiqarishdan oldin albatta o'zgartiring, sayt HTTPS orqali ishlashi kerak (aks holda parol tarmoqda ochiq ko'rinadi).

## 9. Keyingi qadamlar (tavsiya)

- To'lov tizimi: Payme yoki Click integratsiyasi (hozircha buyurtma "naqd/kelishilgan holda" tarzida qabul qilinadi).
- Veb-admin panelga Telegram orqali (masalan Telegram Login Widget) kirish qo'shib, alohida parolni butunlay olib tashlash mumkin.
- SEO: har sahifada `<meta name="description">` allaqachon bor, kerak bo'lsa kengaytiriladi.
