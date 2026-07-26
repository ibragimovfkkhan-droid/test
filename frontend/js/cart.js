const CART_KEY = "velira_cart"; // { [productId]: qty }
let PRODUCTS_CACHE = null;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  setCart(cart);
  showToast(currentLangText("addedToast"));
}

function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  setCart(cart);
  renderCartDrawer();
}

function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  setCart(cart);
  renderCartDrawer();
}

function getCartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const count = getCartCount();
  el.textContent = count;
  el.setAttribute("data-empty", count === 0 ? "true" : "false");
}

function currentLangText(key) {
  const lang = localStorage.getItem("velira_lang") || "ru";
  return (typeof DICT !== "undefined" && DICT[lang] && DICT[lang][key]) || "";
}

function showToast(msg) {
  let toast = document.getElementById("veliraToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "veliraToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function ensureProducts() {
  if (!PRODUCTS_CACHE) {
    PRODUCTS_CACHE = await apiGetProducts();
  }
  return PRODUCTS_CACHE;
}

async function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const footEl = document.getElementById("cartFoot");
  if (!itemsEl) return;

  const cart = getCart();
  const ids = Object.keys(cart);
  const lang = localStorage.getItem("velira_lang") || "ru";

  if (ids.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">${currentLangText("cartEmpty")}</div>`;
    if (footEl) footEl.style.display = "none";
    updateCartCount();
    return;
  }

  let products;
  try {
    products = await ensureProducts();
  } catch (err) {
    itemsEl.innerHTML = `<p class="grid-error-msg">Mahsulotlarni yuklab bo'lmadi.</p>`;
    if (footEl) footEl.style.display = "none";
    return;
  }
  let total = 0;
  let html = "";

  ids.forEach((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const qty = cart[id];
    const lineTotal = product.price * qty;
    total += lineTotal;
    html += `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name[lang]}">
        <div>
          <h4>${product.name[lang]}</h4>
          <div class="qty-row">
            <button class="qty-btn" onclick="setQty('${id}', ${qty - 1})">−</button>
            <span>${qty}</span>
            <button class="qty-btn" onclick="setQty('${id}', ${qty + 1})">+</button>
          </div>
          <a class="remove-btn" onclick="removeFromCart('${id}')">✕</a>
        </div>
        <div class="line-total">
          ${lineTotal.toLocaleString("uz-UZ")}
        </div>
      </div>`;
  });

  itemsEl.innerHTML = html;
  if (footEl) {
    footEl.style.display = "block";
    const totalEl = document.getElementById("cartTotalValue");
    if (totalEl) totalEl.textContent = `${total.toLocaleString("uz-UZ")} UZS`;
  }
  updateCartCount();
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
  renderCartDrawer();
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

function openCheckout() {
  if (getCartCount() === 0) return;
  closeCart();
  document.getElementById("checkoutModal")?.classList.add("open");
}
function closeCheckout() {
  document.getElementById("checkoutModal")?.classList.remove("open");
}

async function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const statusEl = document.getElementById("orderStatus");
  const submitBtn = form.querySelector("button[type=submit]");
  const labelEl = submitBtn.querySelector(".btn-label");
  const originalBtnText = labelEl.textContent;
  const lang = localStorage.getItem("velira_lang") || "ru";

  const cart = getCart();
  const items = Object.keys(cart).map((id) => ({ id, qty: cart[id] }));

  const payload = {
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    address: form.address.value,
    comment: form.comment.value,
    items,
    lang,
  };

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  statusEl.textContent = "";
  statusEl.className = "form-status";

  try {

    const products = await ensureProducts();
    let total = 0;
    const itemsText = items
      .map((it) => {
        const product = products.find((p) => p.id === it.id);
        const name = product ? (product.name[lang] || product.name.uz) : it.id;
        const lineTotal = product ? product.price * it.qty : 0;
        total += lineTotal;
        return `${name} x${it.qty} — ${lineTotal.toLocaleString("uz-UZ")} so'm`;
      })
      .join("\n");

    const templateParams = {
      type: "Yangi buyurtma",
      name: payload.name,
      contact: payload.phone,
      email: payload.email,
      phone: payload.phone,
      address: payload.address || "—",
      message: payload.comment || "—",
      order_items: itemsText,
      order_total: `${total.toLocaleString("uz-UZ")} so'm`,
      reply_to: payload.email || payload.phone,
    };

    await emailjs.send("service_rdyv22j", "template_48si1yf", templateParams);


    try {
      await apiCreateOrder(payload);
    } catch (backendErr) {

    }

    submitBtn.classList.remove("loading");
    statusEl.textContent = currentLangText("orderSuccess");
    statusEl.classList.add("success");
    labelEl.textContent = `${currentLangText("sentBtn")} ✅`;
    submitBtn.classList.add("btn-sent");
    setCart({});
    form.reset();
    setTimeout(() => {
      closeCheckout();
      statusEl.textContent = "";
      labelEl.textContent = originalBtnText;
      submitBtn.classList.remove("btn-sent");
    }, 2200);
  } catch (err) {
    console.error("EmailJS error:", err);
    const detail = (err && (err.text || err.message)) ? ` (${err.text || err.message})` : "";
    submitBtn.classList.remove("loading");
    statusEl.textContent = currentLangText("orderError") + detail;
    labelEl.textContent = `${currentLangText("errorBtn")} ❌`;
    submitBtn.classList.add("btn-error");
    setTimeout(() => {
      labelEl.textContent = originalBtnText;
      submitBtn.classList.remove("btn-error");
    }, 2600);
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
  }
}

function openMobileNav() {
  document.getElementById("burgerBtn")?.classList.add("open");
  document.getElementById("mobileNavPanel")?.classList.add("open");
  document.getElementById("mobileNavOverlay")?.classList.add("open");
  document.body.classList.add("nav-open");
}
function closeMobileNav() {
  document.getElementById("burgerBtn")?.classList.remove("open");
  document.getElementById("mobileNavPanel")?.classList.remove("open");
  document.getElementById("mobileNavOverlay")?.classList.remove("open");
  document.body.classList.remove("nav-open");
}
function toggleMobileNav() {
  const isOpen = document.getElementById("mobileNavPanel")?.classList.contains("open");
  if (isOpen) closeMobileNav();
  else openMobileNav();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  document.getElementById("openCartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("checkoutBtn")?.addEventListener("click", openCheckout);
  document.getElementById("closeCheckoutBtn")?.addEventListener("click", closeCheckout);
  document.getElementById("checkoutForm")?.addEventListener("submit", submitOrder);

  document.getElementById("burgerBtn")?.addEventListener("click", toggleMobileNav);
  document.getElementById("mobileNavOverlay")?.addEventListener("click", closeMobileNav);
  document.getElementById("mobileNavCloseBtn")?.addEventListener("click", closeMobileNav);
  document.querySelectorAll("#mobileNavPanel a").forEach((a) => a.addEventListener("click", closeMobileNav));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMobileNav(); });
});

document.addEventListener("langchange", () => renderCartDrawer());
