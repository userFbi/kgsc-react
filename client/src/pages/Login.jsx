import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_URL = "http://localhost:5050/api/auth"; // change to your Render URL in production

export default function Login() {
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [loginData, setLoginData] = useState({ user: "", pass: "" });
  const [loginErrors, setLoginErrors] = useState({});

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    pass: "",
    confirmPass: "",
    phone: "",
    aadhar: "",
  });
  const [signupErrors, setSignupErrors] = useState({});



  function saveSessionAndRedirect(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard"); // change to your actual logged-in route
  }

  async function handleLogin(e) {
    e.preventDefault();
    setApiError("");
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.user.trim()))
      errors.user = "Enter a valid email.";
    if (!loginData.pass.trim()) errors.pass = "Enter your password.";
    setLoginErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.user.trim(),
          password: loginData.pass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Login failed.");
        return;
      }
      saveSessionAndRedirect(data);
    } catch (err) {
      setApiError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setApiError("");
    const errors = {};
    if (!signupData.name.trim()) errors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email.trim()))
      errors.email = "Enter a valid email.";
    if (signupData.pass.trim().length < 6)
      errors.pass = "Password must be at least 6 characters.";
    if (signupData.confirmPass !== signupData.pass)
      errors.confirmPass = "Passwords do not match.";
    if (!/^[0-9]{10}$/.test(signupData.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number.";
    setSignupErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupData.name.trim(),
          email: signupData.email.trim(),
          phone: signupData.phone.trim(),
          password: signupData.pass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Sign up failed.");
        return;
      }
      saveSessionAndRedirect(data);
    } catch (err) {
      setApiError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Google sign-in failed.");
        return;
      }
      saveSessionAndRedirect(data);
    } catch (err) {
      setApiError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
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
              onClick={() => { setTab("login"); setApiError(""); }}
            >
              Login
            </button>
            <button
              className={`auth-tab${tab === "signup" ? " is-active" : ""}`}
              onClick={() => { setTab("signup"); setApiError(""); }}
            >
              Sign up
            </button>
          </div>

          {apiError && <p className="auth-api-error">{apiError}</p>}

          {/* LOGIN PANEL */}
          <form
            className={`auth-panel${tab === "login" ? " is-active" : ""}`}
            onSubmit={handleLogin}
            autoComplete="off"
          >
            <div className="field">
              <label htmlFor="loginUser" className="login-label">Email</label>
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
                  type={showLoginPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={loginData.pass}
                  onChange={(e) =>
                    setLoginData({ ...loginData, pass: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="field-eye-toggle"
                  onClick={() => setShowLoginPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showLoginPass ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showLoginPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              <span className="field-error">{loginErrors.pass}</span>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <div className="google-btn-wrap">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setApiError("Google sign-in failed.")}
                theme="filled_black"
                shape="pill"
                width="100%"
                text="continue_with"
              />
            </div>

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
              <label htmlFor="signupPass" className="login-label">Password</label>
              <div className="field-input-wrap">
                <i className="bi bi-lock-fill"></i>
                <input
                  id="signupPass"
                  type={showSignupPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={signupData.pass}
                  onChange={(e) =>
                    setSignupData({ ...signupData, pass: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="field-eye-toggle"
                  onClick={() => setShowSignupPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showSignupPass ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showSignupPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              <span className="field-error">{signupErrors.pass}</span>
            </div>

            <div className="field">
              <label htmlFor="signupConfirmPass" className="login-label">Confirm Password</label>
              <div className="field-input-wrap">
                <i className="bi bi-lock-fill"></i>
                <input
                  id="signupConfirmPass"
                  type={showConfirmPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={signupData.confirmPass}
                  onChange={(e) =>
                    setSignupData({ ...signupData, confirmPass: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="field-eye-toggle"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showConfirmPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              <span className="field-error">{signupErrors.confirmPass}</span>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <div className="google-btn-wrap">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess}
                onError={() => setApiError("Google sign-in failed.")}
                theme="filled_black"
                shape="pill"
                width="100%"
                text="continue_with"
              />
            </div>

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