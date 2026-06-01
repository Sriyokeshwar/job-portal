// dashboard.js - Dashboard Analytics

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "./login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const userNameEl = document.getElementById("loggedUserName");
    if (userNameEl && currentUser) {
        userNameEl.textContent = currentUser.name;
    }
    loadDashboard();
});

async function loadDashboard() {
    showSkeletons();
    try {
        const [jobs, applications] = await Promise.all([getJobs(), getApplications()]);

        const userJobs = jobs.filter(
            job => String(job.userId) === String(currentUser.id)
        );
        const userApplications = applications.filter(
            app => String(app.userId) === String(currentUser.id)
        );

        updateStatsCards(userJobs, userApplications);
        renderRecentActivity(userJobs, userApplications);

    } catch (error) {
        console.error("Dashboard load error:", error);
        showNotification("Failed to load dashboard. Check server.", "danger");
    }
}

function showSkeletons() {
    const container = document.getElementById("activityContainer");
    if (container) {
        container.innerHTML = `
            <div class="skeleton" style="height:56px;width:100%;border-radius:var(--radius-md);"></div>
            <div class="skeleton" style="height:56px;width:100%;border-radius:var(--radius-md);margin-top:12px;"></div>
        `;
    }
}

function updateStatsCards(jobs, applications) {
    const applied    = applications.filter(a => a.status === "Applied").length;
    const interviews = applications.filter(a => a.status === "Interview").length;
    const selected   = applications.filter(a => a.status === "Selected").length;
    const rejected   = applications.filter(a => a.status === "Rejected").length;

    safeSetText("totalJobs",         jobs.length);
    safeSetText("totalApplications", applications.length);
    safeSetText("totalApplied",      applied);
    safeSetText("totalInterviews",   interviews);
    safeSetText("totalOffers",       selected);
    safeSetText("totalRejected",     rejected);
}

function renderRecentActivity(jobs, applications) {
    const container = document.getElementById("activityContainer");
    if (!container) return;

    const activities = [];

    jobs.forEach(job => {
        activities.push({
            title:     `Shared Job: ${job.jobTitle}`,
            subtitle:  `${job.company} · ₹${job.salary}`,
            date:      job.postedDate || "Recent",
            icon:      "📤",
            tag:       `<span class="badge badge-primary" style="font-size:11px;padding:2px 8px;">Shared</span>`,
            timestamp: parseCustomDate(job.postedDate)
        });
    });

    applications.forEach(app => {
        activities.push({
            title:     `Applied for ${app.jobTitle}`,
            subtitle:  `${app.company} · Status: ${app.status}`,
            date:      app.appliedDate || "Recent",
            icon:      "📋",
            tag:       `<span class="badge badge-success" style="font-size:11px;padding:2px 8px;">Applied</span>`,
            timestamp: parseCustomDate(app.appliedDate)
        });
    });

    activities.sort((a, b) => b.timestamp - a.timestamp);
    const latest = activities.slice(0, 5);

    if (latest.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--text-secondary);">
                <span style="font-size:30px;display:block;margin-bottom:8px;">⏳</span>
                <p style="margin:0;font-size:15px;font-weight:500;">No recent activity yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = latest.map(act => `
        <div style="display:flex;align-items:flex-start;gap:14px;padding:12px 16px;background:var(--background);border-radius:var(--radius-md);border:1px solid var(--border);">
            <div style="font-size:20px;width:38px;height:38px;background:var(--card);border:1px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${act.icon}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;">
                    <h4 style="margin:0;font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${act.title}</h4>
                    <span style="font-size:12px;color:var(--text-secondary);flex-shrink:0;">${act.date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
                    <p style="margin:0;font-size:12px;color:var(--text-secondary);">${act.subtitle}</p>
                    ${act.tag}
                </div>
            </div>
        </div>
    `).join("");
}

function safeSetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function parseCustomDate(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split("/");
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    const t = Date.parse(dateStr);
    return isNaN(t) ? 0 : t;
}
