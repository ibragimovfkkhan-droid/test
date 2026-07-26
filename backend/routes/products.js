const express = require("express");
const { readJSON } = require("../utils/store");

const router = express.Router();

// GET /api/products
router.get("/", (req, res) => {
  try {
    const products = readJSON("products.json");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Mahsulotlarni yuklab bo'lmadi" });
  }
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  try {
    const products = readJSON("products.json");
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Mahsulotni yuklab bo'lmadi" });
  }
});

module.exports = router;
