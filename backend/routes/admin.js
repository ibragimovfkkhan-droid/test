const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { readJSON, writeJSON, updateItem, removeItem } = require("../utils/store");
const { requireAdmin, createToken, COOKIE_NAME } = require("../middleware/adminAuth");

const router = express.Router();

// ---------- Login ----------
router.post("/login", (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD .env da o'rnatilmagan" });
  }
  if (password !== expected) {
    return res.status(401).json({ error: "Parol xato" });
  }
  const token = createToken();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.json({ success: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

router.get("/check", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// Everything below requires a valid admin session
router.use(requireAdmin);

// ---------- Image upload ----------
const imagesDir = path.join(__dirname, "..", "..", "frontend", "images");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safe = `product-${Date.now()}${ext}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Faqat rasm fayllari (jpg, png, webp, gif) qabul qilinadi"));
  },
});

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fayl yuklanmadi" });
  res.json({ success: true, path: `images/${req.file.filename}` });
});

// ---------- Products CRUD ----------
router.get("/products", (req, res) => {
  res.json(readJSON("products.json"));
});

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.post("/products", (req, res) => {
  const b = req.body || {};
  if (!b.name_uz || !b.price) {
    return res.status(400).json({ error: "Nomi (UZ) va narx kerak" });
  }
  const products = readJSON("products.json");
  let id = slugify(b.id || b.name_uz) || `product-${Date.now()}`;
  let uniqueId = id;
  let n = 2;
  while (products.some((p) => p.id === uniqueId)) {
    uniqueId = `${id}-${n++}`;
  }
  const product = {
    id: uniqueId,
    scent: b.scent || "",
    loads: Number(b.loads) || 0,
    price: Number(b.price) || 0,
    currency: "UZS",
    image: b.image || "images/logo.png",
    images: Array.isArray(b.images) && b.images.length ? b.images : [b.image || "images/logo.png"],
    name: { uz: b.name_uz, ru: b.name_ru || b.name_uz },
    description: { uz: b.description_uz || "", ru: b.description_ru || b.description_uz || "" },
  };
  products.push(product);
  writeJSON("products.json", products);
  res.status(201).json({ success: true, product });
});

router.put("/products/:id", (req, res) => {
  const b = req.body || {};
  const patch = {};
  if (b.scent !== undefined) patch.scent = b.scent;
  if (b.loads !== undefined) patch.loads = Number(b.loads) || 0;
  if (b.price !== undefined) patch.price = Number(b.price) || 0;
  if (b.image !== undefined) patch.image = b.image;
  if (b.images !== undefined) patch.images = b.images;
  if (b.name_uz !== undefined || b.name_ru !== undefined) {
    const products = readJSON("products.json");
    const existing = products.find((p) => p.id === req.params.id);
    patch.name = {
      uz: b.name_uz !== undefined ? b.name_uz : existing?.name?.uz,
      ru: b.name_ru !== undefined ? b.name_ru : existing?.name?.ru,
    };
  }
  if (b.description_uz !== undefined || b.description_ru !== undefined) {
    const products = readJSON("products.json");
    const existing = products.find((p) => p.id === req.params.id);
    patch.description = {
      uz: b.description_uz !== undefined ? b.description_uz : existing?.description?.uz,
      ru: b.description_ru !== undefined ? b.description_ru : existing?.description?.ru,
    };
  }
  const updated = updateItem("products.json", "id", req.params.id, patch);
  if (!updated) return res.status(404).json({ error: "Mahsulot topilmadi" });
  res.json({ success: true, product: updated });
});

router.delete("/products/:id", (req, res) => {
  const removed = removeItem("products.json", "id", req.params.id);
  if (!removed) return res.status(404).json({ error: "Mahsulot topilmadi" });
  res.json({ success: true });
});

// ---------- Orders ----------
router.get("/orders", (req, res) => {
  const orders = readJSON("orders.json").slice().reverse();
  res.json(orders);
});

router.put("/orders/:id/status", (req, res) => {
  const { status } = req.body || {};
  if (!["new", "confirmed", "done", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Noto'g'ri status" });
  }
  const updated = updateItem("orders.json", "id", req.params.id, { status });
  if (!updated) return res.status(404).json({ error: "Buyurtma topilmadi" });
  res.json({ success: true, order: updated });
});

// ---------- Users (bot foydalanuvchilari) ----------
router.get("/users", (req, res) => {
  const users = readJSON("users.json").slice().reverse();
  res.json(users);
});

// ---------- Contact messages ----------
router.get("/messages", (req, res) => {
  const messages = readJSON("messages.json").slice().reverse();
  res.json(messages);
});

module.exports = router;
