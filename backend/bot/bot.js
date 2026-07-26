const TelegramBot = require("node-telegram-bot-api");
const { readJSON, appendJSON, writeJSON, removeItem } = require("../utils/store");
const { sendTelegramMessage } = require("../utils/telegram");
const {
  pendingCaptcha,
  getCart,
  clearCart,
  setConversation,
  getConversation,
  clearConversation,
} = require("./state");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = String(process.env.ADMIN_TELEGRAM_ID || "").trim();
const CHANNEL_ID = process.env.TELEGRAM_CHAT_ID;
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");

function fmt(n) {
  return `${Number(n || 0).toLocaleString("ru-RU")} so'm`;
}

function isAdmin(chatId) {
  return ADMIN_ID && String(chatId) === ADMIN_ID;
}

function findUser(telegramId) {
  const users = readJSON("users.json");
  return users.find((u) => u.telegramId === telegramId);
}

function isVerified(telegramId) {
  const u = findUser(telegramId);
  return !!(u && u.phone);
}

function upsertUser(telegramId, patch) {
  const users = readJSON("users.json");
  const idx = users.findIndex((u) => u.telegramId === telegramId);
  if (idx === -1) {
    users.push({ telegramId, registeredAt: new Date().toISOString(), ...patch });
  } else {
    users[idx] = { ...users[idx], ...patch };
  }
  writeJSON("users.json", users);
  return users.find((u) => u.telegramId === telegramId);
}

function mainMenuKeyboard(chatId) {
  const rows = [
    ["🛍 Katalog", "🛒 Savatim"],
    ["ℹ️ Biz haqimizda", "📞 Aloqa"],
  ];
  if (isAdmin(chatId)) rows.push(["⚙️ Admin panel"]);
  return { keyboard: rows, resize_keyboard: true };
}

function adminMenuKeyboard() {
  return {
    keyboard: [
      ["➕ Mahsulot qo'shish", "🗑 Mahsulotni o'chirish"],
      ["📦 Buyurtmalar", "👥 Foydalanuvchilar"],
      ["⬅️ Asosiy menyu"],
    ],
    resize_keyboard: true,
  };
}

