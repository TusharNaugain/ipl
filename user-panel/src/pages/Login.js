import { useState } from "react";
import { api } from "../services/api";

export default function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (isRegister) {
        await api.post("/auth/register", { name, email, password, role: "USER" });
      }
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Login failed. Check credentials.");
    } finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "12px 14px", background: "#1a2236",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7,
    color: "#f0f4ff", fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0b0f1a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "radial-gradient(circle, #F2B824 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none"
      }} />

      <div style={{
        width: 420, padding: "40px 36px", background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
        boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(242,184,36,0.05)",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14, background: "#F2B824",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, marginBottom: 14, boxShadow: "0 8px 24px rgba(242,184,36,0.3)",
          }}>
            🎰
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f0f4ff", letterSpacing: 0.5 }}>MISSIO</div>
          <div style={{ fontSize: 13, color: "#5a6a85", marginTop: 4 }}>
            {isRegister ? "Create your betting account" : "Sign in to your account"}
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 7, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#e74c3c", display: "flex", gap: 8, alignItems: "center" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a8b4cc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={inp}
                onFocus={e => e.target.style.borderColor = "#F2B824"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a8b4cc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inp}
              onFocus={e => e.target.style.borderColor = "#F2B824"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a8b4cc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inp}
              onFocus={e => e.target.style.borderColor = "#F2B824"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", background: loading ? "#c9a020" : "#F2B824",
            border: "none", borderRadius: 8, fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", color: "#0b0f1a",
            fontFamily: "inherit", letterSpacing: 0.3,
            transition: "transform 0.1s, box-shadow 0.2s",
            boxShadow: "0 4px 20px rgba(242,184,36,0.35)",
          }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.transform = ""; }}
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#5a6a85" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ color: "#F2B824", fontWeight: 700, cursor: "pointer", marginLeft: 6 }}>
            {isRegister ? "Sign In" : "Register Free"}
          </span>
        </div>

        {/* Demo credentials chip */}
        {!isRegister && (
          <div style={{ marginTop: 16, textAlign: "center", padding: "10px 14px", background: "rgba(242,184,36,0.06)", border: "1px solid rgba(242,184,36,0.15)", borderRadius: 8, fontSize: 12, color: "#a8b4cc" }}>
            Demo: <span style={{ color: "#F2B824", fontWeight: 600 }}>user@missio.com</span> / <span style={{ color: "#F2B824", fontWeight: 600 }}>user123</span>
          </div>
        )}
      </div>
    </div>
  );
}
