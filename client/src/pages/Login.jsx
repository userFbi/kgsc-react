import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const SEND_OTP_API_URL = `${API_URL}/send-otp`;
const VERIFY_OTP_API_URL = `${API_URL}/verify-otp`;
const SIGNUP_API_URL = `${API_URL}/signup`;
const FORGOT_SEND_OTP_URL = `${API_URL}/forgot-password/send-otp`;
const FORGOT_RESET_URL = `${API_URL}/forgot-password/reset`;

export default function Login() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // LOGIN
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPass, setShowLoginPass] = useState(false);

  // SIGNUP
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    name: "",
    phone: "",
    password: "",
    aadhar: "",
    email: "",
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [showSignupPass, setShowSignupPass] = useState(false);

  // OTP (signup)
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // FORGOT PASSWORD
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  function saveSessionAndRedirect(data) {
    if (data.token) localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user?.role === "admin") navigate("/admin");
    else if (data.user?.role === "manager") navigate("/manager");
    else navigate("/dashboard");
  }

  function changeTab(selectedTab) {
    setTab(selectedTab);
    setApiError("");
    setSignupErrors({});
    setLoginErrors({});
    setForgotErrors({});
    setForgotSuccess("");
    if (selectedTab === "signup") {
      setSignupStep(1);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue("");
    }
    if (selectedTab === "forgot") {
      setForgotEmail("");
      setForgotOtpSent(false);
      setForgotOtp("");
      setNewPassword("");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setApiError("");
    const errors = {};
    if (!loginData.identifier.trim())
      errors.identifier = "Enter your phone number or Member ID.";
    if (!loginData.password.trim()) errors.password = "Enter your password.";
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginData.identifier.trim(),
          password: loginData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message ||
            data.error ||
            "Login failed. Please check your details.",
        );
      saveSessionAndRedirect(data);
    } catch (error) {
      setApiError(error.message || "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(e) {
    setSignupData({ ...signupData, email: e.target.value });
    setOtpVerified(false);
  }

  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setSignupData({ ...signupData, phone: value });
  }

  function handleAadharChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setSignupData({ ...signupData, aadhar: value });
  }

  async function sendOTP() {
    setSignupErrors({});
    const email = signupData.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignupErrors({ email: "Enter a valid email address." });
      return;
    }

    setOtpLoading(true);
    setApiError("");
    try {
      const res = await fetch(SEND_OTP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to send OTP.");
      setOtpSent(true);
      setOtpVerified(false);
      setOtpValue("");
      setApiError(data.message || "OTP sent to your email.");
    } catch (error) {
      setApiError(error.message || "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOTP() {
    const email = signupData.email.trim();

    if (otpValue.length !== 6) {
      setApiError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    setApiError("");
    try {
      const res = await fetch(VERIFY_OTP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP.");
      setOtpVerified(true);
      setSignupStep(2);
      setApiError("");
    } catch (error) {
      setApiError(error.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setApiError("");
    const errors = {};

    if (!otpVerified) {
      setApiError("Please verify your email first.");
      return;
    }

    if (!signupData.name.trim()) errors.name = "Enter your full name.";
    if (!/^\d{10}$/.test(signupData.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number.";
    if (signupData.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!/^\d{12}$/.test(signupData.aadhar))
      errors.aadhar = "Aadhar number must be exactly 12 digits.";

    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupData.name.trim(),
          email: signupData.email.trim(),
          phone: signupData.phone.trim(),
          password: signupData.password,
          aadhar: signupData.aadhar.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || data.error || "Unable to create account.",
        );

      if (data.token) {
        saveSessionAndRedirect(data);
        return;
      }

      setApiError(
        "Account created successfully. Please wait for club approval.",
      );
      setSignupData({
        name: "",
        phone: "",
        password: "",
        aadhar: "",
        email: "",
      });
      setSignupStep(1);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue("");
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
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
      if (!res.ok)
        throw new Error(data.message || data.error || "Google sign-in failed.");
      saveSessionAndRedirect(data);
    } catch (error) {
      setApiError(error.message || "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // FORGOT PASSWORD HANDLERS
  async function sendForgotOtp() {
    setForgotErrors({});
    setForgotSuccess("");
    const email = forgotEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotErrors({ email: "Enter a valid email address." });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(FORGOT_SEND_OTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to send OTP.");
      setForgotOtpSent(true);
      setForgotSuccess(data.message || "OTP sent to your email.");
    } catch (error) {
      setForgotErrors({ form: error.message || "Unable to send OTP." });
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setForgotErrors({});
    setForgotSuccess("");

    const errors = {};
    if (forgotOtp.length !== 6) errors.otp = "Enter the 6-digit OTP.";
    if (newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters.";
    setForgotErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setForgotLoading(true);
    try {
      const res = await fetch(FORGOT_RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to reset password.");

      setForgotSuccess("Password reset successfully. You can log in now.");
      setForgotOtp("");
      setNewPassword("");
      setForgotOtpSent(false);

      setTimeout(() => {
        changeTab("login");
      }, 1500);
    } catch (error) {
      setForgotErrors({ form: error.message || "Unable to reset password." });
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="page-shell login-shell">
      <div className="bg-rings" aria-hidden="true">
        <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <circle
            cx="650"
            cy="120"
            r="300"
            fill="none"
            stroke="rgba(216,207,188,0.10)"
            strokeWidth="1.5"
          />
          <circle
            cx="650"
            cy="120"
            r="210"
            fill="none"
            stroke="rgba(216,207,188,0.10)"
            strokeWidth="1.5"
          />
          <circle
            cx="120"
            cy="700"
            r="240"
            fill="none"
            stroke="rgba(86,84,73,0.14)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="topbar">
        <div className="wrap topbar-inner">
          <Link className="back-link" to="/">
            <i className="bi bi-arrow-left"></i>
            Back to home
          </Link>
          <span className="brand-mark">KGSC · SINCE 1988</span>
        </div>
      </div>

      <main className="login-main">
        <div className="login-hero-wrap">
          <div className="login-badge">KG</div>
          <h1 className="login-hero-title">
            Kamlaba Garden
            <span>Sport Club</span>
          </h1>
          <p className="login-hero-lede">
            Log in to your member account, or sign up to join the club.
          </p>
        </div>

        <div className="auth-card">
          {tab !== "forgot" && (
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${tab === "login" ? "is-active" : ""}`}
                onClick={() => changeTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${tab === "signup" ? "is-active" : ""}`}
                onClick={() => changeTab("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          <h2 className="auth-card-title">
            {tab === "login"
              ? "Log in to your account"
              : tab === "forgot"
                ? "Reset your password"
                : signupStep === 1
                  ? "Verify your email"
                  : "Enter your details"}
          </h2>

          {tab !== "forgot" && apiError && (
            <p className="auth-api-error">{apiError}</p>
          )}

          {tab === "login" && (
            <form
              className="auth-panel is-active"
              onSubmit={handleLogin}
              autoComplete="off"
            >
              <div className="field">
                <label htmlFor="loginIdentifier">
                  Phone number or Member ID
                </label>
                <input
                  id="loginIdentifier"
                  type="text"
                  placeholder="e.g. 98765 43210 or KGSC-0001"
                  autoComplete="username"
                  value={loginData.identifier}
                  onChange={(e) =>
                    setLoginData({ ...loginData, identifier: e.target.value })
                  }
                  required
                />
                <span className="field-error">{loginErrors.identifier}</span>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="loginPassword">Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => changeTab("forgot")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="field-wrap">
                  <input
                    id="loginPassword"
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowLoginPass((v) => !v)}
                    tabIndex={-1}
                    aria-label={
                      showLoginPass ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`bi ${showLoginPass ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
                <span className="field-error">{loginErrors.password}</span>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div className="divider">
                <span>or</span>
              </div>
            </form>
          )}

          {tab === "signup" && (
            <form
              className="auth-panel is-active"
              onSubmit={handleSignup}
              autoComplete="off"
            >
              <div className="step-track">
                <div
                  className={`step-dot ${signupStep >= 1 ? "current" : ""} ${signupStep > 1 ? "done" : ""}`}
                ></div>
                <div className={`step-bar ${signupStep >= 2 ? "done" : ""}`}>
                  <span></span>
                </div>
                <div
                  className={`step-dot ${signupStep >= 2 ? "current" : ""}`}
                ></div>
              </div>
              <div className="step-label">Step {signupStep} of 2</div>

              {signupStep === 1 && (
                <div className="step active">
                  <div className="field">
                    <label htmlFor="signupEmail">Email address</label>
                    <input
                      id="signupEmail"
                      type="email"
                      placeholder="e.g. you@email.com"
                      autoComplete="email"
                      value={signupData.email}
                      onChange={handleEmailChange}
                      required
                    />
                    <span className="field-error">{signupErrors.email}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="otpInput">Enter OTP</label>
                    <div className="otp-inline-row">
                      <input
                        id="otpInput"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otpValue}
                        onChange={(e) =>
                          setOtpValue(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        disabled={!otpSent}
                      />
                      <button
                        type="button"
                        className="btn-next otp-inline-btn"
                        onClick={sendOTP}
                        disabled={otpLoading}
                      >
                        {otpLoading
                          ? "Sending..."
                          : otpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <button
                      type="button"
                      className="btn-next"
                      onClick={verifyOTP}
                      disabled={otpLoading || otpValue.length !== 6}
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  )}
                  <div className="divider">
                    <span>or</span>
                  </div>
                </div>
              )}

              {signupStep === 2 && (
                <div className="step active">
                  <div className="field">
                    <label htmlFor="signupName">Full name</label>
                    <input
                      id="signupName"
                      type="text"
                      placeholder="e.g. Tushar Pawar"
                      autoComplete="name"
                      value={signupData.name}
                      onChange={(e) =>
                        setSignupData({ ...signupData, name: e.target.value })
                      }
                      required
                    />
                    <span className="field-error">{signupErrors.name}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="signupPhone">Phone number</label>
                    <input
                      id="signupPhone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="e.g. 98765 43210"
                      autoComplete="tel"
                      value={signupData.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                    <span className="field-error">{signupErrors.phone}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="signupPassword">Create password</label>
                    <div className="field-wrap">
                      <input
                        id="signupPassword"
                        type={showSignupPass ? "text" : "password"}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        minLength={6}
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowSignupPass((v) => !v)}
                        tabIndex={-1}
                        aria-label={
                          showSignupPass ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`bi ${showSignupPass ? "bi-eye-slash" : "bi-eye"}`}
                        ></i>
                      </button>
                    </div>
                    <span className="field-error">{signupErrors.password}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="signupAadhar">Aadhar card number</label>
                    <input
                      id="signupAadhar"
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="e.g. 123456789012"
                      value={signupData.aadhar}
                      onChange={handleAadharChange}
                      required
                    />
                    <span className="field-error">{signupErrors.aadhar}</span>
                  </div>

                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn-back"
                      onClick={() => {
                        setSignupStep(1);
                        setApiError("");
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Joining..." : "Join the group"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {tab === "forgot" && (
            <form
              className="auth-panel is-active"
              onSubmit={handleResetPassword}
              autoComplete="off"
            >
              {forgotErrors.form && (
                <p className="auth-api-error">{forgotErrors.form}</p>
              )}
              {forgotSuccess && <p className="auth-success">{forgotSuccess}</p>}

              <div className="field">
                <label htmlFor="forgotEmail">Email address</label>
                <div className="otp-inline-row">
                  <input
                    id="forgotEmail"
                    type="email"
                    placeholder="e.g. you@email.com"
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-next otp-inline-btn"
                    onClick={sendForgotOtp}
                    disabled={forgotLoading}
                  >
                    {forgotLoading && !forgotOtpSent
                      ? "Sending..."
                      : forgotOtpSent
                        ? "Resend OTP"
                        : "Send OTP"}
                  </button>
                </div>
                <span className="field-error">{forgotErrors.email}</span>
              </div>

              {forgotOtpSent && (
                <>
                  <div className="field">
                    <label htmlFor="forgotOtp">Enter OTP</label>
                    <input
                      id="forgotOtp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={forgotOtp}
                      onChange={(e) =>
                        setForgotOtp(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      required
                    />
                    <span className="field-error">{forgotErrors.otp}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="newPassword">New password</label>
                    <div className="field-wrap">
                      <input
                        id="newPassword"
                        type={showNewPass ? "text" : "password"}
                        placeholder="Create a new password"
                        autoComplete="new-password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowNewPass((v) => !v)}
                        tabIndex={-1}
                        aria-label={
                          showNewPass ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`bi ${showNewPass ? "bi-eye-slash" : "bi-eye"}`}
                        ></i>
                      </button>
                    </div>
                    <span className="field-error">
                      {forgotErrors.newPassword}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Resetting..." : "Reset password"}
                  </button>
                </>
              )}

              <p className="auth-switch">
                Remembered your password?{" "}
                <button type="button" onClick={() => changeTab("login")}>
                  Log in instead
                </button>
              </p>
            </form>
          )}

          {tab !== "forgot" && (
            <p className="auth-switch">
              {tab === "login" ? (
                <>
                  New here?{" "}
                  <button type="button" onClick={() => changeTab("signup")}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => changeTab("login")}>
                    Log in instead
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        <footer className="login-footer">
          KAMLABA GARDEN SPORT CLUB — EST. 1988
        </footer>
      </main>
    </div>
  );
}
