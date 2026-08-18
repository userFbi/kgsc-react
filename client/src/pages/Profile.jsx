import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = "http://localhost:5050/api/auth";
const SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    aadhar: "",
    tshirtSize: "",
    shortsSize: "",
  });

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
        setForm({
          fullName: data.user.fullName || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          aadhar: data.user.aadharNumber || "",
          tshirtSize: data.user.tshirtSize || "",
          shortsSize: data.user.shortsSize || "",
        });
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [navigate]);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function formatAadharInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function maskAadhar(num) {
    if (!num) return null;
    return `XXXX XXXX ${num.slice(-4)}`;
  }

  function enterEditMode() {
    setError("");
    setSuccess("");
    setForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      aadhar: user.aadharNumber || "",
      tshirtSize: user.tshirtSize || "",
      shortsSize: user.shortsSize || "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditMode(true);
  }

  function cancelEdit() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setError("");
    setEditMode(false);
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (photoFile) formData.append("photo", photoFile);
      formData.append("fullName", form.fullName.trim());
      formData.append("phone", form.phone.trim());
      formData.append("address", form.address.trim());
      const aadharDigits = form.aadhar.replace(/\s/g, "");
      formData.append("aadharNumber", aadharDigits);
      formData.append("tshirtSize", form.tshirtSize);
      formData.append("shortsSize", form.shortsSize);

      const res = await fetch(`${API_URL}/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save changes.");
        return;
      }
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccess("Profile updated.");
      setEditMode(false);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pf-page">
        <div className="pf-loading">
          <span className="pf-spinner"></span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pf-page">
      <div className="pf-wrap">

        <div className="pf-card">
        <button className="pf-back" onClick={() => navigate("/dashboard")}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
          <div className="pf-head-row">
            <div>
              <h1 className="pf-title">Personal details</h1>
              <p className="pf-sub">
                Your photo, contact info, address and Aadhar number.
              </p>
            </div>
            {!editMode && (
              <button className="pf-edit-btn" onClick={enterEditMode}>
                <i className="bi bi-pencil-fill"></i> Edit
              </button>
            )}
          </div>

          {!user.isProfileComplete && (
            <div className="pf-notice">
              <i className="bi bi-info-circle-fill"></i>
              <span>
                {!user.aadharNumber && !user.address
                  ? "Add your Aadhar number and address to complete your profile."
                  : !user.aadharNumber
                    ? "Add your Aadhar number to complete your profile."
                    : "Add your address to complete your profile."}
              </span>
            </div>
          )}

          {error && <p className="pf-error">{error}</p>}
          {success && <p className="pf-success">{success}</p>}

          {!editMode ? (
            <>
              <div className="pf-photo-row">
                <div className="pf-photo-circle">
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt={user.fullName} />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
              </div>

              <div className="pf-list">
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Full name</span>
                    <span className="pf-list-value">
                      {user.fullName || "Not added yet"}
                    </span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Email</span>
                    <span className="pf-list-value">{user.email}</span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Phone number</span>
                    <span className="pf-list-value">
                      {user.phone || "Not added yet"}
                    </span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-card-heading"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Aadhar card</span>
                    <span className="pf-list-value">
                      {user.aadharNumber
                        ? maskAadhar(user.aadharNumber)
                        : "Not added yet"}
                    </span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Address</span>
                    <span className="pf-list-value">
                      {user.address || "Not added yet"}
                    </span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-person-badge-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>T-shirt size</span>
                    <span className="pf-list-value">
                      {user.tshirtSize || "Not added yet"}
                    </span>
                  </span>
                </div>
                <div className="pf-list-row">
                  <span className="pf-list-icon">
                    <i className="bi bi-person-badge-fill"></i>
                  </span>
                  <span className="pf-list-text">
                    <span>Shorts size</span>
                    <span className="pf-list-value">
                      {user.shortsSize || "Not added yet"}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="pf-photo-row">
                <div className="pf-photo-circle">
                  {photoPreview || user.profilePhotoUrl ? (
                    <img
                      src={photoPreview || user.profilePhotoUrl}
                      alt={user.fullName}
                    />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                <button
                  type="button"
                  className="pf-photo-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="bi bi-camera-fill"></i> Change photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  hidden
                  onChange={handlePhotoSelect}
                />
              </div>

              <div className="pf-field">
                <label>Full name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>

              <div className="pf-field">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
                <span className="pf-hint">Email can't be changed.</span>
              </div>

              <div className="pf-field">
                <label>Phone number</label>
                <input type="tel" value={user.phone} disabled />
                <span className="pf-hint">Phone number can't be changed.</span>
              </div>

              <div className="pf-field">
                <label>Aadhar card number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX"
                  value={formatAadharInput(form.aadhar)}
                  onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
                />
              </div>

              <div className="pf-field">
                <label>Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="pf-field">
                <label>T-shirt size</label>
                <div
                  className="size-group"
                  role="radiogroup"
                  aria-label="T-shirt size"
                >
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={form.tshirtSize === size}
                      className={`size-option${form.tshirtSize === size ? " is-active" : ""}`}
                      onClick={() => setForm({ ...form, tshirtSize: size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pf-field">
                <label>Shorts size</label>
                <div
                  className="size-group"
                  role="radiogroup"
                  aria-label="Shorts size"
                >
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={form.shortsSize === size}
                      className={`size-option${form.shortsSize === size ? " is-active" : ""}`}
                      onClick={() => setForm({ ...form, shortsSize: size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pf-actions">
                <button
                  className="pf-cancel-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="pf-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
