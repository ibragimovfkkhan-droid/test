// Thin wrapper around the Telegram Bot API. Used both by the website (order/contact
// notifications) and by the bot itself (backend/bot/bot.js) for sending logs/orders
// to the admin channel. Uses Node's built-in global fetch (Node 18+).

function getToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

async function callTelegramApi(method, payload) {
  const token = getToken();
  if (!token) {
    console.warn(`[telegram] TELEGRAM_BOT_TOKEN topilmadi — ${method} bajarilmadi.`);
    return { ok: false, skipped: true };
  }
  const url = `https://api.telegram.org/bot${token}/${method}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`[telegram] API xatosi (${method}):`, data.description || data);
    }
    return data;
  } catch (err) {
    console.error(`[telegram] So'rov xatosi (${method}):`, err.message);
    return { ok: false, error: err.message };
  }
}

// Sends a plain HTML text message to one or more chat ids.
// `chatIds` may be a single id/string or an array. Defaults to TELEGRAM_CHAT_ID env
// (comma-separated list supported) when not provided.
async function sendTelegramMessage(text, chatIds, extra) {
  const rawChatIds = chatIds || process.env.TELEGRAM_CHAT_ID;

  if (!getToken() || !rawChatIds) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN yoki chat id topilmadi — xabar yuborilmadi."
    );
    return { ok: false, skipped: true };
  }

  const ids = Array.isArray(rawChatIds)
    ? rawChatIds
    : String(rawChatIds).split(",").map((id) => id.trim()).filter(Boolean);

  const results = await Promise.all(
    ids.map((chatId) =>
      callTelegramApi("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(extra || {}),
      })
    )
  );

  const allOk = results.every((r) => r && r.ok);
  return { ok: allOk, results };
}

async function sendTelegramPhoto(photoUrlOrFileId, caption, chatIds, extra) {
  const rawChatIds = chatIds || process.env.TELEGRAM_CHAT_ID;
  if (!getToken() || !rawChatIds) return { ok: false, skipped: true };

  const ids = Array.isArray(rawChatIds)
    ? rawChatIds
    : String(rawChatIds).split(",").map((id) => id.trim()).filter(Boolean);

  const results = await Promise.all(
    ids.map((chatId) =>
      callTelegramApi("sendPhoto", {
        chat_id: chatId,
        photo: photoUrlOrFileId,
        caption,
        parse_mode: "HTML",
        ...(extra || {}),
      })
    )
  );
  const allOk = results.every((r) => r && r.ok);
  return { ok: allOk, results };
}

module.exports = { sendTelegramMessage, sendTelegramPhoto, callTelegramApi };
