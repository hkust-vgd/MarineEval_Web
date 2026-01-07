// Get the stored count or initialize it to 0
let count = localStorage.getItem("pageViews");
count = count ? parseInt(count) : 0;

// Increment count each time page is loaded (not every click)
count++;
localStorage.setItem("pageViews", count);

// Update display
document.getElementById("clickCount").textContent = count;
