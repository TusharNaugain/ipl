import { useState } from "react";
import { api } from "../services/api";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      // Also store basic user info
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">🏏</div>
          <span className="login-logo-text">Missio</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your admin panel</p>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@missio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</>
          ) : "Sign In"}
        </button>
      </div>
    </div>
  );
}
