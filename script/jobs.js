// jobs.js - Share Job Opportunity Manager

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "./login.html";
}

const jobForm = document.getElementById("jobForm");

if (jobForm) {
    jobForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const company = document.getElementById("company").value.trim();
            const jobTitle = document.getElementById("jobTitle").value.trim();
            const location = document.getElementById("location").value.trim();
            const salary = document.getElementById("salary").value.trim();
            const applyLink = document.getElementById("applyLink").value.trim();
            const description = document.getElementById("description").value.trim();

            // Strict Validation checks
            if (!company || !jobTitle || !location || !salary || !applyLink || !description) {
                showNotification("Please fill in all required job fields!", "warning");
                return;
            }

            // Centralized submit loading states
            const submitBtn = jobForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<span>Publishing Job Listing... ⏳</span>";

            const jobPayload = {
                company,
                jobTitle,
                location,
                salary,
                applyLink,
                description,
                postedBy: currentUser.name,
                userId: currentUser.id,
                postedDate: new Date().toLocaleDateString()
            };

            await addJob(jobPayload);

            showNotification("Success! Job opening shared with the community. 📤", "success");
            
            jobForm.reset();

            // Redirect back to Browse Jobs page after brief pause
            setTimeout(() => {
                window.location.href = "./jobs.html";
            }, 1200);

        } catch (error) {
            console.error("Add Job Controller failure:", error);
            showNotification("Failed to post job listing. Check backend connection.", "danger");
            const submitBtn = jobForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "<span>Share Job</span>";
            }
        }
    });
}