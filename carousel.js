document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const btnPrev = carousel.querySelector(".arrow.left");
  const btnNext = carousel.querySelector(".arrow.right");

  if (!track || !btnPrev || !btnNext) return;

  function getCardWidth() {
    const card = track.querySelector(".product-card");
    if (!card) return 0;

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap || style.columnGap || 40);

    return card.offsetWidth + gap;
  }

  btnNext.addEventListener("click", () => {
    track.scrollBy({
      left: getCardWidth(),
      behavior: "smooth",
    });
  });

  btnPrev.addEventListener("click", () => {
    track.scrollBy({
      left: -getCardWidth(),
      behavior: "smooth",
    });
  });
});




const trackProducts = document.querySelector(".products-section .carousel-track");
const btnPrevProducts = document.querySelector(".products-section .arrow.left");
const btnNextProducts = document.querySelector(".products-section .arrow.right");

function getCardWidthProducts() {
  const card = trackProducts.querySelector(".product-card");
  const style = window.getComputedStyle(trackProducts);
  const gap = parseFloat(style.columnGap || style.gap || 40);
  return card.offsetWidth + gap;
}

btnNextProducts.addEventListener("click", () => {
  trackProducts.scrollLeft += getCardWidthProducts();
});

btnPrevProducts.addEventListener("click", () => {
  trackProducts.scrollLeft -= getCardWidthProducts();
});



const section = document.querySelector(".save-section");

window.addEventListener("scroll", () => {
  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Scroll progress from entering → center
  let progress = (windowHeight - rect.top) / (windowHeight + rect.height);

  // Clamp 0 → 1
  progress = Math.max(0, Math.min(1, progress));

  // Zoom ONLY increases, never retreats
  const zoom = 1 + progress * 0.25;
  section.style.setProperty("--zoom", zoom);

  // Darkness + blur start AFTER center
  const exitProgress = Math.max(0, (rect.top * -1) / rect.height);

  const darkness = Math.min(exitProgress * 0.7, 0.7);
  const blur = Math.min(exitProgress * 10, 10);

  section.style.setProperty("--darkness", darkness);
  section.style.setProperty("--blur", blur);
});




const newsletter = document.querySelector(".newsletter");

const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      newsletter.classList.add("is-visible");
    }
  },
  {
    threshold: 0.35, 
  }
);

observer.observe(newsletter);





