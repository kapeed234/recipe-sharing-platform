import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

// Detect common email domain typos (e.g. gmai.com -> gmail.com)
const checkEmailTypo = (rawEmail) => {
  if (!rawEmail || !rawEmail.includes("@")) return null;
  const parts = rawEmail.split("@");
  if (parts.length !== 2) return null;
  const domain = parts[1].toLowerCase().trim();
  const typos = {
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.co": "gmail.com",
    "gmail.co": "gmail.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlok.com": "outlook.com"
  };
  if (typos[domain]) {
    return `${parts[0]}@${typos[domain]}`;
  }
  return null;
};

function Register({ onRegistered, onBack, initialEmail = "", initialStep = "register" }) {
  const [step, setStep] = useState(initialStep); // "register" | "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification state
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const suggestedEmail = checkEmailTypo(email);

  // Cooldown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle Initial Registration Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validations
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    // Typo alert check
    if (suggestedEmail) {
      const useSuggested = window.confirm(
        `It looks like you typed "${email}".\n\nDid you mean "${suggestedEmail}"?\n\nClick OK to use the corrected email or Cancel to keep "${email}".`
      );
      if (useSuggested) {
        setEmail(suggestedEmail);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.previewOtp) {
          setDevOtp(data.previewOtp);
          setOtp(data.previewOtp);
        } else {
          setDevOtp("");
        }
        setSuccessMessage(data.message || "Verification code sent to your email!");
        setStep("verify");
        setResendCooldown(60);
      } else {
        setErrorMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Code Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save session
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        setSuccessMessage("Email verified successfully! Redirecting...");

        setTimeout(() => {
          if (onRegistered) {
            onRegistered();
          } else if (onBack) {
            onBack();
          }
        }, 1200);
      } else {
        setErrorMessage(data.message || "Invalid or expired verification code.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.previewOtp) {
          setDevOtp(data.previewOtp);
          setOtp(data.previewOtp);
        } else {
          setDevOtp("");
        }
        setSuccessMessage(data.message || "A fresh verification code has been sent to your email!");
        setResendCooldown(60);
      } else {
        setErrorMessage(data.message || "Could not resend verification code.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-icon">🍴</span>
        <h1>Recipe Sharing Platform</h1>
      </div>

      <div className="auth-card">
        {step === "register" ? (
          <>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join our community to discover, share, and review delicious recipes.</p>

            {errorMessage && <div className="auth-alert error-alert">{errorMessage}</div>}
            {successMessage && <div className="auth-alert success-alert">{successMessage}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {suggestedEmail && (
                  <div style={{ marginTop: "6px", fontSize: "13px", color: "#b45309", background: "#fffbeb", padding: "6px 10px", borderRadius: "6px", border: "1px solid #fde68a" }}>
                    ⚠️ Typo detected? Did you mean <strong>{suggestedEmail}</strong>?{" "}
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1677f9",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontWeight: "600",
                        padding: 0
                      }}
                      onClick={() => setEmail(suggestedEmail)}
                    >
                      Click here to use {suggestedEmail}
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="field-hint error-hint">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "Sending Verification Code..." : "Create Account & Verify"}
              </button>
            </form>

            <div className="divider">
              <span></span>
              <p>or</p>
              <span></span>
            </div>

            <p className="register-text">Already have an account?</p>
            <button
              type="button"
              className="register-button"
              onClick={onBack}
            >
              🔑 Login to Existing Account
            </button>

            <div style={{ textAlign: "center", marginTop: "18px" }}>
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setStep("verify");
                }}
              >
                Have a pending verification code? Click here to verify
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Verify Your Email</h2>
            <p className="auth-subtitle">
              We sent a 6-digit verification code to: <br />
              <strong style={{ color: "#1677f9" }}>{email}</strong>
            </p>

            {errorMessage && <div className="auth-alert error-alert">{errorMessage}</div>}
            {successMessage && <div className="auth-alert success-alert">{successMessage}</div>}

            {devOtp && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  margin: "14px 0",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px" }}>
                  ⚡ DEMO / LOCAL FALLBACK CODE
                </div>
                <div style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
                  SMTP is not configured on the server. Your verification code is:
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "800",
                    color: "#2563eb",
                    letterSpacing: "4px",
                    marginTop: "6px"
                  }}
                >
                  {devOtp}
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label style={{ textAlign: "center", display: "block" }}>Enter 6-Digit Code</label>
                <div className="otp-input-wrapper">
                  <input
                    type="text"
                    className="otp-input"
                    placeholder="------"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus
                    required
                  />
                </div>
                <p className="field-hint" style={{ textAlign: "center" }}>
                  Code is valid for 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Activate Account"}
              </button>
            </form>

            <div className="resend-section">
              <p>Didn't receive the email?</p>
              {resendCooldown > 0 ? (
                <span className="cooldown-badge">Resend available in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  📨 Resend Verification Code
                </button>
              )}
            </div>

            <div className="divider">
              <span></span>
              <p>or</p>
              <span></span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setStep("register");
                }}
              >
                ✏️ Change Email / Edit Registration
              </button>
              <button
                type="button"
                className="text-link-btn"
                onClick={onBack}
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;