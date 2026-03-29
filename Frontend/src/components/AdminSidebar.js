const ROLE_COLORS = { ADMIN: "purple", SMDL: "blue", MDL: "green", DL: "yellow" };

export default function AdminSidebar({ page, setPage, onLogout, role, onSwitchView }) {
  const items = [
    { id: "dashboard",   label: "Dashboard",   icon: "📊", roles: ["ADMIN","SMDL","MDL","DL"] },
    { id: "users",       label: "Users",        icon: "👥", roles: ["ADMIN","SMDL","MDL","DL"] },
    { id: "matches",     label: "Matches",      icon: "🏏", roles: ["ADMIN"] },
    { id: "predictions", label: "Predictions",  icon: "🎯", roles: ["ADMIN"] },
    { id: "wallet",      label: "Wallet",       icon: "🪙", roles: ["ADMIN","SMDL","MDL","DL"] },
  ].filter(i => i.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏏</div>
        <span className="sidebar-logo-text">Missio</span>
      </div>

      <div style={{
        margin: "0 8px 16px",
        padding: "6px 12px",
        borderRadius: 8,
        background: "rgba(108,99,255,0.12)",
        display: "flex", alignItems: "center", gap: 8
      }}>
        <span className={`badge ${ROLE_COLORS[role] || "purple"}`}>{role}</span>
        <span style={{ fontSize: 11, color: "var(--text-2)" }}>Admin Panel</span>
      </div>

      <div className="sidebar-label">Admin Menu</div>

      {items.map((item) => (
        <div key={item.id}
          className={`sidebar-item${page === item.id ? " active" : ""}`}
          onClick={() => setPage(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-label" style={{ marginTop: 8 }}>Switch</div>
      <div className="sidebar-item" onClick={onSwitchView} style={{ color: "#43e97b" }}>
        <span className="icon">🎮</span>
        User Panel View
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
