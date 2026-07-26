// Simple in-memory state shared across the bot's handlers.
// Fine for a single-process bot; nothing here needs to survive a restart.

const pendingCaptcha = new Map(); // chatId -> { answer, messageId }
const carts = new Map(); // chatId -> { [productId]: qty }
const conversation = new Map(); // chatId -> { step, data }

function getCart(chatId) {
  if (!carts.has(chatId)) carts.set(chatId, {});
  return carts.get(chatId);
}

function clearCart(chatId) {
  carts.set(chatId, {});
}

function setConversation(chatId, step, data = {}) {
  conversation.set(chatId, { step, data });
}

function getConversation(chatId) {
  return conversation.get(chatId) || null;
}

function clearConversation(chatId) {
  conversation.delete(chatId);
}

module.exports = {
  pendingCaptcha,
  carts,
  getCart,
  clearCart,
  setConversation,
  getConversation,
  clearConversation,
};
