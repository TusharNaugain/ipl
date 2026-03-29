export default function Sidebar({ page, setPage, onLogout }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users",     label: "Users",     icon: "👥" },
    { id: "matches",   label: "Matches",   icon: "🏏" },
    { id: "wallet",    label: "Wallet",    icon: "🪙" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏏</div>
        <span className="sidebar-logo-text">Missio</span>
      </div>

      <div className="sidebar-label">Navigation</div>

      {items.map((item) => (
        <div
          key={item.id}
          className={`sidebar-item${page === item.id ? " active" : ""}`}
          onClick={() => setPage(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
