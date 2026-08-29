import { useState } from "react";

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const response = await fetch(
        "https://recipe-sharing-platform-d6x4.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }

        setMessage("Login successful!");

        if (onLogin) {
          onLogin();
        }
      } else {
        setMessage(
          data.message || "Invalid email or password"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <div className="auth-page">

      {/* Website Logo / Title */}
      <div className="auth-brand">
        <span className="brand-icon">🍴</span>
        <h1>Recipe Sharing Platform</h1>
      </div>

      {/* Login Card */}
      <div className="auth-card">

        <h2>Login</h2>

        <p className="auth-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label>Email address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        {/* Register */}
        <p className="register-text">
          Don't have an account?
        </p>

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