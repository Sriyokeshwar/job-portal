// job-list.js - Job Search and Apply Manager

const jobsContainer = document.getElementById("jobsContainer");
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");

let allJobs = [];
const currentUserSession = JSON.parse(sessionStorage.getItem("currentUser"));

document.addEventListener("DOMContentLoaded", () => {
    loadJobsPage();

    if (searchInput) searchInput.addEventListener("input", filterAndRenderJobs);
    if (searchBtn)   searchBtn.addEventListener("click", filterAndRenderJobs);

    // Modal buttons
    const cancelBtn  = document.getElementById("modalCancelBtn");
    const confirmBtn = document.getElementById("modalConfirmBtn");
    const modal      = document.getElementById("confirmModal");

    if (cancelBtn && modal) {
        cancelBtn.addEventListener("click", () => {
            modal.style.display = "none";
            activeApplyJobId = null;
        });
    }
    if (confirmBtn && modal) {
        confirmBtn.addEventListener("click", async () => {
            modal.style.display = "none";
            if (activeApplyJobId) {
                await processJobApply(activeApplyJobId);
                activeApplyJobId = null;
            }
        });
    }
});

async function loadJobsPage() {
    renderLoadingSkeletons();
    try {
        allJobs = await getJobs();
        filterAndRenderJobs();

        // Handle incoming search query from dashboard
        const urlParams   = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get("search");
        if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
            filterAndRenderJobs();
        }
    } catch (error) {
        console.error("Job load error:", error);
        if (jobsContainer) {
            jobsContainer.innerHTML = `<p style="padding:20px;color:var(--danger);">Failed to load jobs. Check backend connection.</p>`;
        }
    }
}

function renderLoadingSkeletons() {
    if (!jobsContainer) return;
    jobsContainer.innerHTML = `
        <div class="skeleton" style="height:200px;border-radius:var(--radius-lg);"></div>
        <div class="skeleton" style="height:200px;border-radius:var(--radius-lg);"></div>
        <div class="skeleton" style="height:200px;border-radius:var(--radius-lg);"></div>
    `;
}

function filterAndRenderJobs() {
    if (!jobsContainer) return;
    let filtered = [...allJobs];

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
    if (searchVal) {
        filtered = filtered.filter(job =>
            (job.jobTitle    && job.jobTitle.toLowerCase().includes(searchVal))   ||
            (job.company     && job.company.toLowerCase().includes(searchVal))    ||
            (job.location    && job.location.toLowerCase().includes(searchVal))   ||
            (job.description && job.description.toLowerCase().includes(searchVal))
        );
    }

    // Sort latest first by default
    filtered.sort((a, b) => parseCustomDate(b.postedDate) - parseCustomDate(a.postedDate));

    renderJobsGrid(filtered);
}

function renderJobsGrid(jobs) {
    if (!jobsContainer) return;

    if (jobs.length === 0) {
        jobsContainer.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:50px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);">
                <span style="font-size:36px;display:block;margin-bottom:10px;">🔍</span>
                <p style="margin:0;font-size:15px;font-weight:600;color:var(--text);">No jobs match your search.</p>
            </div>
        `;
        return;
    }

    jobsContainer.innerHTML = jobs.map(job => `
        <article class="jobcard glass-panel">
            <div class="jobcard-header">
                <div>
                    <span class="jobcard-company">${job.company}</span>
                    <h2 class="jobcard-title">${job.jobTitle}</h2>
                </div>
            </div>

            <div class="jobcard-details">
                <div class="jobcard-detail-item"><span>📍</span><span>${job.location}</span></div>
                <div class="jobcard-detail-item"><span>💰</span><span>₹${formatSalaryDisplay(job.salary)}</span></div>
                <div class="jobcard-detail-item"><span>📅</span><span>${job.postedDate || "Recently"}</span></div>
            </div>

            <p class="jobcard-description">${job.description}</p>

            <div class="jobcard-actions">
                <button class="submit-btn" style="padding:10px 20px;font-size:14px;"
                    onclick="triggerApplyConfirm('${job.id}')">
                    Apply Now 🚀
                </button>
            </div>
        </article>
    `).join("");
}

// Modal apply flow
let activeApplyJobId = null;
function triggerApplyConfirm(jobId) {
    if (!currentUserSession) {
        showNotification("Please login first to apply!", "warning");
        return;
    }
    activeApplyJobId = jobId;
    const job   = allJobs.find(j => String(j.id) === String(jobId));
    if (!job) return;

    const modal = document.getElementById("confirmModal");
    const title = document.getElementById("modalTitle");
    const msg   = document.getElementById("modalMsg");

    if (modal && title && msg) {
        title.textContent = `Apply for ${job.jobTitle}`;
        msg.innerHTML = `You are about to apply to <strong>${job.company}</strong> in <strong>${job.location}</strong>.<br>Confirm submission?`;
        modal.style.display = "flex";
    }
}

async function processJobApply(jobId) {
    try {
        const job = allJobs.find(j => String(j.id) === String(jobId));
        if (!job) { showNotification("Job not found.", "danger"); return; }

        const applications   = await getApplications();
        const alreadyApplied = applications.find(
            app => String(app.userId) === String(currentUserSession.id) &&
                   String(app.jobId)  === String(jobId)
        );

        if (alreadyApplied) {
            showNotification(`Already applied for ${job.jobTitle} at ${job.company}!`, "warning");
            return;
        }

        await addApplication({
            userId:      currentUserSession.id,
            jobId:       job.id,
            company:     job.company,
            jobTitle:    job.jobTitle,
            status:      "Applied",
            appliedDate: new Date().toLocaleDateString("en-GB")
        });

        showNotification(`Application submitted to ${job.company}! 🚀`, "success");

    } catch (error) {
        console.error("Apply error:", error);
        showNotification("Apply failed. Check backend.", "danger");
    }
}

// Utilities
function parseCustomDate(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split("/");
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    const t = Date.parse(dateStr);
    return isNaN(t) ? 0 : t;
}

function parseNumericalSalary(val) {
    if (!val) return 0;
    const n = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? 0 : n;
}

function formatSalaryDisplay(val) {
    if (!val) return "Negotiable";
    const num = parseNumericalSalary(val);
    return num >= 100000 ? (num / 100000).toFixed(1) + " Lakhs" : num.toLocaleString();
}
