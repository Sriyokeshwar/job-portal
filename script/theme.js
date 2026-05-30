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

});