import { useState, useEffect, useRef } from "react";
import "./UserDashboard.css";

// Adjust this to wherever your axios instance / base URL lives
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token"); // adjust key if different

  useEffect(() => {
    fetchProfile();
    fetchNotices();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setUser(data);
      setForm({ name: data.name || "" });
    } catch (err) {
      setError("Could not load your profile. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotices() {
    try {
      const res = await fetch(`${API_BASE}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return; // notices are non-critical, fail silently
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      // ignore - notices are optional
    }
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      let photoUrl = user.photoUrl;

      // Upload photo first if a new one was picked
      if (photoFile) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        const photoRes = await fetch(`${API_BASE}/api/user/photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!photoRes.ok) throw new Error("Photo upload failed");
        const photoData = await photoRes.json();
        photoUrl = photoData.photoUrl;
      }

      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, photoUrl }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setUser(updated);
      setEditMode(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return <div className="ud-loading">Loading your profile...</div>;
  }

  if (!user) {
    return <div className="ud-error">{error || "Something went wrong."}</div>;
  }

  return (
    <div className="ud-page">
      <div className="ud-card">
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
                Change
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
            <p className="ud-meta">Membership ID: {user.membershipId}</p>
            <p className="ud-meta">Joined: {formatDate(user.joinDate)}</p>
          </div>

          <div className="ud-header-actions">
            {editMode ? (
              <>
                <button
                  className="ud-btn ud-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
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
              <button
                className="ud-btn ud-btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <p className="ud-error-text">{error}</p>}

        {/* Notices */}
        <div className="ud-section">
          <h2 className="ud-section-title">Club Notices</h2>
          {notices.length === 0 ? (
            <p className="ud-empty">No announcements right now.</p>
          ) : (
            <ul className="ud-notices-list">
              {notices.map((n) => (
                <li key={n._id} className="ud-notice-item">
                  <span className="ud-notice-date">{formatDate(n.date)}</span>
                  <div>
                    <p className="ud-notice-title">{n.title}</p>
                    <p className="ud-notice-body">{n.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="ud-section">
          <h2 className="ud-section-title">Quick Links</h2>
          <div className="ud-quick-links">
            <a href="/profile/edit" className="ud-quick-link">
              Update Profile
            </a>
            <a href="/registration-form" className="ud-quick-link">
              View Registration Form
            </a>
            <a href="/contact" className="ud-quick-link">
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