function generateCaptcha() {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const correct = a + b;
  const options = new Set([correct]);
  while (options.size < 4) {
    const fake = correct + (Math.floor(Math.random() * 9) - 4);
    if (fake > 0 && fake !== correct) options.add(fake);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  return { question: `${a} + ${b} = ?`, correct, options: shuffled };
}

function initBot() {
  if (!TOKEN) {
    console.warn("[bot] TELEGRAM_BOT_TOKEN topilmadi — bot ishga tushmadi.");
    return null;
  }

  const bot = new TelegramBot(TOKEN, { polling: true });

  bot.on("polling_error", (err) => {
    console.error("[bot] Polling xatosi:", err.message);
  });

  // ---------- Captcha ----------
  async function sendCaptchaChallenge(chatId) {
    const cap = generateCaptcha();
    const inline_keyboard = [
      cap.options.map((opt) => ({
        text: String(opt),
        callback_data: `captcha:${opt === cap.correct ? "ok" : "no"}:${opt}`,
      })),
    ];
    try {
      const sent = await bot.sendMessage(
        chatId,
        `🤖 Siz robot emasligingizni tasdiqlang:\n\n<b>${cap.question}</b>`,
        { parse_mode: "HTML", reply_markup: { inline_keyboard } }
      );
      pendingCaptcha.set(chatId, { correct: cap.correct, messageId: sent.message_id });
    } catch (err) {
      console.error("[bot] Captcha yuborishda xatolik:", err.message);
    }
  }

  async function requestContact(chatId) {
    await bot.sendMessage(
      chatId,
      "✅ Tasdiqlandi!\n\nDavom etish uchun telefon raqamingizni yuboring 👇",
      {
        reply_markup: {
          keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }

  async function sendWelcome(chatId, user) {
    const name = (user && user.firstName) || "";
    await bot.sendMessage(
      chatId,
      `Xush kelibsiz${name ? ", " + name : ""}! 👋\n\n` +
        `<b>Velira</b> — konsentrlangan kir yuvish listlari onlayn do'koni.\n` +
        `Quyidagi menyudan foydalaning:`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard(chatId) }
    );
    if (SITE_URL) {
      await bot.sendMessage(chatId, "🌐 To'liq katalog va saytni WebApp orqali ochish:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛍 Do'konni ochish", web_app: { url: `${SITE_URL}/shop.html` } }],
          ],
        },
      });
    }
  }

  // ---------- /start ----------
  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = String(msg.from.id);

    upsertUser(telegramId, {
      chatId,
      username: msg.from.username || "",
      firstName: msg.from.first_name || "",
      lastName: msg.from.last_name || "",
      languageCode: msg.from.language_code || "",
    });

    if (isVerified(telegramId)) {
      return sendWelcome(chatId, findUser(telegramId));
    }
    await bot.sendMessage(
      chatId,
      "Assalomu alaykum! Velira botiga xush kelibsiz.\nDavom etishdan oldin qisqa tasdiqlashdan o'ting."
    );
    await sendCaptchaChallenge(chatId);
  });

  bot.onText(/^\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;
    await bot.sendMessage(chatId, "⚙️ Admin panel", { reply_markup: adminMenuKeyboard() });
  });

  // ---------- Callback queries (captcha, cart, admin actions) ----------
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data || "";

    try {
      if (data.startsWith("captcha:")) {
        const [, result] = data.split(":");
        const pending = pendingCaptcha.get(chatId);
        if (!pending) {
          await bot.answerCallbackQuery(query.id, { text: "Muddati tugagan, /start ni qayta bosing" });
          return;
        }
        if (result === "ok") {
          pendingCaptcha.delete(chatId);
          await bot.answerCallbackQuery(query.id, { text: "✅ To'g'ri!" });
          try {
            await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
              chat_id: chatId,
              message_id: pending.messageId,
            });
          } catch (_) {}
          await requestContact(chatId);
        } else {
          await bot.answerCallbackQuery(query.id, { text: "❌ Xato javob, qayta urinib ko'ring" });
          await sendCaptchaChallenge(chatId);
        }
        return;
      }

      if (data.startsWith("cart:add:")) {
        const id = data.slice("cart:add:".length);
        const cart = getCart(chatId);
        cart[id] = (cart[id] || 0) + 1;
        await bot.answerCallbackQuery(query.id, { text: "🛒 Savatga qo'shildi" });
        return;
      }

      if (data === "cart:checkout") {
        await bot.answerCallbackQuery(query.id);
        return startCheckout(chatId);
      }

      if (data === "cart:clear") {
        clearCart(chatId);
        await bot.answerCallbackQuery(query.id, { text: "Savat tozalandi" });
        return;
      }

      if (data.startsWith("admin:delproduct:")) {
        if (!isAdmin(chatId)) return bot.answerCallbackQuery(query.id);
        const id = data.slice("admin:delproduct:".length);
        removeItem("products.json", "id", id);
        await bot.answerCallbackQuery(query.id, { text: "O'chirildi" });
        await bot.sendMessage(chatId, `🗑 Mahsulot o'chirildi: <code>${id}</code>`, { parse_mode: "HTML" });
        return;
      }

      await bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error("[bot] callback_query xatosi:", err.message);
      try {
        await bot.answerCallbackQuery(query.id, { text: "Xatolik yuz berdi" });
      } catch (_) {}
    }
  });

  // ---------- Catalog / cart helpers ----------
  async function sendCatalog(chatId) {
    const products = readJSON("products.json");
    if (!products.length) {
      return bot.sendMessage(chatId, "Hozircha mahsulotlar mavjud emas.");
    }
    for (const p of products) {
      const caption =
        `<b>${p.name.uz}</b>\n${p.description.uz}\n\n` +
        `💧 ${p.loads} yuvish\n💰 ${fmt(p.price)}`;
      const keyboard = {
        inline_keyboard: [[{ text: "➕ Savatga qo'shish", callback_data: `cart:add:${p.id}` }]],
      };
      try {
        if (SITE_URL && p.image) {
          await bot.sendPhoto(chatId, `${SITE_URL}/${p.image}`, {
            caption,
            parse_mode: "HTML",
            reply_markup: keyboard,
          });
        } else {
          await bot.sendMessage(chatId, caption, { parse_mode: "HTML", reply_markup: keyboard });
        }
      } catch (err) {
        await bot.sendMessage(chatId, caption, { parse_mode: "HTML", reply_markup: keyboard });
      }
    }
  }

  async function sendCartView(chatId) {
    const cart = getCart(chatId);
    const ids = Object.keys(cart).filter((id) => cart[id] > 0);
    if (!ids.length) {
      return bot.sendMessage(chatId, "🛒 Savatingiz bo'sh. Katalogdan mahsulot qo'shing.");
    }
    const products = readJSON("products.json");
    let total = 0;
    let text = "🛒 <b>Savatingiz:</b>\n\n";
    ids.forEach((id) => {
      const p = products.find((pr) => pr.id === id);
      if (!p) return;
      const lineTotal = p.price * cart[id];
      total += lineTotal;
      text += `• ${p.name.uz} × ${cart[id]} — ${fmt(lineTotal)}\n`;
    });
    text += `\n💰 <b>Jami: ${fmt(total)}</b>`;
    await bot.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Buyurtma berish", callback_data: "cart:checkout" }],
          [{ text: "🗑 Savatni tozalash", callback_data: "cart:clear" }],
        ],
      },
    });
  }

  async function startCheckout(chatId) {
    const cart = getCart(chatId);
    const hasItems = Object.values(cart).some((q) => q > 0);
    if (!hasItems) return bot.sendMessage(chatId, "Savatingiz bo'sh.");
    setConversation(chatId, "checkout_address");
    await bot.sendMessage(chatId, "📍 Yetkazib berish manzilini kiriting (yoki \"-\" deb yozing):");
  }

  async function finalizeOrder(chatId, address) {
    const telegramId = String(chatId);
    const user = findUser(telegramId) || {};
    const cart = getCart(chatId);
    const products = readJSON("products.json");

    const items = Object.keys(cart)
      .filter((id) => cart[id] > 0)
      .map((id) => {
        const p = products.find((pr) => pr.id === id);
        return { id, name: p ? p.name.uz : id, qty: cart[id], price: p ? p.price : 0 };
      });

    if (!items.length) return bot.sendMessage(chatId, "Savatingiz bo'sh.");

    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Noma'lum",
      phone: user.phone || "—",
      address: (address || "").trim(),
      comment: "",
      items,
      total,
      status: "new",
      source: "telegram_bot",
      telegramId,
    };
    appendJSON("orders.json", order);

    const itemsText = items.map((li) => `• ${li.name} × ${li.qty} — ${fmt(li.price * li.qty)}`).join("\n");
    const message =
      `🛒 <b>Yangi buyurtma (bot)</b> #${order.id}\n\n` +
      `👤 ${order.name}\n📞 ${order.phone}\n` +
      (order.address ? `📍 ${order.address}\n` : "") +
      `\n${itemsText}\n\n💰 <b>Jami: ${fmt(order.total)}</b>`;
    await sendTelegramMessage(message, CHANNEL_ID);

    clearCart(chatId);
    clearConversation(chatId);
    await bot.sendMessage(
      chatId,
      `✅ Buyurtmangiz qabul qilindi!\nBuyurtma raqami: <code>${order.id}</code>\nTez orada siz bilan bog'lanamiz.`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard(chatId) }
    );
  }

  // ---------- Admin: add product conversation ----------
  const ADD_PRODUCT_STEPS = ["name_uz", "name_ru", "price", "loads", "description_uz", "image"];
  const STEP_PROMPTS = {
    name_uz: "Mahsulot nomi (UZ):",
    name_ru: "Mahsulot nomi (RU):",
    price: "Narxi (so'mda, faqat raqam):",
    loads: "Yuvishlar soni (faqat raqam):",
    description_uz: "Qisqa tavsif (UZ):",
    image: "Rasm manzili (masalan images/ocean-2.jpg) yoki \"-\" deb yozing:",
  };

  async function startAddProduct(chatId) {
    setConversation(chatId, "admin_add_product", { fieldIndex: 0, fields: {} });
    await bot.sendMessage(chatId, `➕ Yangi mahsulot qo'shish.\n\n${STEP_PROMPTS[ADD_PRODUCT_STEPS[0]]}`);
  }

  async function handleAddProductStep(chatId, text) {
    const conv = getConversation(chatId);
    const step = ADD_PRODUCT_STEPS[conv.data.fieldIndex];
    conv.data.fields[step] = text.trim();
    conv.data.fieldIndex += 1;

    if (conv.data.fieldIndex >= ADD_PRODUCT_STEPS.length) {
      const f = conv.data.fields;
      const products = readJSON("products.json");
      const slug = (f.name_uz || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `product-${Date.now()}`;
      let id = slug;
      let n = 2;
      while (products.some((p) => p.id === id)) id = `${slug}-${n++}`;
      const image = f.image && f.image !== "-" ? f.image : "images/logo.png";
      const product = {
        id,
        scent: "",
        loads: Number(f.loads) || 0,
        price: Number(f.price) || 0,
        currency: "UZS",
        image,
        images: [image],
        name: { uz: f.name_uz, ru: f.name_ru || f.name_uz },
        description: { uz: f.description_uz || "", ru: f.description_uz || "" },
      };
      products.push(product);
      writeJSON("products.json", products);
      clearConversation(chatId);
      await bot.sendMessage(
        chatId,
        `✅ Mahsulot qo'shildi!\n\n<b>${product.name.uz}</b>\n💰 ${fmt(product.price)}\n💧 ${product.loads} yuvish\nID: <code>${product.id}</code>\n\nSaytda avtomatik ko'rinadi.`,
        { parse_mode: "HTML", reply_markup: adminMenuKeyboard() }
      );
    } else {
      setConversation(chatId, "admin_add_product", conv.data);
      const nextStep = ADD_PRODUCT_STEPS[conv.data.fieldIndex];
      await bot.sendMessage(chatId, STEP_PROMPTS[nextStep]);
    }
  }

  async function sendDeleteProductMenu(chatId) {
    const products = readJSON("products.json");
    if (!products.length) return bot.sendMessage(chatId, "Mahsulotlar yo'q.");
    const inline_keyboard = products.map((p) => [
      { text: `🗑 ${p.name.uz} (${fmt(p.price)})`, callback_data: `admin:delproduct:${p.id}` },
    ]);
    await bot.sendMessage(chatId, "O'chirish uchun mahsulotni tanlang:", {
      reply_markup: { inline_keyboard },
    });
  }

  async function sendOrdersList(chatId) {
    const orders = readJSON("orders.json").slice(-10).reverse();
    if (!orders.length) return bot.sendMessage(chatId, "Hali buyurtmalar yo'q.");
    let text = "📦 <b>So'nggi buyurtmalar:</b>\n\n";
    orders.forEach((o) => {
      text += `#${o.id} — ${o.name}, ${o.phone}\n💰 ${fmt(o.total)} · ${o.status}\n\n`;
    });
    await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  }

  async function sendUsersList(chatId) {
    const users = readJSON("users.json");
    const withPhone = users.filter((u) => u.phone);
    let text = `👥 <b>Foydalanuvchilar:</b> jami ${users.length}, ro'yxatdan o'tgan ${withPhone.length}\n\n`;
    withPhone
      .slice(-10)
      .reverse()
      .forEach((u) => {
        text += `${[u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.telegramId} — ${u.phone}\n`;
      });
    await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  }

  // ---------- Text / contact messages ----------
  bot.on("message", async (msg) => {
    if (!msg.text && !msg.contact) return;
    const chatId = msg.chat.id;
    const telegramId = String(msg.from.id);

    // Phone number sent in response to the contact-request keyboard
    if (msg.contact) {
      const phone = msg.contact.phone_number.startsWith("+")
        ? msg.contact.phone_number
        : `+${msg.contact.phone_number}`;
      const user = upsertUser(telegramId, {
        chatId,
        username: msg.from.username || "",
        firstName: msg.contact.first_name || msg.from.first_name || "",
        lastName: msg.contact.last_name || msg.from.last_name || "",
        phone,
        verifiedAt: new Date().toISOString(),
      });
      await sendTelegramMessage(
        `🆕 <b>Yangi foydalanuvchi ro'yxatdan o'tdi</b>\n\n` +
          `👤 ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}\n` +
          `🆔 <code>${telegramId}</code>${user.username ? " (@" + user.username + ")" : ""}\n` +
          `📞 ${phone}`,
        CHANNEL_ID
      );
      return sendWelcome(chatId, user);
    }

    const text = msg.text.trim();
    if (text.startsWith("/")) return; // commands handled by onText

    // Conversation steps take priority
    const conv = getConversation(chatId);
    if (conv && conv.step === "checkout_address") {
      const address = text === "-" ? "" : text;
      return finalizeOrder(chatId, address);
    }
    if (conv && conv.step === "admin_add_product" && isAdmin(chatId)) {
      return handleAddProductStep(chatId, text);
    }

    // Require verification before using the shop
    if (!isVerified(telegramId) && !["ℹ️ Biz haqimizda", "📞 Aloqa"].includes(text)) {
      await bot.sendMessage(chatId, "Iltimos, avval /start buyrug'ini bosib tasdiqlashdan o'ting.");
      return;
    }

    switch (text) {
      case "🛍 Katalog":
        return sendCatalog(chatId);
      case "🛒 Savatim":
        return sendCartView(chatId);
      case "ℹ️ Biz haqimizda":
        return bot.sendMessage(
          chatId,
          "Velira — konsentrlangan kir yuvish listlari. O'zbekistonda rasmiy distribyutor.\n" +
            (SITE_URL ? `🌐 ${SITE_URL}/about.html` : "")
        );
      case "📞 Aloqa":
        return bot.sendMessage(
          chatId,
          `📞 +998900000000\n✉️ hello@velira.uz\n💬 @velira_uz`
        );
      case "⚙️ Admin panel":
        if (!isAdmin(chatId)) return;
        return bot.sendMessage(chatId, "⚙️ Admin panel", { reply_markup: adminMenuKeyboard() });
      case "➕ Mahsulot qo'shish":
        if (!isAdmin(chatId)) return;
        return startAddProduct(chatId);
      case "🗑 Mahsulotni o'chirish":
        if (!isAdmin(chatId)) return;
        return sendDeleteProductMenu(chatId);
      case "📦 Buyurtmalar":
        if (!isAdmin(chatId)) return;
        return sendOrdersList(chatId);
      case "👥 Foydalanuvchilar":
        if (!isAdmin(chatId)) return;
        return sendUsersList(chatId);
      case "⬅️ Asosiy menyu":
        return bot.sendMessage(chatId, "Asosiy menyu:", { reply_markup: mainMenuKeyboard(chatId) });
      default:
        return; // ignore unrecognized text to avoid noisy replies
    }
  });

  console.log("[bot] Telegram bot ishga tushdi (polling).");
  return bot;
}

module.exports = { initBot };
