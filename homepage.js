// Homepage Lightbox

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".expandable").forEach(img => {
    img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
});

lightboxClose.addEventListener("click", () => {
    lightbox.classList.add("hidden");
    document.body.style.overflow = "";
});

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        lightbox.classList.add("hidden");
        document.body.style.overflow = "";
    }
});
