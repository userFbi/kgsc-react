import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import "./Location.css";

export default function Location() {
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
            <span className="eyebrow" style={{ color: "var(--leaf-300)" }}>
              Find us
            </span>
          </div>

          <h1>Our grounds</h1>
          <p>
            Come by anytime — the gates are open and the club is easy to find
            right off the Godadara Naher stretch.
          </p>
        </div>
      </header>

      <main className="wrap location-main">
        <div className="location-layout">
          <div className="map-frame">
            <iframe
              src="https://www.google.com/maps?q=21.168128,72.8727552&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kamlaba Garden Sport Club location map"
            ></iframe>
          </div>

          <div className="info-card">
            <div className="info-row">
              <div className="info-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <div className="info-title">Address</div>
                <p className="info-text">
                  Kamlaba Garden Society, Shreeji Nagar – 2, Near Ramji Mandir
                  (Godadara Naher), Surat Gujarat
                </p>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon">
                <i className="bi bi-signpost-2-fill"></i>
              </div>
              <div>
                <div className="info-title">Coordinates</div>
                <p className="info-text">21.168128, 72.8727552</p>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon">
                <i className="bi bi-clock-fill"></i>
              </div>
              <div>
                <div className="info-title">Open</div>
                <p className="info-text">
                  Grounds open daily · Est. 16 March 1988
                </p>
              </div>
            </div>

            <div className="btn-row">
              <a
                className="btn btn-primary"
                href="https://maps.app.goo.gl/U57N5AM9Wnb4J51A9"
                target="_blank"
                rel="noopener"
              >
                <i className="bi bi-signpost-split-fill"></i> Get directions
              </a>
              <Link className="btn btn-outline" to="/contact">
                <i className="bi bi-envelope-fill"></i> Contact us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
