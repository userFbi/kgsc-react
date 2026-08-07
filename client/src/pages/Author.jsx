import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import "./Author.css";

export default function Author() {
  return (
    <div className="page-shell author-shell">
      <div className="author-topbar">
        <div className="wrap topbar-inner">
          <Link className="back-link" to="/">
            <i className="bi bi-arrow-left"></i> Back to KGSC
          </Link>
          <span className="brand-mark">KGSC · SINCE 1988</span>
        </div>
      </div>

      <main className="author-main">
        <div className="author-card">
          <div className="author-avatar">TP</div>
          <div>
            <div className="author-name">Tushar Pawar</div>
            <div className="author-role">FRONTEND DEVELOPER &amp; UI DESIGNER</div>
            <p className="author-bio">
              Hi! I'm Tushar, a frontend developer with a love for clean UI
              and seamless user experiences. I build modern, responsive
              websites with HTML, CSS and JavaScript.
            </p>
            <div className="author-socials">
              <a
                href="https://www.instagram.com/tushhar___/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=9725720612"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=pawartushar2024.katargam@gmail.com&su=Hello%20Tushar&body=I%20wanted%20to%20contact%20you."
                target="_blank"
                rel="noopener"
                aria-label="Email"
              >
                <i className="bi bi-envelope-fill"></i>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
