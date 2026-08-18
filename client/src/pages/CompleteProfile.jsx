import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompleteProfile.css";

const API_URL = "http://localhost:5050/api/auth";
const STEPS = ["Photo", "Aadhar", "Address", "Sizes"];
const SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadhar, setAadhar] = useState("");
  const [address, setAddress] = useState("");
  const [tshirtSize, setTshirtSize] = useState("");
  const [shortsSize, setShortsSize] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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

  function validateStep() {
    const errs = {};
    if (step === 1) {
      const digits = aadhar.replace(/\s/g, "");
      if (!/^\d{12}$/.test(digits))
        errs.aadhar = "Enter a valid 12-digit Aadhar number.";
    }
    if (step === 2) {
      if (!address.trim()) errs.address = "Please add your address.";
    }
    if (step === 3) {
      if (!tshirtSize) errs.tshirtSize = "Select a T-shirt size.";
      if (!shortsSize) errs.shortsSize = "Select a shorts size.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    setError("");
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  }

  function goBack() {
    setError("");
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (photoFile) formData.append("photo", photoFile);
      formData.append("aadharNumber", aadhar.replace(/\s/g, ""));
      formData.append("address", address.trim());
      formData.append("tshirtSize", tshirtSize); // 👈 naya
      formData.append("shortsSize", shortsSize); // 👈 naya
      const res = await fetch(`${API_URL}/complete-profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your profile.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cp-shell">
      <div className="cp-card">
        <div className="cp-head">
          <span className="cp-eyebrow">Members area</span>
          <h1>Complete your profile</h1>
          <p className="cp-sub">This helps the club verify your membership.</p>
        </div>

        <div className="cp-progress">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`cp-progress-step${i === step ? " is-active" : ""}${i < step ? " is-done" : ""}`}
            >
              <span className="cp-progress-dot">
                {i < step ? <i className="bi bi-check-lg"></i> : i + 1}
              </span>
              <span className="cp-progress-label">{label}</span>
            </div>
          ))}
        </div>

        {error && <p className="cp-error">{error}</p>}

        {step === 0 && (
          <div className="cp-step">
            <div className="cp-photo-upload">
              <div className="cp-photo-circle">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" />
                ) : (
                  <i className="bi bi-person-fill"></i>
                )}
              </div>
              <label className="cp-photo-btn">
                <i className="bi bi-camera-fill"></i>
                {photoPreview ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoSelect}
                />
              </label>
              <p className="cp-hint">
                A clear photo of your face. JPG or PNG, up to 5MB.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="cp-step">
            <div className="cp-field">
              <label>Aadhar card number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="XXXX XXXX XXXX"
                value={aadhar}
                onChange={(e) => setAadhar(formatAadharInput(e.target.value))}
              />
              <span className="cp-field-error">{fieldErrors.aadhar}</span>
            </div>
            <p className="cp-hint">
              Used only to verify your membership. Never shared publicly.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="cp-step">
            <div className="cp-field">
              <label>Full address</label>
              <input
                rows={3}
                placeholder="House no, street, area, Surat, Gujarat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <span className="cp-field-error">{fieldErrors.address}</span>
            </div>
            <p className="cp-hint">
              Just your basic address is fine — no need for exact pincode.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="cp-step">
            <div className="cp-field">
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
                    aria-checked={tshirtSize === size}
                    className={`size-option${tshirtSize === size ? " is-active" : ""}`}
                    onClick={() => setTshirtSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="cp-field-error">{fieldErrors.tshirtSize}</span>
            </div>

            <div className="cp-field">
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
                    aria-checked={shortsSize === size}
                    className={`size-option${shortsSize === size ? " is-active" : ""}`}
                    onClick={() => setShortsSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="cp-field-error">{fieldErrors.shortsSize}</span>
            </div>
            <p className="cp-hint">Used for club merchandise sizing.</p>
          </div>
        )}

        <div className="cp-actions">
          {step > 0 && (
            <button
              type="button"
              className="cp-btn cp-btn-ghost"
              onClick={goBack}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={goNext}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : step === STEPS.length - 1
                ? "Save & continue"
                : "Next"}
          </button>
        </div>

        {step === 0 && (
          <button type="button" className="cp-skip" onClick={() => setStep(1)}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
