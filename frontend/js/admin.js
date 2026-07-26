const API = "/api/admin";

function toast(msg) {
  const el = document.getElementById("adminToast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2400);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
  });
  if (res.status === 401) {
    showLogin();
    throw new Error("Avtorizatsiyadan o'tilmagan");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
  return data;
}

function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminShell").classList.remove("active");
}
function showShell() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminShell").classList.add("active");
  loadAll();
}

async function checkSession() {
  try {
    await apiFetch("/check");
    showShell();
  } catch {
    showLogin();
  }
}

document.getElementById("loginBtn").addEventListener("click", doLogin);
document.getElementById("loginPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

async function doLogin() {
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginErr");
  errEl.textContent = "";
  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Xato");
    showShell();
  } catch (err) {
    errEl.textContent = err.message;
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch(API + "/logout", { method: "POST", credentials: "same-origin" });
  showLogin();
});

// ---------- Navigation ----------
document.querySelectorAll(".admin-sidebar nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-sidebar nav button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const panel = btn.dataset.panel;
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${panel}`).classList.add("active");
  });
});

// ---------- Products ----------
async function loadProducts() {
  const products = await apiFetch("/products");
  const tbody = document.getElementById("productsTableBody");
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-note">Mahsulotlar yo'q</td></tr>`;
    return;
  }
  tbody.innerHTML = products
    .map(
      (p) => `
    <tr>
      <td><img src="${p.image}" alt=""></td>
      <td>${p.name.uz}</td>
      <td>${Number(p.price).toLocaleString("ru-RU")} so'm</td>
      <td>${p.loads || "—"}</td>
      <td><button class="btn btn-danger" data-del="${p.id}">O'chirish</button></td>
    </tr>`
    )
    .join("");
  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Mahsulotni o'chirishga ishonchingiz komilmi?")) return;
      try {
        await apiFetch(`/products/${btn.dataset.del}`, { method: "DELETE" });
        toast("Mahsulot o'chirildi");
        loadProducts();
      } catch (err) {
        toast(err.message);
      }
    });
  });
}

const productForm = document.getElementById("productForm");
const imageFileInput = productForm.querySelector('input[name="imageFile"]');
const thumbPreview = document.getElementById("thumbPreview");

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  if (!file) return (thumbPreview.style.display = "none");
  thumbPreview.src = URL.createObjectURL(file);
  thumbPreview.style.display = "block";
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = productForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    let imagePath = "";
    const file = imageFileInput.files[0];
    if (file) {
      const fd = new FormData();
      fd.append("image", file);
      const uploadRes = await fetch(API + "/upload", { method: "POST", credentials: "same-origin", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Rasm yuklanmadi");
      imagePath = uploadData.path;
    }

    const fd2 = new FormData(productForm);
    const body = {
      name_uz: fd2.get("name_uz"),
      name_ru: fd2.get("name_ru"),
      price: fd2.get("price"),
      loads: fd2.get("loads"),
      scent: fd2.get("scent"),
      description_uz: fd2.get("description_uz"),
      description_ru: fd2.get("description_ru"),
      image: imagePath || undefined,
    };
    await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });
    toast("Mahsulot qo'shildi ✅");
    productForm.reset();
    thumbPreview.style.display = "none";
    loadProducts();
  } catch (err) {
    toast(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- Orders ----------
const SOURCE_LABEL = { website: "🌐 Sayt", telegram_bot: "🤖 Bot" };

async function loadOrders() {
  const orders = await apiFetch("/orders");
  const tbody = document.getElementById("ordersTableBody");
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-note">Buyurtmalar yo'q</td></tr>`;
    return;
  }
  tbody.innerHTML = orders
    .map(
      (o) => `
    <tr>
      <td>${o.id}</td>
      <td>${o.name}</td>
      <td>${o.phone}</td>
      <td>${SOURCE_LABEL[o.source] || "🌐 Sayt"}</td>
      <td>${Number(o.total).toLocaleString("ru-RU")} so'm</td>
      <td>${new Date(o.createdAt).toLocaleString("ru-RU")}</td>
      <td>
        <select class="status-select" data-order="${o.id}">
          ${["new", "confirmed", "done", "cancelled"]
            .map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
      </td>
    </tr>`
    )
    .join("");
  tbody.querySelectorAll("[data-order]").forEach((sel) => {
    sel.addEventListener("change", async () => {
      try {
        await apiFetch(`/orders/${sel.dataset.order}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: sel.value }),
        });
        toast("Status yangilandi");
      } catch (err) {
        toast(err.message);
      }
    });
  });
}

// ---------- Users ----------
async function loadUsers() {
  const users = await apiFetch("/users");
  const tbody = document.getElementById("usersTableBody");
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-note">Hali foydalanuvchilar yo'q</td></tr>`;
    return;
  }
  tbody.innerHTML = users
    .map(
      (u) => `
    <tr>
      <td>${[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
      <td>${u.username ? "@" + u.username : "—"}</td>
      <td>${u.phone || "—"}</td>
      <td>${u.telegramId}</td>
      <td>${new Date(u.registeredAt).toLocaleString("ru-RU")}</td>
    </tr>`
    )
    .join("");
}

// ---------- Messages ----------
async function loadMessages() {
  const messages = await apiFetch("/messages");
  const tbody = document.getElementById("messagesTableBody");
  if (!messages.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-note">Murojaatlar yo'q</td></tr>`;
    return;
  }
  tbody.innerHTML = messages
    .map(
      (m) => `
    <tr>
      <td>${m.name}</td>
      <td>${m.contact}</td>
      <td>${m.message}</td>
      <td>${new Date(m.createdAt).toLocaleString("ru-RU")}</td>
    </tr>`
    )
    .join("");
}

function loadAll() {
  loadProducts();
  loadOrders();
  loadUsers();
  loadMessages();
}

checkSession();
