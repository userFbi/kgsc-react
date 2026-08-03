import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div className="footer-col footer-brand">
          <h3 className="footer-logo">KGSC</h3>
          <p className="footer-tagline">Kamlaba Garden Sport Club</p>
          <p className="footer-est">Est. 16 March 1988 &nbsp;·&nbsp; Reg. G-9050</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/#about">About</Link>
            </li>
            <li>
              <Link to="/#gallery">Gallery</Link>
            </li>
            <li>
              <Link to="/location">Location</Link>
            </li>
            <li>
              <Link to="/#contact">Join us</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>
              <i className="bi bi-telephone-fill"></i>
              <div>
                <span className="contact-name">Tushar Pawar</span>
                <a href="tel:+919725720612">+91 97257 20612</a>
              </div>
            </li>
            <li>
              <i className="bi bi-telephone-fill"></i>
              <div>
                <span className="contact-name">Nayan Nirmal</span>
                <a href="tel:+919081818035">+91 90818 18035</a>
              </div>
            </li>
            <li>
              <i className="bi bi-envelope-fill"></i>
              <div>
                <a href="mailto:kamlabgardensportclub@gmail.com">
                  kamlabgardensportclub@gmail.com
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/kamlaba_garden_sport_club/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://maps.google.com/?q=21.168128,72.8727552"
              target="_blank"
              rel="noopener"
              aria-label="Location"
            >
              <i className="bi bi-geo-alt-fill"></i>
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=kamlabgardensportclub@gmail.com&su=Inquiry%20About%20Kamlaba%20Garden%20Sport%20Club"
              target="_blank"
              rel="noopener"
              aria-label="Email"
            >
              <i className="bi bi-envelope-fill"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p>&copy; {year} KGSC — All rights reserved.</p>
        <p className="footer-credit">
          Designed &amp; built by{" "}
          <a
            href="https://www.instagram.com/tushhar___/"
            target="_blank"
            rel="noopener"
          >
            Tushar
          </a>
        </p>
      </div>
    </footer>
  );
}
