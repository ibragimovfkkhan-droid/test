
const SOCIAL_LINKS = {
  telegram: "https://t.me/velira_uz",
  instagram: "https://instagram.com/velira.uz",
  phone: "+998950170800",
  email: "ssaid701@icloud.com",
};

const ICON_TELEGRAM = '<i class="fa-brands fa-telegram"></i>';
const ICON_INSTAGRAM = '<i class="fa-brands fa-instagram"></i>';

function renderHeader(activePage) {
  const el = document.getElementById("site-header");
  if (!el) return;
  el.innerHTML = `
  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="logo"><img src="images/logo.png" alt="Mächtiger Mond"></a>
      <nav class="main-nav">
        <a href="index.html" data-i="navHome" class="${activePage === "home" ? "active" : ""}">Bosh sahifa</a>
        <a href="shop.html" data-i="navShop" class="${activePage === "shop" ? "active" : ""}">Mahsulotlar</a>
        <a href="about.html" data-i="navAbout" class="${activePage === "about" ? "active" : ""}">Biz haqimizda</a>
        <a href="contact.html" data-i="navContact" class="${activePage === "contact" ? "active" : ""}">Aloqa</a>
      </nav>
      <div class="header-right">
        <div class="lang-toggle">
          <button data-lang="uz">UZ</button>
          <button data-lang="ru">RU</button>
        </div>
        <button class="burger-btn" id="burgerBtn" aria-label="Menyu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
  <nav class="mobile-nav-panel" id="mobileNavPanel">
    <button class="mobile-nav-close" id="mobileNavCloseBtn" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
    <a href="index.html" data-i="navHome" class="${activePage === "home" ? "active" : ""}">Bosh sahifa</a>
    <a href="shop.html" data-i="navShop" class="${activePage === "shop" ? "active" : ""}">Mahsulotlar</a>
    <a href="about.html" data-i="navAbout" class="${activePage === "about" ? "active" : ""}">Biz haqimizda</a>
    <a href="contact.html" data-i="navContact" class="${activePage === "contact" ? "active" : ""}">Aloqa</a>
  </nav>
  <button class="cart-fab" id="openCartBtn" aria-label="Savat">
    <i class="fa-solid fa-cart-shopping"></i>
    <span class="cart-count" id="cartCount">0</span>
  </button>`;
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html"><img src="images/logo.png" alt="Mächtiger Mond"></a>
        <p data-i="footAbout">Konsentrlangan kir yuvish listlari zamonaviy uy uchun. O'zbekistonda rasmiy distribyutor.</p>
        <div class="social-row">
          <a class="social-btn" href="${SOCIAL_LINKS.telegram}" target="_blank" rel="noopener" aria-label="Telegram">${ICON_TELEGRAM}</a>
          <a class="social-btn" href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON_INSTAGRAM}</a>
        </div>
      </div>
      <div>
        <h4 data-i="footNav1">Do'kon</h4>
        <ul>
          <li><a href="shop.html" data-i="fL1">Ocean</a></li>
          <li><a href="shop.html" data-i="fL2">Wild Lavender</a></li>
        </ul>
      </div>
      <div>
        <h4 data-i="footNav2">Kompaniya</h4>
        <ul>
          <li><a href="about.html" data-i="fL3">Biz haqimizda</a></li>
          <li><a href="contact.html" data-i="fL4">Aloqa</a></li>
        </ul>
      </div>
      <div>
        <h4 data-i="footNav3">Aloqa</h4>
        <ul>
          <li><a href="mailto:${SOCIAL_LINKS.email}">${SOCIAL_LINKS.email}</a></li>
          <li><a href="tel:${SOCIAL_LINKS.phone}">${SOCIAL_LINKS.phone}</a></li>
          <li><a href="${SOCIAL_LINKS.telegram}" target="_blank" rel="noopener">Telegram</a></li>
          <li><a href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener">Instagram</a></li>
        </ul>
      </div>
    </div>
    <div class="bottom-row">
      <span>© 2026 Velira.uz</span>
      <span data-i="footRights">Barcha huquqlar himoyalangan</span>
    </div>
  </footer>`;
}
