// ================== LOAD DATASET (dynamic) ==================
async function loadDataset() {
    try {
        const response = await fetch("static/dataset/data.json");
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const dataset = await response.json();
        console.log("✅ Dataset loaded:", dataset);
        initDataGallery(dataset);
    } catch (err) {
        console.error("❌ Failed to load dataset:", err);
        document.getElementById(
            "dataCardContainer"
        ).innerHTML = `<p style="color:red;text-align:center;">Failed to load dataset. Check console or path.</p>`;
    }
}

loadDataset();

// ================== GALLERY BUILDER ==================
function initDataGallery(dataset) {
    const container = document.getElementById("dataCardContainer");
    let currentIndex = 0;

    const typeMap = {
        0: "Yes-No Question",
        1: "Multiple Choice Question",
        2: "Open-Ended Question",
        3: "Localization Question",
        4: "Closed-Form Question",
        5: "Closed-Form Question",
    };

    function createDataCard(item) {
        const card = document.createElement("div");
        card.className = "data-card";

        // Header
        const title = document.createElement("h3");
        title.textContent = `Question ID: ${item.id}`;
        const dim = document.createElement("div");
        dim.className = "dimension-label";
        dim.textContent = `Dimension: ${item.dimension}`;
        const type = document.createElement("div");
        type.className = "question-type";
        type.textContent = `Type: ${
            typeMap[item.question_format] || "Unknown"
        }`;
        card.appendChild(title);
        card.appendChild(dim);
        card.appendChild(type);

        // Gallery setup
        const galleryWrapper = document.createElement("div");
        galleryWrapper.className = "gallery-wrapper relative-parent";

        const gallery = document.createElement("div");
        gallery.className = "gallery fixed-height";

        const wrapper = document.createElement("div");
        wrapper.className = "gallery-image-wrapper";
        gallery.appendChild(wrapper);
        galleryWrapper.appendChild(gallery);
        card.appendChild(galleryWrapper);

        // Handle multiple images
        const numImages = item.images?.length || 0;
        let currentImgIndex = 0;

        // Image setup
        const img = document.createElement("img");
        img.className = "gallery-image zoomable";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        // BBox
        let bbox;
        if (item.question_format === 3 && item.answers?.[0]?.answer) {
            bbox = document.createElement("div");
            bbox.className = "bbox";
        }

        // transform layer for zoom/pan
        const transformLayer = document.createElement("div");
        transformLayer.className = "transform-layer";
        transformLayer.style.position = "absolute";
        transformLayer.style.left = "50%";
        transformLayer.style.top = "50%";
        transformLayer.style.transformOrigin = "center center";
        transformLayer.style.display = "flex";
        transformLayer.style.justifyContent = "center";
        transformLayer.style.alignItems = "center";
        transformLayer.style.transition = "transform 0.1s ease-out";
        wrapper.appendChild(transformLayer);

        transformLayer.appendChild(img);
        if (bbox) transformLayer.appendChild(bbox);

        // Inner nav buttons if two images
        if (numImages === 2) {
            const prevImgBtn = document.createElement("button");
            const nextImgBtn = document.createElement("button");
            prevImgBtn.className = "gallery-btn prev-inner";
            nextImgBtn.className = "gallery-btn next-inner";
            prevImgBtn.innerHTML = "&#10094;";
            nextImgBtn.innerHTML = "&#10095;";
            wrapper.appendChild(prevImgBtn);
            wrapper.appendChild(nextImgBtn);

            prevImgBtn.addEventListener("click", () => {
                currentImgIndex = (currentImgIndex - 1 + numImages) % numImages;
                setGalleryImage();
            });
            nextImgBtn.addEventListener("click", () => {
                currentImgIndex = (currentImgIndex + 1) % numImages;
                setGalleryImage();
            });
        }

        // Auto slideshow for more than 2 images
        let slideshowTimer;
        function startAutoSlideshow() {
            if (numImages > 2) {
                slideshowTimer = setInterval(() => {
                    currentImgIndex = (currentImgIndex + 1) % numImages;
                    setGalleryImage();
                }, 1000);
            }
        }
        function stopAutoSlideshow() {
            if (slideshowTimer) clearInterval(slideshowTimer);
        }

        function setGalleryImage() {
            img.src = `static/dataset/images/${item.images[currentImgIndex]}`;
        }

        setGalleryImage();
        startAutoSlideshow();

        // Question text
        const qText = document.createElement("div");
        qText.className = "question-text";
        qText.textContent =
            item.question_raw || item.question || "No question text.";
        card.appendChild(qText);

        // Answers block (same as before)
        const ans = document.createElement("div");
        ans.className = "answers";
        switch (item.question_format) {
            case 0:
                ["Yes", "No"].forEach((opt, idx) => {
                    const btn = document.createElement("button");
                    btn.className =
                        "answer-btn" +
                        (item.answers[0].answer === idx ? " correct" : "");
                    btn.textContent = opt;
                    ans.appendChild(btn);
                });
                break;
            case 1:
                for (const [key, val] of Object.entries(item.options || {})) {
                    const opt = document.createElement("div");
                    const correct = item.answers[0].answer;
                    const isCorrect = val === correct || key === correct;
                    opt.className =
                        "option-item" + (isCorrect ? " correct" : "");
                    opt.textContent = `${key}: ${val}`;
                    ans.appendChild(opt);
                }
                break;
            case 2:
                const ul = document.createElement("ul");
                ul.className = "answer-list";
                item.answers.forEach((a) => {
                    const li = document.createElement("li");
                    const at = a.answer?.trim() || "";
                    li.textContent = at.charAt(0).toUpperCase() + at.slice(1);
                    ul.appendChild(li);
                });
                ans.appendChild(ul);
                break;
            case 3:
                const note = document.createElement("div");
                note.className = "local-note";
                note.textContent = "Bounding box shown in the image above.";
                ans.appendChild(note);
                break;
            default:
                const txt = document.createElement("div");
                txt.textContent =
                    "Answer: " + (item.answers[0]?.answer || "N/A");
                txt.style.fontWeight = "600";
                txt.style.color = "#155724";
                ans.appendChild(txt);
        }
        card.appendChild(ans);

        // Initialize zoom/pan
        makeImageInteractive(wrapper, img, bbox, item, transformLayer);

        card.addEventListener("mouseleave", stopAutoSlideshow);
        card.addEventListener("mouseenter", startAutoSlideshow);

        return card;
    }

    function showCard(index) {
        container.innerHTML = "";
        const item = dataset.data[index];
        const card = createDataCard(item);
        container.appendChild(card);
    }

    showCard(currentIndex);

    document
        .querySelector(".data-gallery-container .prev")
        .addEventListener("click", () => {
            currentIndex =
                (currentIndex - 1 + dataset.data.length) % dataset.data.length;
            showCard(currentIndex);
        });
    document
        .querySelector(".data-gallery-container .next")
        .addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % dataset.data.length;
            showCard(currentIndex);
        });
}

