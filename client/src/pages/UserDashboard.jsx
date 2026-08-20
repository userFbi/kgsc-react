import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import { api } from "../lib/api.js";

const API_URL = "http://localhost:5050/api/auth";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);

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

  function getYearsWithClub() {
    if (!user) return "—";

    if (user.yearsWithClub != null) {
      return user.yearsWithClub;
    }

    if (user.memberSince) {
      return Math.max(0, new Date().getFullYear() - Number(user.memberSince));
    }

    return "—";
  }

  function handleViewMembership() {
    document.querySelector(".ud-membership-card")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
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
      <div className="ud-field-lines" />

      <main className="ud-wrap">
        {/* Header */}
        <header className="ud-dash-header">
          <button
            className="ud-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list" />
          </button>

          <div className="ud-eyebrow">
            <span className="ud-eyebrow-dot" />
            MEMBER DASHBOARD
          </div>

          <h1>
            Welcome back, <span>{getFirstName(user.fullName)}</span>
          </h1>

          <p className="ud-lede">Here's your membership at a glance.</p>
        </header>

        {/* Membership Overview */}
        <section className="ud-membership-card">
          <h3 className="ud-section-title">Membership overview</h3>

          <div className="ud-membership-grid">
            {/* Membership ID */}
            <div className="ud-membership-stat">
              <div className="ud-membership-icon">
                <i className="bi bi-person-vcard-fill" />
              </div>

              <div className="ud-membership-label">Membership ID</div>

              <div className="ud-membership-value">
                {user.membershipId || "Pending"}
              </div>
            </div>

            {/* Insurance */}
            <div className="ud-membership-stat">
              <div className="ud-membership-icon">
                <i className="bi bi-shield-check" />
              </div>

              <div className="ud-membership-label">Insurance</div>

              <div className="ud-membership-value">
                {user.isInsured === true ||
                user.insured === true ||
                user.insurance?.insured === true
                  ? "Active"
                  : "Not Insured"}
              </div>
            </div>

            {/* Member Since */}
            <div className="ud-membership-stat">
              <div className="ud-membership-icon">
                <i className="bi bi-calendar3" />
              </div>

              <div className="ud-membership-label">Member Since</div>

              <div className="ud-membership-value">
                {user.memberSince || "—"}
              </div>
            </div>

            {/* Years With Club */}
            <div className="ud-membership-stat">
              <div className="ud-membership-icon">
                <i className="bi bi-people-fill" />
              </div>

              <div className="ud-membership-label">Years With Club</div>

              <div className="ud-membership-value">
                {user.yearsWithClub != null
                  ? `${user.yearsWithClub} Years`
                  : user.memberSince
                    ? `${Math.max(
                        0,
                        new Date().getFullYear() - Number(user.memberSince),
                      )} Years`
                    : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="ud-section-card">
          <h3 className="ud-section-title">Club announcements</h3>

          <div className="ud-announce-list">
            {messages.length === 0 ? (
              <div className="ud-empty-state">No announcements yet.</div>
            ) : (
              messages.map((m) => (
                <div className="ud-announce-item" key={m._id}>
                  <div className="ud-announce-dot" />

                  <div className="ud-announce-content">
                    <p className="ud-announce-title">
                      {m.title || "Announcement"}
                    </p>

                    <p className="ud-announce-text">
                      {m.message || m.body || m.text || ""}
                    </p>

                    <span className="ud-announce-date">
                      {formatDate(m.createdAt || m.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="ud-section-card ud-quick-actions">
          <div className="ud-quick-actions-header">
            <div>
              <h3 className="ud-section-title">Quick actions</h3>
              <p className="ud-section-subtitle">
                Manage your membership and stay connected
              </p>
            </div>
          </div>

          <div className="ud-actions-grid">
            {/* Edit Profile */}
            <Link to="/profile" className="ud-action-card">
              <span className="ud-action-icon profile">
                <i className="bi bi-person-lines-fill" />
              </span>

              <span className="ud-action-content">
                <span className="ud-action-title">Edit Profile</span>
                <span className="ud-action-description">
                  Update your personal details
                </span>
              </span>

              <i className="bi bi-chevron-right ud-action-arrow" />
            </Link>

            {/* WhatsApp */}
            <a
              className="ud-action-card"
              href="https://wa.me/9725720612"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ud-action-icon whatsapp">
                <i className="bi bi-whatsapp" />
              </span>

              <span className="ud-action-content">
                <span className="ud-action-title">WhatsApp Group</span>
                <span className="ud-action-description">
                  Join our club community
                </span>
              </span>

              <i className="bi bi-box-arrow-up-right ud-action-arrow" />
            </a>

            {/* Contact Admin */}
            <button
              className="ud-action-card"
              onClick={handleViewMembership}
              type="button"
            >
              <span className="ud-action-icon contact">
                <i className="bi bi-headset" />
              </span>

              <span className="ud-action-content">
                <span className="ud-action-title">Contact Admin</span>
                <span className="ud-action-description">
                  Get help from club admin
                </span>
              </span>

              <i className="bi bi-chevron-right ud-action-arrow" />
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
    </div>
  );
}
