import { useState } from "react";
import "./InviteForm.css";

const API_URL = "https://kgsc-server.onrender.com/api/submit";
const CLUB_WHATSAPP_NUMBER = "9725720612"; // 

export default function InviteForm() {
    const [form, setForm] = useState({ name: "", age: "", phone: "", address: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [waLink, setWaLink] = useState("#");

    const currentYear = new Date().getFullYear();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = form.name.trim();
        const phone = form.phone.trim();
        const address = form.address.trim();
        const age = parseInt(form.age, 10);

        if (!name || !phone || !address || !form.age) {
            setError("Please fill in all fields.");
            return;
        }

        if (isNaN(age) || age <= 5 || age >= 80) {
            setError("Age must be between 6 and 79.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, address, age }),
            });

            if (!res.ok) throw new Error("Server error");

            const waMessage = encodeURIComponent(
                `Hi! I just registered for KGSC 🎉\n\n` +
                `*Name:* ${name}\n` +
                `*Age:* ${age}\n` +
                `*Phone:* ${phone}\n` +
                `*Address:* ${address}`
            );
            setWaLink(`https://wa.me/${CLUB_WHATSAPP_NUMBER}?text=${waMessage}`);
            setSubmitted(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="invite-page">
            <div className="field-lines"></div>

            <div className="wrap">
                <div className="badge">
                    KG
                    <br />
                </div>
                <h1>
                    Kamlaba Garden
                    <br />
                    <span>Sport Club</span>
                </h1>
                <p className="lede">
                    Invites you to join us for the upcoming Janmastmi &amp; Ganesh Chaturthi festival.
                </p>

                <div className="card">
                    {!submitted && <h2 className="card-title">Enter your details</h2>}

                    {!submitted && (
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="nameInput">Full name</label>
                            <input
                                type="text"
                                id="nameInput"
                                name="name"
                                placeholder="e.g. Tushar Pawar"
                                autoComplete="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="ageInput">Age</label>
                            <input
                                type="number"
                                id="ageInput"
                                name="age"
                                placeholder="e.g. 25"
                                min="6"
                                max="79"
                                value={form.age}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="phoneInput">Phone number</label>
                            <input
                                type="text"
                                id="phoneInput"
                                name="phone"
                                placeholder="e.g. 98765 43210"
                                autoComplete="tel"
                                inputMode="tel"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="addressInput">Address</label>
                            <input
                                type="text"
                                id="addressInput"
                                name="address"
                                placeholder="e.g. Vesu, Surat"
                                autoComplete="street-address"
                                value={form.address}
                                onChange={handleChange}
                                required
                            />

                            <div className={`error ${error ? "show" : ""}`}>{error}</div>

                            <button type="submit" disabled={submitting}>
                                {submitting ? "Joining…" : "Join the group"}
                            </button>
                        </form>
                    )}

                    {submitted && (
                        <div className="confirm show">
                            <svg
                                className="num"
                                width="44"
                                height="44"
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ margin: "0 auto 10px" }}
                            >
                                <circle cx="12" cy="12" r="11" stroke="#4c7a3d" strokeWidth="1.5" />
                                <path
                                    d="M7 12.5L10.5 16L17 8.5"
                                    stroke="#1f3d2b"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p style={{ marginBottom: 10 }}>
                                You're in, <strong>{form.name.trim()}</strong>.
                            </p>
                            <p>See you at Kamlaba Garden Sport Club!</p>
                            <a href={waLink} className="wa-btn" target="_blank" rel="noopener noreferrer">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.32 4.53 17.89 6.1C19.45 7.67 20.31 9.74 20.31 11.92C20.31 16.46 16.58 20.17 12.03 20.17C10.56 20.17 9.12 19.78 7.85 19.04L7.55 18.87L4.43 19.7L5.28 16.66L5.08 16.34C4.27 15.03 3.84 13.5 3.84 11.91C3.85 7.37 7.5 3.67 12.04 3.67ZM8.53 6.85C8.37 6.85 8.1 6.91 7.88 7.15C7.66 7.39 7.03 7.98 7.03 9.19C7.03 10.4 7.9 11.56 8.02 11.72C8.14 11.88 9.71 14.44 12.19 15.44C14.26 16.28 14.68 16.11 15.13 16.07C15.58 16.03 16.57 15.49 16.77 14.93C16.98 14.37 16.98 13.89 16.92 13.79C16.86 13.69 16.7 13.63 16.46 13.51C16.22 13.39 15.03 12.8 14.81 12.72C14.59 12.64 14.43 12.6 14.27 12.84C14.11 13.08 13.65 13.63 13.51 13.79C13.37 13.95 13.23 13.97 12.99 13.85C12.75 13.73 11.97 13.47 11.04 12.65C10.32 12.01 9.83 11.22 9.69 10.98C9.55 10.74 9.67 10.61 9.79 10.49C9.9 10.38 10.03 10.2 10.15 10.06C10.27 9.92 10.31 9.82 10.39 9.66C10.47 9.5 10.43 9.36 10.37 9.24C10.31 9.12 9.83 7.93 9.61 7.44C9.42 7.02 9.22 6.99 9.05 6.98C8.9 6.97 8.72 6.85 8.53 6.85Z" />
                                </svg>
                                Chat on WhatsApp
                            </a>
                        </div>
                    )}
                </div>

                <footer>
                    KAMLABA GARDEN SPORT CLUB — EST. <span>{currentYear}</span>
                    <br />
                    Developed by <a href="https://www.instagram.com/tushhar___">Tushar</a>
                </footer>
            </div>
        </div>
    );
}