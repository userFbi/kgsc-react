import { useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import "./Contact.css";

const EMAILJS_PUBLIC_KEY = "SkPoA_5QwGs2euUG4";
const EMAILJS_SERVICE_ID = "service_2vc09ja";
const EMAILJS_TEMPLATE_ID = "template_fnch9t5";

const committee = [
  { name: "Dishant Kadam", role: "પ્રમુખ", phone: "+91 84605 15164", tel: "+918460515164" },
  { name: "Rohit Kadam", role: "ઉપપ્રમુખ", phone: "+91 98798 73789", tel: "+919879873789" },
  { name: "Tushar Pawar", role: "સંચાલક", phone: "+91 97257 20612", tel: "+919725720612" },
  { name: "Nayan Nirmal", role: "મહામંત્રી", phone: "+91 90818 18035", tel: "+919081818035" },
  { name: "Chirag Shirke", role: "સંયોજક", phone: "+91 99981 84390", tel: "+919998184390" },
  { name: "Ashish Bhamre", role: "વ્યવસ્થા પ્રમુખ", phone: "+91 87339 16403", tel: "+918733916403" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", number: "", address: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success" });

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!/^[0-9]{10}$/.test(form.number.trim()))
      next.number = "Enter a valid 10-digit number.";
    if (!form.address.trim()) next.address = "Please enter your full address.";
    if (!form.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function showToast(type) {
    setToast({ open: true, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast((t) => ({ ...t, open: false })),
      3200,
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: form.name.trim(),
          number: form.number.trim(),
          address: form.address.trim(),
          message: form.message.trim(),
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setForm({ name: "", number: "", address: "", message: "" });
      showToast("success");
    } catch (error) {
      console.error("EmailJS Error:", error);
      showToast("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="wrap">
          <div className="top-row">
            <Link className="back-link" to="/">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
            <span className="brand-mark">KGSC · SINCE 1988</span>
          </div>
          <span className="eyebrow" style={{ color: "var(--leaf-300)" }}>
            Get in touch
          </span>
          <h1>Contact us</h1>
          <p>
            Questions about membership, the grounds, or events — reach out
            however's easiest for you.
          </p>
        </div>
      </header>

      <main className="wrap contact-main">
        <div className="contact-layout">
          <div className="form-card">
            <span className="eyebrow">Reserve your slot</span>
            <h2>Book your Matki / Supari</h2>
            <p className="sub">
              Fill this in with your details and we'll confirm your booking
              shortly.
            </p>

            <form className="join-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="fName" className="book-label">Full name</label>
                <input
                  id="fName"
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
                <span className="field-error">{errors.name}</span>
              </div>
              <div className="field">
                <label htmlFor="fNumber" className="book-label">Your number</label>
                <input
                  id="fNumber"
                  type="tel"
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.number}
                  onChange={(e) => updateField("number", e.target.value)}
                  required
                />
                <span className="field-error">{errors.number}</span>
              </div>
              <div className="field">
                <label htmlFor="fAddress" className="book-label">Full address</label>
                <textarea
                  id="fAddress"
                  placeholder="House no., street, area, city, pincode"
                  rows={3}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  required
                ></textarea>
                <span className="field-error">{errors.address}</span>
              </div>
              <div className="field">
                <label htmlFor="fMessage" className="book-label">Message</label>
                <textarea
                  id="fMessage"
                  placeholder="Any details about your Matki / Supari booking"
                  rows={4}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  required
                ></textarea>
                <span className="field-error">{errors.message}</span>
              </div>
              <button type="submit" className="join-button" disabled={sending}>
                {sending ? "Sending…" : "Send booking request"}
              </button>
            </form>
          </div>

          <div className="channel-card">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Call us directly</span>
              <h2 style={{ marginTop: 10, fontSize: "1.5rem" }}>
                Contact numbers
              </h2>
              <p style={{ marginTop: 8, fontSize: "0.9rem" }}>
                Reach any committee member directly for bookings and queries.
              </p>
            </div>

            <div className="number-list">
              {committee.map((member) => (
                <a className="number-item" href={`tel:${member.tel}`} key={member.tel}>
                  <div className="channel-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div>
                    <div className="channel-title">
                      {member.name} <span className="number-role">{member.role}</span>
                    </div>
                    <div className="channel-sub">{member.phone}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.type === "success" ? "Kamlaba Garden Sport Club" : "Something went wrong"}
        message={
          toast.type === "success"
            ? "Your request is sent. We will connect with you shortly."
            : "Please check your connection and try again."
        }
      />
    </div>
  );
}
