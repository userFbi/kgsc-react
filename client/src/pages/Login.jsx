import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_URL = "http://localhost:5050/api/auth";

// OTP / Signup APIs
const SEND_OTP_API_URL = `${API_URL}/send-otp`;
const VERIFY_OTP_API_URL = `${API_URL}/verify-otp`;
const SIGNUP_API_URL = "http://localhost:5050/api/submit";

export default function Login() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // =========================
  // LOGIN
  // =========================
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [loginErrors, setLoginErrors] = useState({});

  const [showLoginPass, setShowLoginPass] = useState(false);

  // =========================
  // SIGNUP
  // =========================
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

  // =========================
  // OTP
  // =========================
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // =========================
  // SESSION
  // =========================
  function saveSessionAndRedirect(data) {
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    if (data.user?.role === "admin") {
      navigate("/admin");
    } else if (data.user?.role === "manager") {
      navigate("/manager");
    } else {
      navigate("/dashboard");
    }
  }

  // =========================
  // CHANGE TAB
  // =========================
  function changeTab(selectedTab) {
    setTab(selectedTab);
    setApiError("");
    setSignupErrors({});
    setLoginErrors({});

    if (selectedTab === "signup") {
      setSignupStep(1);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(["", "", "", "", "", ""]);
    }
  }

  // =========================
  // LOGIN
  // =========================
  async function handleLogin(e) {
    e.preventDefault();

    setApiError("");

    const errors = {};

    if (!loginData.identifier.trim()) {
      errors.identifier = "Enter your phone number or Member ID.";
    }

    if (!loginData.password.trim()) {
      errors.password = "Enter your password.";
    }

    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: loginData.identifier.trim(),
          password: loginData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Login failed. Please check your details.",
        );
      }

      saveSessionAndRedirect(data);
    } catch (error) {
      setApiError(error.message || "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // PHONE INPUT
  // =========================
  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setSignupData({
      ...signupData,
      phone: value,
    });

    setOtpVerified(false);
  }

  // =========================
  // AADHAR INPUT
  // =========================
  function handleAadharChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);

    setSignupData({
      ...signupData,
      aadhar: value,
    });
  }

  // =========================
  // SEND OTP
  // =========================
  async function sendOTP() {
    setSignupErrors({});

    const phone = signupData.phone.trim();

    if (!/^\d{10}$/.test(phone)) {
      setSignupErrors({
        phone: "Enter a valid 10-digit phone number.",
      });
      return;
    }

    setOtpLoading(true);
    setApiError("");

    try {
      const res = await fetch(SEND_OTP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp(["", "", "", "", "", ""]);

      setApiError(data.message || "OTP sent to your phone.");
    } catch (error) {
      setApiError(error.message || "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  }

  // =========================
  // OTP INPUT
  // =========================
  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);

      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  // =========================
  // OTP KEYBOARD
  // =========================
  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const previousInput = document.getElementById(`otp-${index - 1}`);

      if (previousInput) {
        previousInput.focus();
      }
    }
  }

  // =========================
  // OTP PASTE
  // =========================
  function handleOtpPaste(e) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 6) - 1;

    const input = document.getElementById(`otp-${focusIndex}`);

    if (input) {
      input.focus();
    }
  }

  // =========================
  // VERIFY OTP
  // =========================
  async function verifyOTP() {
    const phone = signupData.phone.trim();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setApiError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    setApiError("");

    try {
      const res = await fetch(VERIFY_OTP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          otp: otpValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      setOtpVerified(true);
      setSignupStep(2);
      setApiError("");
    } catch (error) {
      setApiError(error.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  }

  // =========================
  // SIGNUP
  // =========================
  async function handleSignup(e) {
    e.preventDefault();

    setApiError("");

    const errors = {};

    if (!otpVerified) {
      setApiError("Please verify your phone number first.");
      return;
    }

    if (!signupData.name.trim()) {
      errors.name = "Enter your full name.";
    }

    if (signupData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!/^\d{12}$/.test(signupData.aadhar)) {
      errors.aadhar = "Aadhar number must be exactly 12 digits.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    setSignupErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupData.name.trim(),
          phone: signupData.phone.trim(),
          password: signupData.password,
          aadhar: signupData.aadhar,
          email: signupData.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Unable to create account.",
        );
      }

      // If backend directly logs user in
      if (data.token) {
        saveSessionAndRedirect(data);
        return;
      }

      // Otherwise show success and stay on page
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
      setOtp(["", "", "", "", "", ""]);
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // GOOGLE LOGIN
  // =========================
  async function handleGoogleSuccess(credentialResponse) {
    setApiError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Google sign-in failed.");
      }

      saveSessionAndRedirect(data);
    } catch (error) {
      setApiError(error.message || "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="page-shell login-shell">
      {/* BACKGROUND */}
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

      {/* =========================
          TOPBAR - SAME AS BEFORE
          ========================= */}
      <div className="topbar">
        <div className="wrap topbar-inner">
          <Link className="back-link" to="/">
            <i className="bi bi-arrow-left"></i>
            Back to home
          </Link>

          <span className="brand-mark">KGSC · SINCE 1988</span>
        </div>
      </div>

      {/* =========================
          MAIN
          ========================= */}
      <main className="login-main">
        <div className="auth-card">
          {/* HEADER */}
          <div className="auth-head">
            <span className="eyebrow">Members area</span>

            <h1>Welcome to KGSC</h1>
          </div>

          {/* TABS */}
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
              Sign up
            </button>
          </div>

          {/* API MESSAGE */}
          {apiError && <p className="auth-api-error">{apiError}</p>}

          {/* =================================================
              LOGIN
              ================================================= */}
          {tab === "login" && (
            <form
              className="auth-panel is-active"
              onSubmit={handleLogin}
              autoComplete="off"
            >
              {/* IDENTIFIER */}
              <div className="field">
                <label htmlFor="loginIdentifier" className="login-label">
                  Phone number or Member ID
                </label>

                <div className="field-input-wrap">
                  <i className="bi bi-person-fill"></i>

                  <input
                    id="loginIdentifier"
                    type="text"
                    placeholder="9876543210 or KGSC-0001"
                    autoComplete="username"
                    value={loginData.identifier}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        identifier: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <span className="field-error">{loginErrors.identifier}</span>
              </div>

              {/* PASSWORD */}
              <div className="field">
                <label htmlFor="loginPassword" className="login-label">
                  Password
                </label>

                <div className="field-input-wrap">
                  <i className="bi bi-lock-fill"></i>

                  <input
                    id="loginPassword"
                    type={showLoginPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    type="button"
                    className="field-eye-toggle"
                    onClick={() => setShowLoginPass((value) => !value)}
                    tabIndex={-1}
                    aria-label={
                      showLoginPass ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`bi ${
                        showLoginPass ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>

                <span className="field-error">{loginErrors.password}</span>
              </div>

              {/* LOGIN BUTTON */}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>

              {/* DIVIDER */}
              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* GOOGLE */}
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
                <button type="button" onClick={() => changeTab("signup")}>
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* =================================================
              SIGNUP
              ================================================= */}
          {tab === "signup" && (
            <form
              className="auth-panel is-active"
              onSubmit={handleSignup}
              autoComplete="off"
            >
              {/* STEP INDICATOR */}
              <div className="signup-step-indicator">
                <div
                  className={`signup-step-dot ${
                    signupStep >= 1 ? "active" : ""
                  }`}
                >
                  1
                </div>

                <div
                  className={`signup-step-line ${
                    signupStep >= 2 ? "active" : ""
                  }`}
                ></div>

                <div
                  className={`signup-step-dot ${
                    signupStep >= 2 ? "active" : ""
                  }`}
                >
                  2
                </div>
              </div>

              <div className="signup-step-label">Step {signupStep} of 2</div>

              {/* =================================================
                  STEP 1
                  ================================================= */}
              {signupStep === 1 && (
                <>
                  {/* PHONE */}
                  <div className="field">
                    <label htmlFor="signupPhone" className="login-label">
                      Phone number
                    </label>

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
                        onChange={handlePhoneChange}
                        required
                      />
                    </div>

                    <span className="field-error">{signupErrors.phone}</span>
                  </div>

                  {/* SEND OTP */}
                  <button
                    type="button"
                    className="auth-submit"
                    onClick={sendOTP}
                    disabled={otpLoading}
                  >
                    {otpLoading
                      ? "Sending OTP..."
                      : otpSent
                        ? "Resend OTP"
                        : "Send OTP"}
                  </button>

                  {/* OTP */}
                  {otpSent && (
                    <div className="otp-section">
                      <div className="field">
                        <label className="login-label">Enter OTP</label>

                        <div className="otp-row">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              className="otp-input"
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={index === 0 ? handleOtpPaste : undefined}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="otp-status">OTP sent to your phone.</p>

                      <button
                        type="button"
                        className="auth-submit"
                        onClick={verifyOTP}
                        disabled={otpLoading}
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  )}

                  {/* DIVIDER */}
                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  {/* GOOGLE */}
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
                </>
              )}

              {/* =================================================
                  STEP 2
                  ================================================= */}
              {signupStep === 2 && (
                <>
                  {/* NAME */}
                  <div className="field">
                    <label htmlFor="signupName" className="login-label">
                      Full name
                    </label>

                    <div className="field-input-wrap">
                      <i className="bi bi-person-fill"></i>

                      <input
                        id="signupName"
                        type="text"
                        placeholder="e.g. Tushar Pawar"
                        autoComplete="name"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <span className="field-error">{signupErrors.name}</span>
                  </div>

                  {/* PASSWORD */}
                  <div className="field">
                    <label htmlFor="signupPassword" className="login-label">
                      Create password
                    </label>

                    <div className="field-input-wrap">
                      <i className="bi bi-lock-fill"></i>

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
                        className="field-eye-toggle"
                        onClick={() => setShowSignupPass((value) => !value)}
                        tabIndex={-1}
                        aria-label={
                          showSignupPass ? "Hide password" : "Show password"
                        }
                      >
                        <i
                          className={`bi ${
                            showSignupPass ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    <span className="field-error">{signupErrors.password}</span>
                  </div>

                  {/* AADHAR */}
                  <div className="field">
                    <label htmlFor="signupAadhar" className="login-label">
                      Aadhar card number
                    </label>

                    <div className="field-input-wrap">
                      <i className="bi bi-card-text"></i>

                      <input
                        id="signupAadhar"
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="12-digit Aadhar number"
                        value={signupData.aadhar}
                        onChange={handleAadharChange}
                        required
                      />
                    </div>

                    <span className="field-error">{signupErrors.aadhar}</span>
                  </div>

                  {/* EMAIL */}
                  <div className="field">
                    <label htmlFor="signupEmail" className="login-label">
                      Email ID
                    </label>

                    <div className="field-input-wrap">
                      <i className="bi bi-envelope-fill"></i>

                      <input
                        id="signupEmail"
                        type="email"
                        placeholder="you@email.com"
                        autoComplete="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <span className="field-error">{signupErrors.email}</span>
                  </div>

                  {/* BUTTONS */}
                  <div className="signup-button-row">
                    <button
                      type="button"
                      className="signup-back-btn"
                      onClick={() => {
                        setSignupStep(1);
                        setApiError("");
                      }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="auth-submit"
                      disabled={loading}
                    >
                      {loading ? "Joining..." : "Join the group"}
                    </button>
                  </div>
                </>
              )}

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => changeTab("login")}>
                  Log in instead
                </button>
              </p>
            </form>
          )}

          <p className="auth-note">
            New accounts are reviewed by the club before access is granted.
          </p>
        </div>
      </main>
    </div>
  );
}
