import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { subscribeToPush } from "../lib/pushNotifications.js";
import { api } from "../lib/api.js";
import "./UserDashboard.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showNotifyBanner, setShowNotifyBanner] = useState(false);

  useEffect(() => {
    const supported = "Notification" in window;
    if (supported && Notification.permission === "default") {
      setShowNotifyBanner(true);
    }
  }, []);

  async function handleEnableNotifications() {
    const success = await subscribeToPush();
    if (success) {
      setShowNotifyBanner(false);
    }
  }

  useEffect(() => {
    api
      .get("/api/messages")
      .then((res) => setMessages(res.data?.messages || res.data || []))
      .catch((err) => console.error("Failed to load messages:", err.message));
  }, []);

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    if (!dateStr) return "";

    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getFirstName(name) {
    return name?.trim()?.split(" ")[0] || "Member";
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function getYearsWithClub() {
    if (!user?.createdAt) return 1;
    const joined = new Date(user.createdAt);
    const now = new Date();
    let years = now.getFullYear() - joined.getFullYear();
    const hasHadAnniversary =
      now.getMonth() > joined.getMonth() ||
      (now.getMonth() === joined.getMonth() &&
        now.getDate() >= joined.getDate());
    if (!hasHadAnniversary) years -= 1;
    return Math.max(1, years + 1);
  }

  function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  function getYearsWithClubLabel() {
    const years = getYearsWithClub();
    return `${years}${getOrdinalSuffix(years)}`;
  }

  function getJoiningDateLabel() {
    if (!user?.createdAt) return "—";
    return new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="ud-page">
        <div className="ud-loading">
          <span className="ud-spinner-lg" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isInsured =
    user.insured === true ||
    user.isInsured === true ||
    user.insurance?.insured === true;

  return (
    <div className="ud-page">
      <main className="ud-wrap">
        {/* Header */}
        <header className="ud-dash-header">
          <button
            className="ud-icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list" />
          </button>

          <button
            className="ud-icon-btn"
            onClick={handleEnableNotifications}
            aria-label="Notifications"
          >
            <i className="bi bi-bell" />
          </button>
        </header>

        <p className="ud-greeting-eyebrow">{getGreeting()}</p>
        <h1 className="ud-greeting-name">{getFirstName(user.fullName)}</h1>

        {/* Membership Card */}
        <section className="ud-id-card">
          <p className="ud-id-label">Membership ID</p>
          <p className="ud-id-value">{user.membershipId || "Pending"}</p>

          <div className="ud-id-stats">
            <div className="ud-id-stat">
              <p className="ud-id-stat-value">{getYearsWithClubLabel()}</p>
              <p className="ud-id-stat-label">year</p>
            </div>
            <div className="ud-id-stat">
              <p className="ud-id-stat-value">
                {isInsured ? "Active" : "None"}
              </p>
              <p className="ud-id-stat-label">insurance</p>
            </div>
            <div className="ud-id-stat">
              <p className="ud-id-stat-value">{getJoiningDateLabel()}</p>
              <p className="ud-id-stat-label">joined</p>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="ud-section">
          <p className="ud-section-label">Announcements</p>

          {messages.length === 0 ? (
            <p className="ud-empty-state">No announcements yet.</p>
          ) : (
            messages.map((m) => (
              <div className="ud-announce-item" key={m._id}>
                <p className="ud-announce-title">{m.title || "Announcement"}</p>
                <p className="ud-announce-text">
                  {m.message || m.body || m.text || ""}
                </p>
                <span className="ud-announce-date">
                  {formatDate(m.createdAt || m.date)}
                </span>
              </div>
            ))
          )}
        </section>

        {/* Quick Actions */}
        <section className="ud-section">
          <p className="ud-section-label">Quick actions</p>

          <div className="ud-actions-grid">
            <Link to="/profile" className="ud-action">
              <span className="ud-action-icon ud-action-icon-primary">
                <i className="bi bi-person-fill" />
              </span>
              <span className="ud-action-label">Edit profile</span>
            </Link>

            <a
              className="ud-action"
              href="https://wa.me/9725720612"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ud-action-icon ud-action-icon-whatsapp">
                <i className="bi bi-whatsapp" />
              </span>
              <span className="ud-action-label">WhatsApp</span>
            </a>

            <a
              className="ud-action"
              href="https://wa.me/9725720612"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ud-action-icon">
                <i className="bi bi-headset" />
              </span>
              <span className="ud-action-label">Contact admin</span>
            </a>

            <button
              className="ud-action"
              type="button"
              onClick={handleEnableNotifications}
            >
              <span className="ud-action-icon">
                <i className="bi bi-bell-fill" />
              </span>
              <span className="ud-action-label">Notifications</span>
            </button>
          </div>
        </section>

        <footer className="ud-footer">
          KAMLABA GARDEN SPORT CLUB — EST. 1988
        </footer>
      </main>

      {/* Overlay */}
      {menuOpen && (
        <div className="ud-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Drawer */}
      <aside className={`ud-drawer ${menuOpen ? "is-open" : ""}`}>
        <button
          className="ud-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="ud-drawer-profile">
          {user.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={user.fullName}
              className="ud-drawer-photo"
            />
          ) : (
            <div className="ud-drawer-photo ud-drawer-initial">
              {user.fullName?.charAt(0)?.toUpperCase() || "M"}
            </div>
          )}

          <p className="ud-drawer-name">{user.fullName}</p>

          <div className="ud-status-row">
            <span
              className={`ud-status-dot ${
                user.isProfileComplete ? "is-active" : "is-pending"
              }`}
            />
            <span>
              {user.isProfileComplete
                ? "Active member"
                : "Complete your profile"}
            </span>
          </div>
        </div>

        <div className="ud-drawer-section">
          <p className="ud-drawer-list-label">Profile</p>

          <div className="ud-drawer-list">
            <Link
              to="/profile"
              className="ud-drawer-list-row"
              onClick={() => setMenuOpen(false)}
            >
              <span className="ud-drawer-list-icon">
                <i className="bi bi-person-lines-fill" />
              </span>

              <span className="ud-drawer-list-text">
                <span>Personal details</span>
                <span className="ud-drawer-list-sub">
                  {user.isProfileComplete
                    ? user.email || "Profile details"
                    : "Add Aadhar, photo & address"}
                </span>
              </span>

              {!user.isProfileComplete && <span className="ud-badge-dot" />}

              <i className="bi bi-chevron-right ud-chevron" />
            </Link>
          </div>
        </div>

        <div className="ud-drawer-section">
          <p className="ud-drawer-list-label">Need help?</p>

          <div className="ud-drawer-list">
            <a
              href="https://wa.me/9725720612"
              target="_blank"
              rel="noopener noreferrer"
              className="ud-drawer-list-row"
            >
              <span className="ud-drawer-list-icon">
                <i className="bi bi-headset" />
              </span>

              <span className="ud-drawer-list-text">
                <span>Contact admin</span>
              </span>

              <i className="bi bi-chevron-right ud-chevron" />
            </a>
          </div>
        </div>

        <button className="ud-drawer-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          Log out
        </button>
      </aside>

      {/* Notification Permission Modal — mandatory, no dismiss */}
      {showNotifyBanner && (
        <>
          <div className="ud-notify-overlay"></div>
          <div className="ud-notify-modal" role="dialog" aria-modal="true">
            <div className="ud-notify-modal-icon">
              <i className="bi bi-bell-fill" />
            </div>

            <h3 className="ud-notify-modal-title">Stay in the loop</h3>
            <p className="ud-notify-modal-text">
              Turn on notifications to get instant alerts whenever the club
              posts a new announcement — even when you're not on the site.
            </p>

            <div className="ud-notify-modal-actions">
              <button
                className="ud-notify-modal-btn"
                onClick={handleEnableNotifications}
              >
                Enable notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
