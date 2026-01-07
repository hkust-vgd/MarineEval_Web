const images = document.querySelectorAll(".gallery-image");
const prevBtn = document.querySelector(".gallery-btn.prev");
const nextBtn = document.querySelector(".gallery-btn.next");
const galleryWrapper = document.querySelector(".gallery-image-wrapper");
let currentIndex = 0;

function showImage(index) {
    images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
    });

    // Auto-adjust height based on active image
    const activeImage = images[index];
    if (activeImage.complete) {
        adjustHeight(activeImage);
    } else {
        activeImage.onload = () => adjustHeight(activeImage);
    }
}

function adjustHeight(image) {
    galleryWrapper.style.height = image.height + "px";
}

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
});

// Auto-play + resize logic
let autoSlide = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
}, 5000);

document
    .querySelector(".gallery")
    .addEventListener("mouseover", () => clearInterval(autoSlide));
document.querySelector(".gallery").addEventListener("mouseleave", () => {
    autoSlide = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }, 5000);
});

// Set initial height
window.addEventListener("load", () => showImage(currentIndex));
window.addEventListener("resize", () => adjustHeight(images[currentIndex]));
