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
            <div className="author-role">ADMIN & COMMUNITY MEMBER</div>
            <p className="author-bio">
              Hi! I'm Tushar. I’m someone who enjoys being part of the
              community, meeting new people, and taking part in group activities
              and events. I believe in staying connected, helping others, and
              making good memories together.
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
