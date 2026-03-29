import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import UserSidebar from "./components/UserSidebar";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminWallet from "./pages/admin/AdminWallet";

// User pages
import Home from "./pages/user/Home";
import IPLLive from "./pages/user/IPLLive";
import GameHub from "./pages/user/GameHub";
import ColorPrediction from "./pages/user/games/ColorPrediction";
import DiceGame from "./pages/user/games/DiceGame";
import SpinWheel from "./pages/user/games/SpinWheel";
import VIP from "./pages/user/VIP";
import Profile from "./pages/user/Profile";
import UserWallet from "./pages/user/UserWallet";

import Login from "./pages/Login";

const ADMIN_ROLES = ["ADMIN", "SMDL", "MDL", "DL"];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [viewMode, setViewMode] = useState("admin"); // "admin" | "user"

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setPage("dashboard");
    setViewMode("admin");
  };

  if (!token) return <Login setToken={setToken} />;

  const user = getUser();
  const isAdmin = ADMIN_ROLES.includes(user.role);

  // ─── Admin Panel ─────────────────────────────────────────────────────────
  if (isAdmin && viewMode === "admin") {
    const renderAdminPage = () => {
      switch (page) {
        case "users":       return <AdminUsers />;
        case "matches":     return <AdminMatches />;
        case "predictions": return <AdminPredictions />;
        case "wallet":      return <AdminWallet />;
        default:            return <AdminDashboard />;
      }
    };
    return (
      <div className="app">
        <AdminSidebar page={page} setPage={setPage} onLogout={handleLogout} role={user.role}
          onSwitchView={() => { setViewMode("user"); setPage("home"); }} />
        <div className="main-content">{renderAdminPage()}</div>
      </div>
    );
  }

  // ─── User Panel ───────────────────────────────────────────────────────────
  const renderUserPage = () => {
    switch (page) {
      case "ipl":     return <IPLLive />;
      case "games":   return <GameHub setPage={setPage} />;
      case "color":   return <ColorPrediction setPage={setPage} />;
      case "dice":    return <DiceGame setPage={setPage} />;
      case "spin":    return <SpinWheel setPage={setPage} />;
      case "vip":     return <VIP />;
      case "profile": return <Profile />;
      case "wallet":  return <UserWallet />;
      default:        return <Home setPage={setPage} />;
    }
  };
  return (
    <div className="app">
      <UserSidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {isAdmin && viewMode === "user" && (
          <div style={{
            background: "rgba(67,233,123,0.1)", borderBottom: "1px solid rgba(67,233,123,0.25)",
            padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: 13, color: "#43e97b"
          }}>
            <span>👁 Admin Preview: User Panel</span>
            <button className="btn" onClick={() => { setViewMode("admin"); setPage("dashboard"); }}
              style={{ padding: "4px 14px", fontSize: 12, background: "rgba(67,233,123,0.1)", border: "1px solid rgba(67,233,123,0.3)", color: "#43e97b" }}>
              ← Back to Admin Panel
            </button>
          </div>
        )}
        <div className="main-content">{renderUserPage()}</div>
      </div>
    </div>
  );
}
