import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function Register({ onRegistered, onBack, initialEmail = "" }) {
  const [step, setStep] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password) return setErrorMessage("Please fill in all required fields.");
    if (password.length < 6) return setErrorMessage("Password must be at least 6 characters long.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match. Please re-enter.");

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || "Registration failed. Please try again.");
        return;
      }
      setStep("verify");
      setSuccessMessage("A 6-digit verification code has been sent to your email.");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Unable to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!/^\d{6}$/.test(code)) return setErrorMessage("Please enter the 6-digit verification code.");

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || "Invalid verification code.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMessage("Email verified successfully! Redirecting...");
      setTimeout(() => onRegistered?.(), 700);
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand"><span className="brand-icon">🍴</span><h1>Recipe Sharing Platform</h1></div>
      <div className="auth-card">
        {step === "register" ? (
          <>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join our community to discover, share, and review delicious recipes.</p>
            {errorMessage && <div className="auth-alert error-alert">{errorMessage}</div>}
            {successMessage && <div className="auth-alert success-alert">{successMessage}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-group"><label>Full Name</label><div className="input-wrapper"><span className="input-icon">👤</span><input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required /></div></div>
              <div className="form-group"><label>Email Address</label><div className="input-wrapper"><span className="input-icon">✉</span><input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div>
              <div className="form-group"><label>Password</label><div className="input-wrapper"><span className="input-icon">🔒</span><input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">{showPassword ? "👁️" : "👁️‍🗨️"}</button></div></div>
              <div className="form-group"><label>Confirm Password</label><div className="input-wrapper"><span className="input-icon">🔒</span><input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /><button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</button></div></div>
              <button type="submit" className="login-button" disabled={loading}>{loading ? "Sending Code..." : "Create Account"}</button>
            </form>
            <div className="divider"><span></span><p>or</p><span></span></div>
            <p className="register-text">Already have an account?</p><button type="button" className="register-button" onClick={onBack}>🔑 Login to Existing Account</button>
          </>
        ) : (
          <>
            <h2>Verify Your Email</h2>
            <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
            {errorMessage && <div className="auth-alert error-alert">{errorMessage}</div>}
            {successMessage && <div className="auth-alert success-alert">{successMessage}</div>}
            <form onSubmit={handleVerify}>
              <div className="form-group"><label>Verification Code</label><input type="text" inputMode="numeric" maxLength="6" placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required autoFocus /></div>
              <button type="submit" className="login-button" disabled={loading}>{loading ? "Verifying..." : "Verify Email"}</button>
            </form>
            <button type="button" className="register-button" onClick={() => { setStep("register"); setCode(""); setErrorMessage(""); setSuccessMessage(""); }}>← Back to Registration</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
