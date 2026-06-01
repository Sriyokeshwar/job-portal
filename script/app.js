const menuBtn = document.getElementById("menuBtn");
const sidebarNav = document.getElementById("sidebarNav");

if (menuBtn && sidebarNav) {
    menuBtn.addEventListener("click", () => {
        sidebarNav.classList.toggle("show");
    });

    // Close sidebar when a nav link is clicked on mobile
    sidebarNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            sidebarNav.classList.remove("show");
        });
    });
}
