const express = require("express");
const { readJSON, appendJSON } = require("../utils/store");
const { sendTelegramMessage } = require("../utils/telegram");

const router = express.Router();

function isValidOrder(body) {
  return (
    body &&
    typeof body.name === "string" &&
    body.name.trim().length > 1 &&
    typeof body.phone === "string" &&
    body.phone.trim().length > 5 &&
    Array.isArray(body.items) &&
    body.items.length > 0
  );
}

// POST /api/orders
router.post("/", async (req, res) => {
  const body = req.body;

  if (!isValidOrder(body)) {
    return res.status(400).json({
      error: "Ma'lumotlar to'liq emas: ism, telefon va mahsulotlar ro'yxati kerak",
    });
  }

  const products = readJSON("products.json");

  let total = 0;
  const lineItems = body.items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    const qty = Number(item.qty) || 1;
    const price = product ? product.price : 0;
    total += price * qty;
    return {
      id: item.id,
      name: product ? product.name.uz : item.id,
      qty,
      price,
    };
  });

  const order = {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: body.name.trim(),
    phone: body.phone.trim(),
    address: (body.address || "").trim(),
    comment: (body.comment || "").trim(),
    items: lineItems,
    total,
    status: "new",
    source: "website",
  };

  appendJSON("orders.json", order);

  const itemsText = lineItems
    .map((li) => `• ${li.name} × ${li.qty} — ${(li.price * li.qty).toLocaleString("ru-RU")} so'm`)
    .join("\n");

  const message =
    `🛒 <b>Yangi buyurtma</b> #${order.id}\n\n` +
    `👤 ${order.name}\n` +
    `📞 ${order.phone}\n` +
    (order.address ? `📍 ${order.address}\n` : "") +
    (order.comment ? `💬 ${order.comment}\n` : "") +
    `\n${itemsText}\n\n` +
    `💰 <b>Jami: ${order.total.toLocaleString("ru-RU")} so'm</b>`;

  await sendTelegramMessage(message);

  res.status(201).json({ success: true, order });
});

module.exports = router;
