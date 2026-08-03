import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import "./Home.css";

const galleryItems = [
  { src: "/images/1.jpg", title: "Community care", text: "Helping and supporting each other, always." },
  { src: "/images/2.jpg", title: "Togetherness", text: "Connected by purpose and unity." },
  { src: "/images/3.jpg", title: "Excellence", text: "Giving our best in every step." },
  { src: "/images/4.jpg", title: "Purpose", text: "Meaningful actions, impactful results." },
  { src: "/images/5.jpg", title: "Celebration", text: "Honouring our journey together." },
  { src: "/images/6.jpg", title: "Growth", text: "Rising higher, hand in hand." },
];

function useYearsRunning() {
  const foundingDate = new Date(1988, 2, 16);
  const now = new Date();
  let years = now.getFullYear() - foundingDate.getFullYear();
  const hadAnniversary =
    now.getMonth() > foundingDate.getMonth() ||
    (now.getMonth() === foundingDate.getMonth() && now.getDate() >= foundingDate.getDate());
  if (!hadAnniversary) years -= 1;
  return `${years}+`;
}

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);
  const yearsRunning = useYearsRunning();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false);
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="page-shell">
      {/* ============================= HERO ============================= */}
      <header className="hero">
        <div className="hero-rings" aria-hidden="true">
          <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
            <circle cx="620" cy="140" r="330" fill="none" stroke="rgba(216,207,188,0.10)" strokeWidth="1.5" />
            <circle cx="620" cy="140" r="230" fill="none" stroke="rgba(216,207,188,0.10)" strokeWidth="1.5" />
            <circle cx="150" cy="700" r="260" fill="none" stroke="rgba(86,84,73,0.14)" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="hero-top">
          <div className="brand-mark">
            <span>KGSC · SINCE 1988</span>
          </div>
          <div className="nav-menu-wrap" ref={navRef}>
            <button
              className={`portal-btn${navOpen ? " is-open" : ""}`}
              onClick={() => setNavOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={navOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path className="line line-top" d="M4 7h16" />
                <path className="line line-mid" d="M4 12h16" />
                <path className="line line-bottom" d="M4 17h16" />
              </svg>
            </button>

            <div className={`nav-dropdown${navOpen ? " is-open" : ""}`}>
              <Link to="/location" className="nav-dropdown-item" onClick={() => setNavOpen(false)}>
                <i className="bi bi-geo-alt-fill"></i> Location
              </Link>
              <Link to="/contact" className="nav-dropdown-item" onClick={() => setNavOpen(false)}>
                <i className="bi bi-envelope-fill"></i> Contact
              </Link>
              <Link to="/author" className="nav-dropdown-item" onClick={() => setNavOpen(false)}>
                <i className="bi bi-person-fill"></i> Author
              </Link>
              <Link to="/login" className="nav-dropdown-item" onClick={() => setNavOpen(false)}>
                <i className="bi bi-shield-lock-fill"></i> Login
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-body">
          <span className="eyebrow" style={{ color: "var(--leaf-300)", marginBottom: 18 }}>
            Est. 16 Mar 1988 · Reg. G‑9050
          </span>
          <h1>
            Kamlaba Garden<em>Sport Club</em>
          </h1>
          <p className="hero-tagline">TOGETHER WE GROW · TOGETHER WE RISE</p>
          <div className="hero-cta-group">
            <Link to="/login" className="hero-cta">
              Join With Us
            </Link>
          </div>
        </div>
      </header>

      {/* ============================= ABOUT ============================= */}
      <section className="about" id="about">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Who we are</span>
            <h2>
              Rooted in community, <span className="accent">built for sport</span>
            </h2>
            <p>
              A neighbourhood club where the grounds stay open, the doors stay
              open, and every member has a hand in what happens next.
            </p>
          </div>

          <div className="value-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21s-7-4.35-9.5-9C.6 8.1 2.3 4.5 6 4.5c2.2 0 3.6 1.3 4.5 2.6C11.4 5.8 12.8 4.5 15 4.5c3.7 0 5.4 3.6 3.5 7.5C19 16.65 12 21 12 21z" />
                </svg>
              </div>
              <h3>Community care</h3>
              <p>We look out for each other through life's ups and downs, on and off the field.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="7" r="3.2" />
                  <path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" />
                  <circle cx="17.5" cy="8.5" r="2.4" />
                  <path d="M15.8 14.3c2.7.2 5.2 2.3 5.2 5.7" />
                </svg>
              </div>
              <h3>Togetherness</h3>
              <p>Members from every walk of life, gathering for the traditions we share.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l2.8 6.3L21 9l-4.9 4.5L17.5 21 12 17.6 6.5 21l1.4-7.5L3 9l6.2-.7z" />
                </svg>
              </div>
              <h3>Excellence</h3>
              <p>From the grounds crew to the tournament roster, we hold a high bar.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="12" cy="12" r="0.8" fill="currentColor" />
                </svg>
              </div>
              <h3>Purpose</h3>
              <p>Working toward goals that benefit our members today and generations ahead.</p>
            </div>
          </div>

          <div className="mission">
            <div className="mission-copy">
              <span className="eyebrow" style={{ color: "var(--leaf-300)" }}>Our mission</span>
              <h3 style={{ marginTop: 12 }}>
                A club where every member has a stake in what grows here.
              </h3>
              <p>
                We believe in the power of unity and shared purpose. Every
                member is valued, connected, and invited to bring their own
                talents to the club — from coaching juniors to keeping the
                gardens green.
              </p>
              <div className="scoreboard">
                <div className="score-tile">
                  <div className="score-num">350+</div>
                  <div className="score-label">Members</div>
                </div>
                <div className="score-tile">
                  <div className="score-num">{yearsRunning}</div>
                  <div className="score-label">Years running</div>
                </div>
                <div className="score-tile" style={{ gridColumn: "1 / -1" }}>
                  <div className="score-num" style={{ fontSize: "1.15rem" }}>G‑9050</div>
                  <div className="score-label">Registration no. · Est. 16‑03‑1988</div>
                </div>
              </div>
            </div>
            <div className="rings-visual" aria-hidden="true">
              <svg viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
                <circle cx="130" cy="130" r="96" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <circle cx="130" cy="130" r="72" fill="none" stroke="rgba(216,207,188,0.55)" strokeWidth="1.4" />
                <circle cx="130" cy="130" r="48" fill="none" stroke="rgba(86,84,73,0.7)" strokeWidth="1.6" />
                <circle cx="130" cy="130" r="24" fill="#d8cfbc" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= GALLERY ============================= */}
      <section className="gallery" id="gallery">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">On the grounds</span>
            <h2>Moments from <span className="accent">the club</span></h2>
            <p>Swipe through a few scenes from our matches, gatherings, and everyday club life.</p>
          </div>

          <div className="gallery-scroller">
            {galleryItems.map((item) => (
              <figure className="gallery-card" key={item.title}>
                <div className="fallback-pattern"></div>
                <img
                  src={item.src}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <figcaption className="overlay-text">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="gallery-note">
            Drop your own photos into an /images folder as 1.jpg – 6.jpg and
            they'll appear here automatically.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
