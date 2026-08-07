import { useState, useRef } from "react";
import "./UserDashboard.css";

// Mock data for demo purposes
const MOCK_USER = {
  name: "Tushar Pawar",
  membershipId: "KGSC-U-001",
  joinDate: "2025-03-15",
  photoUrl: "/default-avatar.png",
};

const MOCK_NOTICES = [
  {
    _id: "1",
    date: "2026-08-01",
    title: "Annual Sports Meet",
    message: "Registrations open for the annual sports meet. Last date to register is 15th August.",
  },
  {
    _id: "2",
    date: "2026-07-20",
    title: "Maintenance Notice",
    message: "The swimming pool will be closed for maintenance from 22nd to 25th July.",
  },
];

export default function UserDashboard() {
  const [user, setUser] = useState(MOCK_USER);
  const [notices] = useState(MOCK_NOTICES);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: MOCK_USER.name });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setUser({ ...user, name: form.name, photoUrl: photoPreview || user.photoUrl });
      setEditMode(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSaving(false);
    }, 600);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="ud-page">
      <div className="ud-wrap">
        <div className="ud-card">
          {/* Banner */}
          <div className="ud-banner">
            <div className="ud-banner-rings" aria-hidden="true">
              <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid slice">
                <circle cx="250" cy="20" r="90" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
                <circle cx="250" cy="20" r="60" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Profile header */}
          <div className="ud-profile-header">
            <div className="ud-photo-wrap">
              <img
                src={photoPreview || user.photoUrl || "/default-avatar.png"}
                alt={user.name}
                className="ud-photo"
              />
              {editMode && (
                <button
                  type="button"
                  className="ud-photo-edit-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="bi bi-camera-fill"></i>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                hidden
              />
            </div>

            <div className="ud-profile-info">
              {editMode ? (
                <input
                  className="ud-name-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              ) : (
                <h1 className="ud-name">{user.name}</h1>
              )}
              <div className="ud-chip-row">
                <span className="ud-chip">
                  <i className="bi bi-person-badge-fill"></i> {user.membershipId}
                </span>
                <span className="ud-chip">
                  <i className="bi bi-calendar-check-fill"></i> Joined {formatDate(user.joinDate)}
                </span>
              </div>
            </div>

            <div className="ud-header-actions">
              {editMode ? (
                <>
                  <button className="ud-btn ud-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <span className="ud-spinner"></span> Saving
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    className="ud-btn ud-btn-ghost"
                    onClick={() => {
                      setEditMode(false);
                      setForm({ name: user.name });
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="ud-btn ud-btn-primary" onClick={() => setEditMode(true)}>
                  <i className="bi bi-pencil-fill"></i> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Notices */}
          <div className="ud-section">
            <h2 className="ud-section-title">
              <i className="bi bi-megaphone-fill"></i> Messages
            </h2>
            {notices.length === 0 ? (
              <div className="ud-empty">
                <i className="bi bi-inbox"></i>
                <p>No announcements right now.</p>
              </div>
            ) : (
              <ul className="ud-notices-list">
                {notices.map((n) => (
                  <li key={n._id} className="ud-notice-item">
                    <div className="ud-notice-accent"></div>
                    <span className="ud-notice-date">{formatDate(n.date)}</span>
                    <div className="ud-notice-body-wrap">
                      <p className="ud-notice-title">{n.title}</p>
                      <p className="ud-notice-body">{n.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick links — now outside ud-card */}
        <div className="ud-quicklinks-section">
          <h2 className="ud-section-title">
            <i className="bi bi-lightning-fill"></i> Quick Links
          </h2>
          <div className="ud-quick-links">
            {/* <a href="/profile/edit" className="ud-quick-link">
              <i className="bi bi-person-lines-fill"></i>
              <span>Update Profile</span>
            </a> */}
            <a href="/registration-form" className="ud-quick-link">
              <i className="bi bi-file-earmark-text-fill"></i>
              <span>Registration Form</span>
            </a>
            <a href="/contact" className="ud-quick-link">
              <i className="bi bi-headset"></i>
              <span>Contact Admin</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}