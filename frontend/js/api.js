const API_BASE = "/api";


const FALLBACK_PRODUCTS = [
  {
    id: "ocean-60",
    scent: "Ocean",
    loads: 60,
    price: 59000,
    currency: "UZS",
    image: "images/velira-ocean.jpg",
    images: [
      "images/velira-ocean.jpg",
      "images/ocean-2.jpg",
      "images/ocean-3.jpg",
      "images/ocean-4.jpg",
      "images/ocean-5.jpg",
      "images/ocean-6.jpg",
    ],
    name: { uz: "Velira Ocean", ru: "Velira Ocean" },
    description: {
      uz: "Yangi va tiniq aroma, sovuq suvda ham samarali, kundalik foydalanish uchun.",
      ru: "Свежий и чистый аромат, эффективен даже в холодной воде, для ежедневного использования.",
    },
  },
  {
    id: "wild-lavender-100",
    scent: "Wild Lavender",
    loads: 100,
    price: 79000,
    currency: "UZS",
    image: "images/velira-lavender.jpg",
    images: [
      "images/velira-lavender.jpg",
      "images/lavender-2.jpg",
      "images/lavender-3.jpg",
      "images/lavender-4.jpg",
      "images/lavender-5.jpg",
      "images/lavender-6.jpg",
    ],
    name: { uz: "Velira Wild Lavender", ru: "Velira Wild Lavender" },
    description: {
      uz: "Dala lavandasining nafis hidi, uy uchun uzoq muddatli yangilik.",
      ru: "Нежный аромат полевой лаванды, долгая свежесть для дома.",
    },
  },
];

async function apiGetProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("Mahsulotlarni yuklab bo'lmadi");
    return await res.json();
  } catch (err) {

    console.warn("apiGetProducts: backend topilmadi, zaxira ma'lumotlar ishlatilmoqda.", err);
    return FALLBACK_PRODUCTS;
  }
}

async function apiCreateOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Buyurtma xatosi");
  return data;
}

async function apiSendContact(payload) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Xabar xatosi");
  return data;
}
