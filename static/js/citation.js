const copyButton = document.getElementById("copyButton");
const bibtexBlock = document.getElementById("bibtexBlock");

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(bibtexBlock.textContent);
        copyButton.textContent = "Copied!";
        copyButton.classList.add("copied");
        setTimeout(() => {
            copyButton.textContent = "Copy";
            copyButton.classList.remove("copied");
        }, 2000);
    } catch (err) {
        console.error("Failed to copy BibTeX:", err);
    }
});
