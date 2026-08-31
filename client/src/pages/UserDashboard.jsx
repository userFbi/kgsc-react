import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { subscribeToPush } from "../lib/pushNotifications.js";
import { api } from "../lib/api.js";
import "./UserDashboard.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const PLACEHOLDER_EVENTS = [
  { date: "14", month: "SEP", title: "Ganpati setup", place: "Club grounds" },
  {
    date: "28",
    month: "SEP",
    title: "Annual sports meet",
    place: "Sports complex",
  },
  { date: "02", month: "OCT", title: "Club gathering", place: "Club grounds" },
  {
    date: "18",
    month: "OCT",
    title: "Diwali get-together",
    place: "Club hall",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showNotifyBanner, setShowNotifyBanner] = useState(false);
  const [activeView, setActiveView] = useState("home");

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

  function switchView(view) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function getClubYearsRunning() {
    const founding = new Date(1988, 2, 16);
    const now = new Date();
    let years = now.getFullYear() - founding.getFullYear();
    const hadAnniversary =
      now.getMonth() > founding.getMonth() ||
      (now.getMonth() === founding.getMonth() &&
        now.getDate() >= founding.getDate());
    if (!hadAnniversary) years -= 1;
    return years + 1;
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

  const latestMessage = messages[0];

  return (
    <div className="ud-page">
      <div className="ud-container">
        {/* Hero */}
        <header className="ud-hero">
          <div className="ud-topbar">
            <span className="ud-brand">KGSC · SINCE 1988</span>
            <button
              className="ud-icon-btn"
              onClick={handleEnableNotifications}
              aria-label="Notifications"
            >
              <i className="bi bi-bell" />
            </button>
          </div>

          <div className="ud-hero-copy">
            <p className="ud-kicker">{getGreeting()}</p>
            <h1 className="ud-hero-title">
              Welcome back,
              <br />
              {getFirstName(user.fullName)}.
            </h1>
          </div>
        </header>

        <main className="ud-main">
          {/* HOME */}
          {activeView === "home" && (
            <section className="ud-view">
              <div className="ud-section-head">
                <p className="ud-section-title">Next on the calendar</p>
                <button
                  className="ud-view-all"
                  onClick={() => switchView("events")}
                >
                  VIEW ALL →
                </button>
              </div>

              <article className="ud-feature">
                <span className="ud-feature-label">
                  UPCOMING · {PLACEHOLDER_EVENTS[0].date}{" "}
                  {PLACEHOLDER_EVENTS[0].month}
                </span>
                <div className="ud-feature-date">
                  {PLACEHOLDER_EVENTS[0].date}{" "}
                  <span>{PLACEHOLDER_EVENTS[0].month}</span>
                </div>
                <h3>{PLACEHOLDER_EVENTS[0].title}</h3>
                <div className="ud-feature-location">
                  <i className="bi bi-geo-alt" /> {PLACEHOLDER_EVENTS[0].place}
                </div>
              </article>

              <div className="ud-secondary">
                {PLACEHOLDER_EVENTS.slice(1, 3).map((ev, i) => (
                  <article
                    key={ev.title}
                    className={`ud-event-mini ${i === 1 ? "dark" : ""}`}
                  >
                    <div className="ud-mini-date">
                      {ev.date} <span>{ev.month}</span>
                    </div>
                    <span className="ud-mini-tag">{ev.title}</span>
                    <span className="ud-mini-place">{ev.place}</span>
                  </article>
                ))}
              </div>

              <div className="ud-section-head">
                <p className="ud-section-title">Latest announcement</p>
              </div>

              {latestMessage ? (
                <article className="ud-announcement">
                  <div className="ud-announcement-icon">
                    <i className="bi bi-megaphone" />
                  </div>
                  <div>
                    <h3>{latestMessage.title || "Announcement"}</h3>
                    <p>{latestMessage.message || latestMessage.body || ""}</p>
                    <span className="ud-time">
                      {formatDate(
                        latestMessage.createdAt || latestMessage.date,
                      )}
                    </span>
                  </div>
                </article>
              ) : (
                <p className="ud-empty-state">No announcements yet.</p>
              )}

              <div className="ud-footer">
                KAMLABA GARDEN SPORT CLUB · EST. 1988
              </div>
            </section>
          )}

          {/* EVENTS */}
          {activeView === "events" && (
            <section className="ud-view">
              <div className="ud-section-head">
                <p className="ud-section-title">All upcoming events</p>
              </div>

              <article className="ud-feature">
                <span className="ud-feature-label">
                  UPCOMING · {PLACEHOLDER_EVENTS[0].date}{" "}
                  {PLACEHOLDER_EVENTS[0].month}
                </span>
                <div className="ud-feature-date">
                  {PLACEHOLDER_EVENTS[0].date}{" "}
                  <span>{PLACEHOLDER_EVENTS[0].month}</span>
                </div>
                <h3>{PLACEHOLDER_EVENTS[0].title}</h3>
                <div className="ud-feature-location">
                  <i className="bi bi-geo-alt" /> {PLACEHOLDER_EVENTS[0].place}
                </div>
              </article>

              <div className="ud-secondary">
                {PLACEHOLDER_EVENTS.slice(1).map((ev, i) => (
                  <article
                    key={ev.title}
                    className={`ud-event-mini ${i % 2 === 0 ? "dark" : ""}`}
                  >
                    <div className="ud-mini-date">
                      {ev.date} <span>{ev.month}</span>
                    </div>
                    <span className="ud-mini-tag">{ev.title}</span>
                    <span className="ud-mini-place">{ev.place}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* COMMUNITY */}
          {activeView === "community" && (
            <section className="ud-view">
              <div className="ud-section-head">
                <p className="ud-section-title">Club community</p>
              </div>

              <div className="ud-community-stats">
                <div className="ud-stat-card">
                  <div className="ud-stat-num">350+</div>
                  <div className="ud-stat-label">Members</div>
                </div>
                <div className="ud-stat-card">
                  <div className="ud-stat-num">{getClubYearsRunning()}</div>
                  <div className="ud-stat-label">Years running</div>
                </div>
              </div>

              <a
                className="ud-whatsapp-cta"
                href="https://wa.me/9725720612"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ud-whatsapp-icon">
                  <i className="bi bi-whatsapp" />
                </span>
                <div>
                  <h4>Join the WhatsApp group</h4>
                  <p>Stay connected with club updates</p>
                </div>
              </a>

              <div className="ud-section-head">
                <p className="ud-section-title">Recent announcements</p>
              </div>

              {messages.length === 0 ? (
                <p className="ud-empty-state">No announcements yet.</p>
              ) : (
                messages.map((m) => (
                  <article className="ud-announcement" key={m._id}>
                    <div className="ud-announcement-icon">
                      <i className="bi bi-megaphone" />
                    </div>
                    <div>
                      <h3>{m.title || "Announcement"}</h3>
                      <p>{m.message || m.body || m.text || ""}</p>
                      <span className="ud-time">
                        {formatDate(m.createdAt || m.date)}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {/* PROFILE */}
          {activeView === "profile" && (
            <section className="ud-view">
              <div className="ud-section-head">
                <p className="ud-section-title">Your membership</p>
              </div>

              <div className="ud-id-card">
                <p className="ud-id-label">Membership ID</p>
                <p className="ud-id-value">{user.membershipId || "Pending"}</p>

                <div className="ud-id-row">
                  <div className="ud-id-stat">
                    <b>{getYearsWithClubLabel()}</b>
                    <span>year</span>
                  </div>
                  <div className="ud-id-stat">
                    <b>{isInsured ? "Active" : "None"}</b>
                    <span>insurance</span>
                  </div>
                  <div className="ud-id-stat">
                    <b>{getJoiningDateLabel()}</b>
                    <span>member since</span>
                  </div>
                </div>
              </div>

              <div className="ud-profile-actions">
                <Link to="/profile" className="ud-profile-row">
                  <i className="bi bi-person-lines-fill" />
                  <span>Edit profile</span>
                  <i className="bi bi-chevron-right" />
                </Link>

                <a
                  href="https://wa.me/9725720612"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ud-profile-row"
                >
                  <i className="bi bi-headset" />
                  <span>Contact admin</span>
                  <i className="bi bi-chevron-right" />
                </a>

                <button
                  className="ud-profile-row danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" />
                  <span>Log out</span>
                </button>
              </div>
            </section>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="ud-nav">
          <button
            className={`ud-nav-btn ${activeView === "home" ? "is-active" : ""}`}
            onClick={() => switchView("home")}
          >
            <i className="bi bi-house" />
            Home
          </button>
          <button
            className={`ud-nav-btn ${activeView === "events" ? "is-active" : ""}`}
            onClick={() => switchView("events")}
          >
            <i className="bi bi-calendar-event" />
            Events
          </button>
          <button
            className={`ud-nav-btn ${activeView === "community" ? "is-active" : ""}`}
            onClick={() => switchView("community")}
          >
            <i className="bi bi-people" />
            Community
          </button>
          <button
            className={`ud-nav-btn ${activeView === "profile" ? "is-active" : ""}`}
            onClick={() => switchView("profile")}
          >
            <i className="bi bi-person" />
            Profile
          </button>
        </nav>
      </div>

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
