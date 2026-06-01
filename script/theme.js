<<<<<<< HEAD
// theme.js - Smooth Theme Manager and Toggle Sync

document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.getElementById("themeToggleBtn");
    
    // Apply transitions to body AFTER initial theme load to prevent Flash of Unstyled Content (FOUC)
    setTimeout(() => {
        document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
    }, 50);

    const savedTheme = localStorage.getItem("jobflowTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        if (themeBtn) {
            themeBtn.textContent = "☀️";
            themeBtn.setAttribute("aria-label", "Switch to Light Mode");
        }
    } else {
        document.body.classList.remove("dark-theme");
        if (themeBtn) {
            themeBtn.textContent = "🌙";
            themeBtn.setAttribute("aria-label", "Switch to Dark Mode");
        }
    }

    if (themeBtn) {
        // Clear any old event listeners
        const newThemeBtn = themeBtn.cloneNode(true);
        themeBtn.parentNode.replaceChild(newThemeBtn, themeBtn);
        
        newThemeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");

            if (document.body.classList.contains("dark-theme")) {
                localStorage.setItem("jobflowTheme", "dark");
                newThemeBtn.textContent = "☀️";
                newThemeBtn.setAttribute("aria-label", "Switch to Light Mode");
                showNotification("Dark theme enabled!", "info");
            } else {
                localStorage.setItem("jobflowTheme", "light");
                newThemeBtn.textContent = "🌙";
                newThemeBtn.setAttribute("aria-label", "Switch to Dark Mode");
                showNotification("Light theme enabled!", "info");
            }
        });
    }
=======
document.addEventListener("DOMContentLoaded",()=>{

    const themeBtn=document.getElementById("themeToggleBtn");

    const savedTheme=localStorage.getItem("jobflowTheme");

    if(savedTheme==="dark"){

        document.body.classList.add("dark-theme");

        if(themeBtn){
            themeBtn.textContent="☀️";
        }

    }else{

        document.body.classList.remove("dark-theme");

        if(themeBtn){
            themeBtn.textContent="🌙";
        }

    }

    if(themeBtn){

        themeBtn.addEventListener("click",()=>{

            document.body.classList.toggle("dark-theme");

            if(document.body.classList.contains("dark-theme")){

                localStorage.setItem("jobflowTheme","dark");
                themeBtn.textContent="☀️";

            }else{

                localStorage.setItem("jobflowTheme","light");
                themeBtn.textContent="🌙";

            }

        });

    }

>>>>>>> 42e0657cae51ca6f73b742664e34bef7bf96d9e8
});