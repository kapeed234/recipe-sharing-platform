import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function Login({ onLogin, onRegister, onVerifyEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    setIsError(false);
    setUnverifiedEmail("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful!");
        setIsError(false);
        if (onLogin) onLogin();
      } else {
        setIsError(true);
        setMessage(data.message || "Invalid email or password");
        if (data.requiresVerification && data.email) {
          setUnverifiedEmail(data.email);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsError(true);
      setMessage("Unable to connect to server. Please check your connection.");
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
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back! Please login to continue.</p>

        {message && (
          <div className={`auth-alert ${isError ? "error-alert" : "success-alert"}`}>
            {message}
          </div>
        )}

        {unverifiedEmail && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button
              type="button"
              className="verify-now-btn"
              onClick={() => onVerifyEmail ? onVerifyEmail(unverifiedEmail) : onRegister()}
            >
              ✉️ Enter Verification Code for {unverifiedEmail}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <p className="register-text">Don't have an account?</p>
        <button
          type="button"
          className="register-button"
          onClick={onRegister}
        >
          👤 Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;
