export default function UserSidebar({ page, setPage, onLogout }) {
  const items = [
    { id: "home",    label: "Home",       icon: "🏠" },
    { id: "ipl",     label: "IPL Live",   icon: "🔴" },
    { id: "games",   label: "Games",      icon: "🎮" },
    { id: "vip",     label: "VIP",        icon: "💎" },
    { id: "wallet",  label: "Wallet",     icon: "🪙" },
    { id: "profile", label: "Profile",    icon: "👤" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏏</div>
        <span className="sidebar-logo-text">Missio</span>
      </div>

      <div className="sidebar-label">Menu</div>

      {items.map((item) => (
        <div key={item.id}
          className={`sidebar-item${page === item.id ? " active" : ""}`}
          onClick={() => setPage(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
          {item.id === "ipl" && (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
              <span className="live-dot" />
            </span>
          )}
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