// ================== IMAGE INTERACTIVITY (Zoom + Pan + BBox sync) ==================
function makeImageInteractive(wrapper, img, bbox, item, transformLayer) {
    let scale = 1,
        panX = 0,
        panY = 0;
    let isDragging = false,
        startX,
        startY;

    const hasBbox = Boolean(bbox && item?.answers?.[0]?.answer);
    const [bx, by, bw, bh] = hasBbox ? item.answers[0].answer : [0, 0, 0, 0];

    img.onload = () => {
        const cw = wrapper.clientWidth;
        const ch = wrapper.clientHeight;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const imageAspect = iw / ih;
        const containerAspect = cw / ch;

        let displayWidth, displayHeight;
        if (imageAspect > containerAspect) {
            displayWidth = cw;
            displayHeight = cw / imageAspect;
        } else {
            displayHeight = ch;
            displayWidth = ch * imageAspect;
        }
        transformLayer.style.width = `${displayWidth}px`;
        transformLayer.style.height = `${displayHeight}px`;

        const sx = displayWidth / item.image_width;
        const sy = displayHeight / item.image_height;

        if (hasBbox) {
            bbox.style.left = `${bx * sx}px`;
            bbox.style.top = `${by * sy}px`;
            bbox.style.width = `${bw * sx}px`;
            bbox.style.height = `${bh * sy}px`;
            bbox.style.position = "absolute";
            bbox.style.border = "3px solid rgba(255,59,59,0.85)";
            bbox.style.boxShadow = "0 0 6px rgba(255,59,59,0.5)";
        }

        scale = 1;
        panX = panY = 0;
        updateTransform();
    };

    function updateTransform() {
        transformLayer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    // Wheel zoom
    wrapper.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const prevScale = scale;
        scale = Math.min(Math.max(1, scale + delta), 5);
        // adjust pan to zoom toward cursor
        const rect = wrapper.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        panX += cx * (1 - prevScale / scale);
        panY += cy * (1 - prevScale / scale);
        updateTransform();
    });

    // Drag to pan
    wrapper.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        wrapper.style.cursor = "grabbing";
    });

    wrapper.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
    });

    wrapper.addEventListener("mouseup", () => {
        isDragging = false;
        wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mouseleave", () => {
        isDragging = false;
        wrapper.style.cursor = "default";
    });
}
