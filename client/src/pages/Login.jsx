import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [tab, setTab] = useState("login");

  const [loginData, setLoginData] = useState({ user: "", pass: "" });
  const [loginErrors, setLoginErrors] = useState({});

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    pass: "",
    phone: "",
    aadhar: "",
  });
  const [signupErrors, setSignupErrors] = useState({});

  function handleLogin(e) {
    e.preventDefault();
    const errors = {};
    if (!loginData.user.trim()) errors.user = "Enter your email or username.";
    if (!loginData.pass.trim()) errors.pass = "Enter your password.";
    setLoginErrors(errors);
    if (Object.keys(errors).length) return;

    // TODO: replace with a real API call, then redirect based on role
    // e.g. navigate("/manager");
    alert("Login submitted — connect this to your backend.");
  }

  function handleSignup(e) {
    e.preventDefault();
    const errors = {};
    if (!signupData.name.trim()) errors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email.trim()))
      errors.email = "Enter a valid email.";
    if (signupData.pass.trim().length < 6)
      errors.pass = "Password must be at least 6 characters.";
    if (!/^[0-9]{10}$/.test(signupData.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number.";
    if (!/^[0-9]{12}$/.test(signupData.aadhar.trim()))
      errors.aadhar = "Enter a valid 12-digit Aadhar number.";
    setSignupErrors(errors);
    if (Object.keys(errors).length) return;

    // TODO: replace with a real API call to create the account.
    // Handle the Aadhar number as sensitive personal data: send it only
    // over HTTPS, avoid logging it, and store it encrypted at rest per
    // applicable data-protection requirements.
    alert("Sign-up submitted — connect this to your backend.");
  }

  return (
    <div className="page-shell login-shell">
      <div className="bg-rings" aria-hidden="true">
        <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="650" cy="120" r="300" fill="none" stroke="rgba(216,207,188,0.10)" strokeWidth="1.5" />
          <circle cx="650" cy="120" r="210" fill="none" stroke="rgba(216,207,188,0.10)" strokeWidth="1.5" />
          <circle cx="120" cy="700" r="240" fill="none" stroke="rgba(86,84,73,0.14)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="topbar">
        <div className="wrap topbar-inner">
          <Link className="back-link" to="/">
            <i className="bi bi-arrow-left"></i> Back to home
          </Link>
          <span className="brand-mark">KGSC · SINCE 1988</span>
        </div>
      </div>

      <main className="login-main">
        <div className="auth-card">
          <div className="auth-head">
            <span className="eyebrow">Members area</span>
            <h1>Welcome to KGSC</h1>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === "login" ? " is-active" : ""}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab${tab === "signup" ? " is-active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>

          {/* LOGIN PANEL */}
          <form
            className={`auth-panel${tab === "login" ? " is-active" : ""}`}
            onSubmit={handleLogin}
            autoComplete="off"
          >
            <div className="field">
              <label htmlFor="loginUser" className="login-label">Email or username</label>
              <div className="field-input-wrap">
                <i className="bi bi-person-fill"></i>
                <input
                  id="loginUser"
                  type="text"
                  autoComplete="off"
                  value={loginData.user}
                  onChange={(e) =>
                    setLoginData({ ...loginData, user: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{loginErrors.user}</span>
            </div>
            <div className="field">
              <label htmlFor="loginPass" className="login-label">Password</label>
              <div className="field-input-wrap">
                <i className="bi bi-lock-fill"></i>
                <input
                  id="loginPass"
                  type="password"
                  autoComplete="current-password"
                  value={loginData.pass}
                  onChange={(e) =>
                    setLoginData({ ...loginData, pass: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{loginErrors.pass}</span>
            </div>
            <button type="submit" className="auth-submit">
              Log in
            </button>
            <p className="auth-switch">
              New here?{" "}
              <button type="button" onClick={() => setTab("signup")}>
                Create an account
              </button>
            </p>
          </form>

          {/* SIGNUP PANEL */}
          <form
            className={`auth-panel${tab === "signup" ? " is-active" : ""}`}
            onSubmit={handleSignup}
            autoComplete="off"
          >
            <div className="field">
              <label htmlFor="signupName" className="login-label">Full name</label>
              <div className="field-input-wrap">
                <i className="bi bi-person-fill"></i>
                <input
                  id="signupName"
                  type="text"
                  autoComplete="name"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{signupErrors.name}</span>
            </div>
            <div className="field">
              <label htmlFor="signupEmail" className="login-label">Email</label>
              <div className="field-input-wrap">
                <i className="bi bi-envelope-fill"></i>
                <input
                  id="signupEmail"
                  type="email"
                  autoComplete="email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{signupErrors.email}</span>
            </div>
            <div className="field">
              <label htmlFor="signupPass" className="login-label">Password</label>
              <div className="field-input-wrap">
                <i className="bi bi-lock-fill"></i>
                <input
                  id="signupPass"
                  type="password"
                  autoComplete="new-password"
                  value={signupData.pass}
                  onChange={(e) =>
                    setSignupData({ ...signupData, pass: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{signupErrors.pass}</span>
            </div>
            <div className="field">
              <label htmlFor="signupPhone" className="login-label">Phone number</label>
              <div className="field-input-wrap">
                <i className="bi bi-telephone-fill"></i>
                <input
                  id="signupPhone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  value={signupData.phone}
                  onChange={(e) =>
                    setSignupData({ ...signupData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-error">{signupErrors.phone}</span>
            </div>
            <div className="field">
              <label htmlFor="signupAadhar" className="login-label">Aadhar card number</label>
              <div className="field-input-wrap">
                <i className="bi bi-credit-card-2-front-fill"></i>
                <input
                  id="signupAadhar"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit Aadhar number"
                  autoComplete="off"
                  value={signupData.aadhar}
                  onChange={(e) =>
                    setSignupData({ ...signupData, aadhar: e.target.value })
                  }
                  required
                />
              </div>
              <span className="field-hint">
                Used only to verify your identity as a club member.
              </span>
              <span className="field-error">{signupErrors.aadhar}</span>
            </div>
            <button type="submit" className="auth-submit">
              Create account
            </button>
            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" onClick={() => setTab("login")}>
                Log in instead
              </button>
            </p>
          </form>

          <p className="auth-note">
            New accounts are reviewed by the club before access is granted.
          </p>
        </div>
      </main>
    </div>
  );
}
