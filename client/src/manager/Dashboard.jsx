import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Chart from "chart.js/auto";
import "./Manager.css";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getYearsRunning() {
  const founded = new Date(1988, 2, 16); // month is 0-indexed, so 2 = March
  const now = new Date();
  let years = now.getFullYear() - founded.getFullYear();
  const hasHadAnniversaryThisYear =
    now.getMonth() > founded.getMonth() ||
    (now.getMonth() === founded.getMonth() &&
      now.getDate() >= founded.getDate());
  if (!hasHadAnniversaryThisYear) years--;
  return years;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newThisMonth: 0,
    existingMembers: 0,
    insuredCount: 0,
    recentMembers: [],
  });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    api
      .get("/api/manager/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load dashboard:", err.message));
  }, []);

  // ---- Pie chart: New vs Existing members ----
  useEffect(() => {
    if (!chartRef.current || stats.totalMembers === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: ["New this month", "Existing members"],
        datasets: [
          {
            data: [stats.newThisMonth, stats.existingMembers],
            backgroundColor: ["#e08a1e", "#2d4a2f"], // marigold + forest, matches KGSC theme
            borderColor: "#fdfaf3", // cream
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { family: "Inter, sans-serif", size: 12 },
              color: "#11120d",
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = stats.newThisMonth + stats.existingMembers;
                const pct = total ? Math.round((ctx.raw / total) * 100) : 0;
                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [stats]);

  return (
    <>
      <div className="manager-page-head">
        <span className="eyebrow">Manager portal</span>
        <h1>Welcome back</h1>
        <p>Here's what's happening with KGSC membership right now.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-num">{stats.totalMembers}</div>
          <div className="stat-label">Total members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div className="stat-num">{stats.newThisMonth}</div>
          <div className="stat-label">New this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="stat-num">{stats.insuredCount}</div>
          <div className="stat-label">Insured members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-event-fill"></i>
          </div>
          <div className="stat-num">{getYearsRunning() + 1}</div>
          <div className="stat-label">Years running</div>
        </div>
      </div>

      {/* ============ NEW VS EXISTING PIE CHART ============ */}
      <div className="dash-grid">
        <div className="dash-panel dash-chart-panel">
          <h2 className="dash-panel-title">
            <i className="bi bi-pie-chart-fill"></i> New vs Existing Members
          </h2>
          {stats.totalMembers === 0 ? (
            <p className="member-empty">Add members to see this breakdown.</p>
          ) : (
            <div className="dash-chart-wrap dash-chart-wrap-pie">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
        </div>

        <div className="dash-panel">
          <h2 className="dash-panel-title">
            <i className="bi bi-bar-chart-fill"></i> Quick Breakdown
          </h2>
          <div className="recent-list">
            <div className="recent-row">
              <span className="recent-name">New members this month </span>
              <span className="member-id">
                <b>{stats.newThisMonth}</b>
              </span>
            </div>
            <div className="recent-row">
              <span className="recent-name">Existing members</span>
              <span className="member-id">
                <b>{stats.existingMembers}</b>
              </span>
            </div>
            <div className="recent-row">
              <span className="recent-name">Total Members</span>
              <span className="member-id">
                <b>{stats.totalMembers}</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="manager-panel">
        <div className="manager-panel-head">
          <h2>Recently added members</h2>
          <Link className="btn btn-outline" to="/manager/members">
            View all
          </Link>
        </div>

        {stats.recentMembers.length === 0 ? (
          <p className="member-empty">No members yet — add your first one.</p>
        ) : (
          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentMembers.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="member-name">{m.name}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td>{formatDate(m.joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <Link className="btn btn-primary" to="/manager/add-member">
            <i className="bi bi-person-plus-fill"></i> Add a member
          </Link>
        </div>
      </div>
    </>
  );
}
