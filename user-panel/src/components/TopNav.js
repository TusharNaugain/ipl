import { useState, useEffect } from "react";

export default function TopNav({ page, setPage, activeNav, setActiveNav, onLogout }) {
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const loadBalance = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setBalance(user.coins || 0);
      if (user.username) setUsername(user.username);
    };
    loadBalance();
    window.addEventListener("balance_updated", loadBalance);
    return () => window.removeEventListener("balance_updated", loadBalance);
  }, []);

  return (
    <nav style={{
      height: 60,
      background: "linear-gradient(90deg, #1c1936 0%, #0e0d1a 100%)",
      display: "flex", alignItems: "center",
      padding: "0 20px", flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      zIndex: 1000,
      justifyContent: "space-between",
    }}>

      {/* Left: Logo */}
      <div onClick={() => { setActiveNav("home"); setPage("home"); }}
        style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none", gap: 6 }}>
        <span style={{
          fontSize: 28, fontWeight: 900, fontStyle: "italic",
          background: "linear-gradient(135deg, #f97316, #fbbf24)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -1, fontFamily: "'Inter', sans-serif"
        }}>
          Betlab
        </span>
      </div>

      {/* Right: Balance + User Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Balance */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#cbd5e1"
        }}>
          <span style={{ color: "#94a3b8" }}>Balance:</span>
          <span style={{ fontWeight: 800, color: "#f8fafc" }}>₹{balance.toLocaleString("en-IN")}</span>
        </div>

        {/* Deposit */}
        <button onClick={() => setPage("wallet")}
          style={{
            padding: "6px 18px", background: "#f97316", border: "none", borderRadius: 5,
            fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#fff",
            fontFamily: "inherit", letterSpacing: "0.3px", transition: "all 0.2s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ea6600"}
          onMouseLeave={e => e.currentTarget.style.background = "#f97316"}>
          Deposit
        </button>

        {/* User chip: [C9858] and green bolt icon */}
        <div onClick={() => setPage("profile")}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>[{username}]</span>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#16a34a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 0 0 2px rgba(22,163,74,0.4)"
          }}>
            ⚡
          </div>
        </div>

        {/* Logout */}
        <button onClick={onLogout}
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}
          title="Logout">
          ⎋
        </button>
      </div>
    </nav>
  );
}
