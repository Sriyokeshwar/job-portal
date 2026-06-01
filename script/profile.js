// profile.js - Profile Management, Editable Photo, and Dynamic Customization

let activeUserSession = JSON.parse(sessionStorage.getItem("currentUser"));

if (!activeUserSession) {
    window.location.href = "./login.html";
}

const profileImage = document.getElementById("profileImage");
const profileImageInput = document.getElementById("profileImageInput");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAge = document.getElementById("profileAge");
const profileGender = document.getElementById("profileGender");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const profileColorInput = document.getElementById("profileColor");

const ageSlider = document.getElementById("age");
const ageValue = document.getElementById("ageValue");

const profileForm = document.getElementById("profileForm");

let uploadedBase64Image = "";

document.addEventListener("DOMContentLoaded", () => {
    loadProfilePage();

    // Wire up sliders
    if (ageSlider) {
        ageSlider.addEventListener("input", () => {
            ageValue.textContent = `Age: ${ageSlider.value}`;
        });
    }

    // Wire up editable profile image picker
    if (profileImageInput) {
        profileImageInput.addEventListener("change", handleProfilePhotoChange);
    }
});

// Load user details dynamically from server database
async function loadProfilePage() {
    try {
        // Fetch fresh state from db
        const freshUser = await getUserByMail(activeUserSession.email);
        if (freshUser) {
            activeUserSession = freshUser;
            sessionStorage.setItem("currentUser", JSON.stringify(freshUser));
        }

        renderUserProfile(activeUserSession);

    } catch (error) {
        console.error("Profile Service Interruption:", error);
        showNotification("Failed to fetch fresh profile state.", "danger");
        // Fallback to cached session
        renderUserProfile(activeUserSession);
    }
}

// Bind payload details to DOM nodes
function renderUserProfile(user) {
    if (!user) return;

    // Direct image rendering or default fallback
    if (profileImage) {
        profileImage.src = user.profileImage || "../assets/images/user.png";
    }

    if (profileName) {
        profileName.textContent = user.name;
        profileName.style.color = user.color || "var(--primary)";
        
        // Dynamically style photo border
        if (profileImage) {
            profileImage.style.borderColor = user.color || "var(--primary)";
        }
        
        // Dynamically update upload trigger color
        const trigger = document.getElementById("photoUploadTrigger");
        if (trigger) {
            trigger.style.background = user.color || "var(--primary)";
        }
    }

    if (profileEmail) profileEmail.textContent = user.email;
    if (profilePhone) profilePhone.textContent = formatContact(user.phone);
    if (profileAge) profileAge.textContent = `${user.age} Years Old`;
    if (profileGender) {
        profileGender.textContent = user.gender || "Male";
        // Apply color badge depends on gender value
        if (user.gender === "Female") {
            profileGender.className = "detail-badge badge-secondary";
        } else if (user.gender === "Other") {
            profileGender.className = "detail-badge badge-warning";
        } else {
            profileGender.className = "detail-badge badge-primary";
        }
    }

    // Inputs population
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone;
    if (profileColorInput) profileColorInput.value = user.color || "#2563eb";
    if (ageSlider) {
        ageSlider.value = user.age || 21;
        if (ageValue) ageValue.textContent = `Age: ${user.age || 21}`;
    }
}

// Convert chosen profile photo to base64, preview instantly, and cache in memory
async function handleProfilePhotoChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        uploadedBase64Image = await convertPhotoToBase64(file);
        
        // Preview instantly
        if (profileImage) {
            profileImage.src = uploadedBase64Image;
            showNotification("Image preview updated! Click Save Updates to submit.", "success");
        }
    } catch (error) {
        console.error("Base64 photo loader failure:", error);
        showNotification("Failed to process photo upload.", "danger");
    }
}

// Convert image files to Base64 strings safely
function convertPhotoToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

// Handle Form Submission updates
if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const color = profileColorInput.value;
            const age = ageSlider.value;

            // Contact and Name validations
            const phonePattern = /^[0-9]{10}$/;
            if (!name) {
                showNotification("Please enter your name!", "warning");
                return;
            }

            if (!phonePattern.test(phone)) {
                showNotification("Please enter a valid 10-digit contact number!", "warning");
                return;
            }

            // Centralized submit loading states
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<span>Saving Profile Updates... ⏳</span>";

            // Map updated model payload
            const updatedUserPayload = {
                ...activeUserSession,
                name,
                phone,
                color,
                age,
                // Keep existing base64 image if no new one was uploaded
                profileImage: uploadedBase64Image || activeUserSession.profileImage
            };

            await updateUser(activeUserSession.id, updatedUserPayload);

            // Sync session
            sessionStorage.setItem("currentUser", JSON.stringify(updatedUserPayload));
            activeUserSession = updatedUserPayload;

            showNotification("Profile settings updated successfully! 💾", "success");

            // Rerender layout
            renderUserProfile(updatedUserPayload);

            submitBtn.disabled = false;
            submitBtn.innerHTML = "<span>Save Updates 💾</span>";

            // Reload page briefly to sync navbar display values
            setTimeout(() => {
                location.reload();
            }, 1000);

        } catch (error) {
            console.error("Profile submit failure:", error);
            showNotification("Failed to save profile changes. Check server status.", "danger");
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "<span>Save Updates 💾</span>";
            }
        }
    });
}

// Utility formats phone contacts
function formatContact(val) {
    if (!val) return "+91 98765 43210";
    const clean = String(val).replace(/[^0-9]/g, "");
    if (clean.length === 10) {
        return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return val;
}