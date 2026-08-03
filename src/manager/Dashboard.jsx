import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadMembers } from "../data/membersStore.js";
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

export default function Dashboard() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setMembers(loadMembers());
  }, []);

  const now = new Date();
  const newThisMonth = members.filter((m) => {
    const d = new Date(m.joined);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recent = [...members]
    .sort((a, b) => new Date(b.joined) - new Date(a.joined))
    .slice(0, 5);

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
          <div className="stat-num">{members.length}</div>
          <div className="stat-label">Total members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div className="stat-num">{newThisMonth}</div>
          <div className="stat-label">New this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-award-fill"></i>
          </div>
          <div className="stat-num">350+</div>
          <div className="stat-label">Club-wide members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-event-fill"></i>
          </div>
          <div className="stat-num">37+</div>
          <div className="stat-label">Years running</div>
        </div>
      </div>

      <div className="manager-panel">
        <div className="manager-panel-head">
          <h2>Recently added members</h2>
          <Link className="btn btn-outline" to="/manager/members">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
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
                {recent.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member-name">{m.name}</div>
                      <div className="member-id">{m.id}</div>
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
