import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const API_URL = "http://localhost:5050/api/auth";

// TODO: replace with a real GET /api/notices endpoint once the admin/manager
// message-posting backend exists. Kept as mock data for now.
const MOCK_MESSAGES = [
  {
    _id: "1",
    date: "2026-08-01",
    title: "Annual Sports Meet",
    message: "Registrations open for the annual sports meet. Last date to register is 15th August.",
    senderName: "Tushar",
    senderRole: "Admin",
  },
  {
    _id: "2",
    date: "2026-07-20",
    title: "Maintenance Notice",
    message: "The swimming pool will be closed for maintenance from 22nd to 25th July.",
    senderName: "Manager",
    senderRole: "Manager",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages] = useState(MOCK_MESSAGES);

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function maskAadhar(num) {
    if (!num) return null;
    return `XXXX XXXX ${num.slice(-4)}`;
  }

  if (loading) {
    return (
      <div className="ud-page">
        <div className="ud-loading">
          <span className="ud-spinner-lg"></span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="ud-page">
      <div className="ud-wrap">
        <div className="ud-topbar">
          <button className="ud-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <i className="bi bi-list"></i>
            <span>Menu</span>
          </button>
        </div>


        {/* KGSC ID card */}
        <div className="ud-idcard">
          <div className="ud-idcard-rings" aria-hidden="true">
            <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
              <circle cx="360" cy="20" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <circle cx="360" cy="20" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="ud-idcard-top">
            <span className="ud-idcard-brand">KGSC · SINCE 1988</span>
            <span className={`ud-idcard-status ${user.isApproved ? "is-active" : "is-pending"}`}>
              {user.isApproved ? "Active" : "Pending"}
            </span>
          </div>
          <div className="ud-idcard-body">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={user.fullName} className="ud-idcard-photo" />
            ) : (
              <div className="ud-idcard-photo ud-photo-placeholder">
                <i className="bi bi-person-fill"></i>
              </div>
            )}
            <div className="ud-idcard-info">
              <p className="ud-idcard-name">{user.fullName}</p>
              <p className="ud-idcard-id">{user.membershipId || "KGSC-ID pending"}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="ud-messages">
          <p className="ud-list-label">Messages</p>
          {messages.length === 0 ? (
            <div className="ud-empty">
              <i className="bi bi-inbox"></i>
              <p>No messages from admin yet.</p>
            </div>
          ) : (
            <ul className="ud-notices-list">
              {messages.map((m) => (
                <li key={m._id} className="ud-notice-item">
                  <div className="ud-notice-accent"></div>
                  <div className="ud-notice-body-wrap">
                    <div className="ud-notice-head">
                      <p className="ud-notice-title">{m.title}</p>
                      <span className="ud-notice-date">{formatDate(m.date)}</span>
                    </div>
                    <p className="ud-notice-body">{m.message}</p>
                    <span className="ud-notice-sender">— {m.senderName} ({m.senderRole})</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Menu drawer */}
      {menuOpen && <div className="ud-overlay" onClick={() => setMenuOpen(false)}></div>}

      <aside className={`ud-drawer${menuOpen ? " is-open" : ""}`}>
        <button className="ud-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="ud-drawer-profile">
          {user.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt={user.fullName} className="ud-drawer-photo" />
          ) : (
            <div className="ud-drawer-photo ud-photo-placeholder">
              <i className="bi bi-person-fill"></i>
            </div>
          )}
          <p className="ud-drawer-name">{user.fullName}</p>
          <div className="ud-status-row">
            <span className={`ud-status-dot ${user.isApproved ? "is-active" : "is-pending"}`}></span>
            <span>{user.isApproved ? "Active member" : "Pending approval"}</span>
          </div>
        </div>

        <div className="ud-drawer-section">
          <p className="ud-list-label">Profile</p>
          <div className="ud-list">
            <Link to="/profile" className="ud-list-row">
              <span className="ud-list-icon"><i className="bi bi-person-lines-fill"></i></span>
              <span className="ud-list-text">
                <span>Personal details</span>
                <span className="ud-list-sub">
                  {user.isProfileComplete ? user.email : "Add Aadhar, photo & address"}
                </span>
              </span>
              {!user.isProfileComplete && <span className="ud-badge-dot"></span>}
              <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
        </div>

        <div className="ud-drawer-section">
          <p className="ud-list-label">Need help?</p>
          <div className="ud-list">
            <a href="http://localhost:5173/contact" className="ud-list-row">
              <span className="ud-list-icon"><i className="bi bi-headset"></i></span>
              <span className="ud-list-text"><span>Contact admin</span></span>
              <i className="bi bi-chevron-right"></i>
            </a>
          </div>
        </div>

        <button className="ud-drawer-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log out
        </button>
      </aside>
    </div>
  );
}