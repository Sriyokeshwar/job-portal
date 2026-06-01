// applications.js - Application Status Tracker

const applicationsContainer = document.getElementById("applicationsContainer");
const applicationSearch = document.getElementById("applicationSearch");
const filterStatus = document.getElementById("filterStatus");

let allApplications = [];
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "./login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadApplicationsPage();

    if (applicationSearch) {
        applicationSearch.addEventListener("input", filterAndRenderApplications);
    }
    if (filterStatus) {
        filterStatus.addEventListener("change", filterAndRenderApplications);
    }
});

async function loadApplicationsPage() {
    renderLoadingSkeletons();
    try {
        const apps = await getApplications();
        allApplications = apps.filter(
            app => String(app.userId) === String(currentUser.id)
        );
        filterAndRenderApplications();
    } catch (error) {
        console.error("Applications loading failed:", error);
        applicationsContainer.innerHTML = `<p style="padding:20px; color: var(--danger);">Failed to load applications. Check backend connection.</p>`;
    }
}

function renderLoadingSkeletons() {
    if (!applicationsContainer) return;
    applicationsContainer.innerHTML = `
        <div class="skeleton" style="height: 160px; border-radius: var(--radius-lg); margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 160px; border-radius: var(--radius-lg);"></div>
    `;
}

function filterAndRenderApplications() {
    if (!applicationsContainer) return;
    let filtered = [...allApplications];

    const searchVal = applicationSearch ? applicationSearch.value.toLowerCase().trim() : "";
    if (searchVal) {
        filtered = filtered.filter(app =>
            (app.jobTitle && app.jobTitle.toLowerCase().includes(searchVal)) ||
            (app.company && app.company.toLowerCase().includes(searchVal))
        );
    }

    const selectedStatus = filterStatus ? filterStatus.value : "all";
    if (selectedStatus !== "all") {
        filtered = filtered.filter(app => app.status === selectedStatus);
    }

    renderApplicationsGrid(filtered);
}

async function updateAppStatus(appId, newStatus) {
    const app = allApplications.find(a => String(a.id) === String(appId));
    if (!app) return;

    const updated = { ...app, status: newStatus };

    try {
        await updateApplication(appId, updated);
        // Update in-memory
        const idx = allApplications.findIndex(a => String(a.id) === String(appId));
        if (idx !== -1) allApplications[idx] = updated;
        filterAndRenderApplications();
        showNotification(`Status updated to "${newStatus}"`, "success");
    } catch (e) {
        showNotification("Failed to update status.", "danger");
    }
}

const STATUS_CONFIG = {
    "Applied":   { badge: "badge-primary",   emoji: "📝" },
    "Interview": { badge: "badge-secondary",  emoji: "🗣️" },
    "Selected":  { badge: "badge-success",    emoji: "🎉" },
    "Rejected":  { badge: "badge-danger",     emoji: "❌" }
};

function renderApplicationsGrid(applications) {
    if (applications.length === 0) {
        const msg = allApplications.length === 0
            ? "No job applications found yet. Browse available jobs and apply!"
            : "No applications match your filters.";
        applicationsContainer.innerHTML = `
            <div style="text-align:center; padding:50px 20px; background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg);">
                <span style="font-size:36px; display:block; margin-bottom:10px;">📋</span>
                <p style="margin:0; font-size:15px; font-weight:600; color:var(--text);">${msg}</p>
            </div>
        `;
        return;
    }

    applicationsContainer.innerHTML = applications.map(app => {
        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Applied"];

        const step1 = "active";
        const step2 = (app.status === "Interview" || app.status === "Selected" || app.status === "Rejected") ? "active" : "";
        const step3 = (app.status === "Selected" || app.status === "Rejected") ? "active" : "";
        let finalLabel = "Decision";
        if (app.status === "Selected") finalLabel = "Selected 🎉";
        else if (app.status === "Rejected") finalLabel = "Rejected ❌";

        const statusOptions = ["Applied", "Interview", "Selected", "Rejected"];

        return `
            <article class="overview-card" style="margin-bottom:16px; border:1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
                    <div>
                        <span style="font-size:12px; color:var(--primary); font-weight:600; text-transform:uppercase;">${app.company}</span>
                        <h3 style="margin:4px 0 0; font-size:18px; font-weight:700; color:var(--text);">${app.jobTitle}</h3>
                        <p style="margin:4px 0 0; font-size:12px; color:var(--text-secondary);">Applied: ${app.appliedDate || "Recently"}</p>
                    </div>
                    <span class="badge ${cfg.badge}" style="padding:5px 12px; font-size:12px;">
                        ${cfg.emoji} ${app.status}
                    </span>
                </div>

                <div class="timeline-tracker" style="margin-bottom:16px;">
                    <div class="timeline-step ${step1}">
                        <div class="timeline-node">✓</div>
                        <span class="timeline-label">Applied</span>
                    </div>
                    <div class="timeline-step ${step2}">
                        <div class="timeline-node">${step2 ? "✓" : "2"}</div>
                        <span class="timeline-label">Interview</span>
                    </div>
                    <div class="timeline-step ${step3}">
                        <div class="timeline-node">${step3 ? (app.status === "Selected" ? "✓" : "✗") : "3"}</div>
                        <span class="timeline-label">${finalLabel}</span>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <label style="font-size:12px; color:var(--text-secondary); font-weight:500;">Update Status:</label>
                    <select onchange="updateAppStatus('${app.id}', this.value)"
                            style="padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--background); color:var(--text); font-size:13px; cursor:pointer;">
                        ${statusOptions.map(s => `<option value="${s}" ${app.status === s ? "selected" : ""}>${s}</option>`).join("")}
                    </select>
                </div>
            </article>
        `;
    }).join("");
}
