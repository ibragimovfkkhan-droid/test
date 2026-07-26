

function carouselSlideHTML(images, alt) {
  return images
    .map(
      (src, i) =>
        `<div class="car-slide${i === 0 ? " active" : ""}"><img src="${src}" alt="${alt}" loading="lazy"></div>`
    )
    .join("");
}

function carouselDotsHTML(images) {
  return images
    .map((_, i) => `<button class="car-dot${i === 0 ? " active" : ""}" data-idx="${i}" aria-label="Slide ${i + 1}"></button>`)
    .join("");
}


function buildCarousel(images, alt, extraClass) {
  if (!images || images.length === 0) return "";
  if (images.length === 1) {
    return `<div class="car-single"><img src="${images[0]}" alt="${alt}" loading="lazy"></div>`;
  }
  return `
  <div class="img-carousel ${extraClass || ""}" data-carousel data-count="${images.length}">
    <div class="car-track">${carouselSlideHTML(images, alt)}</div>
    <button class="car-arrow car-prev" data-dir="-1" aria-label="Previous">‹</button>
    <button class="car-arrow car-next" data-dir="1" aria-label="Next">›</button>
    <div class="car-dots">${carouselDotsHTML(images)}</div>
  </div>`;
}

function initCarousels(root) {
  const scope = root || document;
  const carousels = scope.querySelectorAll("[data-carousel]:not([data-car-ready])");
  carousels.forEach((car) => {
    car.setAttribute("data-car-ready", "1");
    const slides = Array.from(car.querySelectorAll(".car-slide"));
    const dots = Array.from(car.querySelectorAll(".car-dot"));
    const count = slides.length;
    let index = 0;
    let timer = null;

    function goTo(i) {
      index = (i + count) % count;
      slides.forEach((s, n) => s.classList.toggle("active", n === index));
      dots.forEach((d, n) => d.classList.toggle("active", n === index));
    }

    function next() {
      goTo(index + 1);
    }

    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(next, 5000);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function restartAutoplay() {
      startAutoplay();
    }

    car.querySelectorAll(".car-arrow").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = parseInt(btn.getAttribute("data-dir"), 10);
        goTo(index + dir);
        restartAutoplay();
      });
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(parseInt(dot.getAttribute("data-idx"), 10));
        restartAutoplay();
      });
    });


    car.addEventListener("mouseenter", stopAutoplay);
    car.addEventListener("mouseleave", startAutoplay);

    // basic swipe support for touch devices
    let touchStartX = 0;
    car.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
      },
      { passive: true }
    );
    car.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        startAutoplay();
      },
      { passive: true }
    );

    startAutoplay();
  });
}

document.addEventListener("DOMContentLoaded", () => initCarousels());
