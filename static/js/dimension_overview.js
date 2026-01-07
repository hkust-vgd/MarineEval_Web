const tooltip = document.getElementById("tooltip");
const masks = document.querySelectorAll(".mask");

masks.forEach((mask) => {
    mask.addEventListener("mousemove", (e) => {
        const title = mask.getAttribute("data-title");
        const desc = mask.getAttribute("data-desc");

        // Update tooltip content
        tooltip.innerHTML = `
            <div class="tooltip-title">${title || ""}</div>
            <div class="tooltip-desc">${desc || ""}</div>
        `;

        tooltip.classList.add("show");

        const svgRect = e.target.ownerSVGElement.getBoundingClientRect();
        tooltip.style.left = e.clientX - svgRect.left + "px";
        tooltip.style.top = e.clientY - svgRect.top - 10 + "px";
    });

    mask.addEventListener("mouseleave", () => {
        tooltip.classList.remove("show");
    });
});
