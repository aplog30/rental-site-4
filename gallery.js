// ============================
//  AUTO-GENERATED GALLERY LIST
// ============================

// Change this number to match how many gallery images you uploaded
const TOTAL_IMAGES = 12;   // Example: 12 images (gallery1.jpg through gallery12.jpg)

// Automatically generate image file names
const IMAGES = [];
for (let i = 1; i <= TOTAL_IMAGES; i++) {
  IMAGES.push({
    src: `images/gallery/gallery${i}.jpg`,
    caption: `Guest photo #${i} 🌴`
  });
}

// ============================
//  Masonry + Infinite Scroll
// ============================

const galleryEl = document.getElementById("gallery");
const sentinel = document.getElementById("sentinel");

let loadedCount = 0;
const BATCH_SIZE = 6;

function loadNextBatch() {
  const next = IMAGES.slice(loadedCount, loadedCount + BATCH_SIZE);

  next.forEach((img, i) => {
    const index = loadedCount + i;

    const item = document.createElement("div");
    item.className = "gallery-item";
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${img.src}" alt="Gallery image ${index}">
      <div class="gallery-tag">California Dream</div>
    `;

    item.addEventListener("click", () => openLightbox(index));
    galleryEl.appendChild(item);
  });

  loadedCount += next.length;

  // End of image list
  if (loadedCount >= IMAGES.length) {
    sentinel.textContent = "You reached the end 🌴";
    observer.disconnect();
  }
}

// Infinite scroll trigger
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadNextBatch();
  }
}, { rootMargin: "200px" });

observer.observe(sentinel);

// Load first set immediately
loadNextBatch();


// ============================
//  Lightbox Logic
// ============================

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeBtn = document.getElementById("lightboxClose");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const img = IMAGES[currentIndex];
  lightboxImg.src = img.src;
  lightboxCaption.textContent = img.caption;
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Disable scrolling behind lightbox
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function showPrev() {
  currentIndex = (currentIndex - 1 + IMAGES.length) % IMAGES.length;
  openLightbox(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % IMAGES.length;
  openLightbox(currentIndex);
}

closeBtn.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);

// Close on background click
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();
});
