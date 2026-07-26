// Runs only when the site is opened inside Telegram (as a WebApp button / menu button).
// Safe no-op on a normal browser — window.Telegram is simply undefined there.
(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();
  } catch (_) {}

  // Match the site's palette so the Telegram header doesn't clash.
  try {
    tg.setHeaderColor("#0B2545");
    tg.setBackgroundColor("#FFFFFF");
  } catch (_) {}

  const user = tg.initDataUnsafe && tg.initDataUnsafe.user;

  function prefillCheckoutForm() {
    const form = document.getElementById("checkoutForm");
    if (!form || !user) return;
    if (form.name && !form.name.value) {
      form.name.value = [user.first_name, user.last_name].filter(Boolean).join(" ");
    }
  }

  document.addEventListener("DOMContentLoaded", prefillCheckoutForm);

  // Expose the Telegram user id globally so cart.js can tag orders placed from
  // inside the WebApp (helps the admin panel tell webapp orders apart, and lets
  // the backend match the order to an already-verified bot user/phone).
  window.VELIRA_TG_USER = user || null;
})();
