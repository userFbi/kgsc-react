import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast.jsx";
import {
  addMemberRecord,
  loadMembers,
  nextMemberId,
} from "../data/membersStore.js";
import "./Manager.css";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

const emptyForm = {
  name: "",
  phone: "",
  aadhar: "",
  address: "",
  tshirtSize: "",
  shortsSize: "",
};

export default function AddMember() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter the member's full name.";
    if (!/^[0-9]{10}$/.test(form.phone.trim()))
      next.phone = "Enter a valid 10-digit number.";
    if (!/^[0-9]{12}$/.test(form.aadhar.trim()))
      next.aadhar = "Enter a valid 12-digit Aadhar number.";
    if (!form.address.trim())
      next.address = "Please enter the member's address.";
    if (!form.tshirtSize) next.tshirtSize = "Select a T-shirt size.";
    if (!form.shortsSize) next.shortsSize = "Select a shorts size.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const members = loadMembers();
    const record = {
      id: nextMemberId(members),
      name: form.name.trim(),
      phone: form.phone.trim(),
      aadhar: form.aadhar.trim(),
      address: form.address.trim(),
      tshirtSize: form.tshirtSize,
      shortsSize: form.shortsSize,
      // Recorded automatically at the moment the member is added.
      joined: new Date().toISOString().slice(0, 10),
    };
    addMemberRecord(record);
    setSaving(false);
    setToastOpen(true);
    setForm(emptyForm);

    window.setTimeout(() => navigate("/manager/members"), 900);
  }

  return (
    <>
      <div className="manager-page-head">
        <span className="eyebrow">Membership</span>
        <h1>Add a member</h1>
        <p>
          New members are added straight to the club roster, dated to today.
        </p>
      </div>

      <div className="manager-panel">
        <form className="manager-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="mName">Full name</label>
            <input
              id="mName"
              type="text"
              placeholder="Full name"
              autoComplete="off"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <span className="field-error">{errors.name}</span>
          </div>

          <div className="manager-form-row">
            <div className="field">
              <label htmlFor="mPhone">Phone number</label>
              <input
                id="mPhone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                autoComplete="off"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              <span className="field-error">{errors.phone}</span>
            </div>
            <div className="field">
              <label htmlFor="mAadhar">Aadhar card number</label>
              <input
                id="mAadhar"
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit Aadhar number"
                autoComplete="off"
                value={form.aadhar}
                onChange={(e) => updateField("aadhar", e.target.value)}
                required
              />
              <span className="field-error">{errors.aadhar}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="mAddress">Address</label>
            <textarea
              id="mAddress"
              placeholder="House no., street, area, city, pincode"
              rows={3}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              required
            ></textarea>
            <span className="field-error">{errors.address}</span>
          </div>

          <div className="manager-form-row">
            <div className="field">
              <label htmlFor="mTshirtSize">T-shirt size</label>
              <select
                id="mTshirtSize"
                value={form.tshirtSize}
                onChange={(e) => updateField("tshirtSize", e.target.value)}
                required
              >
                <option value="">Select size</option>
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="field-error">{errors.tshirtSize}</span>
            </div>
            <div className="field">
              <label htmlFor="mShortsSize">Shorts size</label>
              <select
                id="mShortsSize"
                value={form.shortsSize}
                onChange={(e) => updateField("shortsSize", e.target.value)}
                required
              >
                <option value="">Select size</option>
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="field-error">{errors.shortsSize}</span>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Add member"}
            </button>
          </div>
        </form>
      </div>

      <Toast
        open={toastOpen}
        type="success"
        title="Kamlaba Garden Sport Club"
        message="Member added to the roster."
      />
    </>
  );
}
