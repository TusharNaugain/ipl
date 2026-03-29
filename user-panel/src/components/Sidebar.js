import { useState } from "react";
// ── Left Sidebar — Fair99.in style ────────────────────────────────────────────
const sportItems = [
  { id: "live",  icon: "▶", label: "Inplay",         liveTag: true  },
  { id: "ipl",   icon: "🏏", label: "Cricket",        count: 28      },
  { id: "soccer",icon: "⚽", label: "Football",       count: 142     },
  { id: "tennis",icon: "🎾", label: "Tennis",         count: 56      },
  { id: "kabaddi",icon: "🤼", label: "Kabaddi",       count: 6       },
  { id: "home",  icon: "📚", label: "Sports Book",    count: 210     },
  { id: "horseracing", icon: "🏇", label: "Horse Race", count: 12   },
  { id: "greyhound",   icon: "🐕", label: "Greyhound Racing", count: 33 },
  { id: "slots",       icon: "🎰", label: "Slot",     count: 89      },
];

// Featured match cards data
const featuredMatches = [
  {
    sport: "Cricket",
    league: "ICC Women's Cricket World Cup",
    team1: "Australia W",
    team2: "India W",
    status: "Inplay",
  },
  {
    sport: "Football",
    league: "Premier League",
    team1: "Chelsea",
    team2: "Liverpool",
    status: "Upcoming",
  },
];

function FeaturedCard({ match, idx, total }) {
  if (!match) return null;
  return (
    <div style={{ background: "#1e1b3a", borderRadius: 6, padding: 12, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {match.sport} : {match.league}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: match.status === "Inplay" ? "#dc2626" : "#1d4ed8",
          color: "#fff", padding: "2px 7px", borderRadius: 3, letterSpacing: "0.3px"
        }}>
          {match.status}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "#cbd5e1", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>F</span>
        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "#cbd5e1", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>B</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.6 }}>
        {match.team1}<br />{match.team2}
      </div>
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{idx + 1} / {total}</div>
    </div>
  );
}

function SBItem({ icon, label, count, liveTag, active, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 16px", cursor: onClick ? "pointer" : "default",
        color: active ? "#1e293b" : "#374151",
        background: active ? "#e2e8f0" : "transparent",
        borderLeft: active ? "3px solid #f97316" : "3px solid transparent",
        fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.15s ease", gap: 8,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f1f5f9"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </span>
      {liveTag && <span style={{ fontSize: 9, background: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>LIVE</span>}
      {count != null && <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0, background: "#e5e7eb", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{count}</span>}
    </div>
  );
}

export default function Sidebar({ page, setPage, activeNav, onLogout }) {
  const [featuredIdx, setFeaturedIdx] = useState(0);

  return (
    <aside style={{
      width: 230, minWidth: 230, height: "100%",
      background: "#f3f4f6",
      borderRight: "1px solid #e2e8f0",
      display: "flex", flexDirection: "column",
      overflowY: "auto", overflowX: "hidden",
    }}>

      {/* Featured Games Header */}
      <div style={{ padding: "10px 12px 0", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Featured Games</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => setFeaturedIdx(i => (i - 1 + featuredMatches.length) % featuredMatches.length)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: "0 2px" }}>‹</button>
          <span style={{ fontSize: 10, color: "#6b7280" }}>{featuredIdx + 1} / {featuredMatches.length}</span>
          <button onClick={() => setFeaturedIdx(i => (i + 1) % featuredMatches.length)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: "0 2px" }}>›</button>
        </div>
      </div>

      {/* Featured Match Card */}
      <div style={{ padding: "6px 10px 10px" }}>
        <FeaturedCard match={featuredMatches[featuredIdx]} idx={featuredIdx} total={featuredMatches.length} />
      </div>

      {/* Sports Nav */}
      <div style={{ flex: 1 }}>
        {sportItems.map((item, i) => (
          <SBItem key={i} {...item} active={page === item.id}
            onClick={item.id ? () => setPage(item.id) : null} />
        ))}
      </div>

      {/* Footer Account */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "8px 0" }}>
        <SBItem icon="💳" label="Wallet" active={page === "wallet"} onClick={() => setPage("wallet")} />
        <SBItem icon="⚙️" label="Account" active={page === "profile"} onClick={() => setPage("profile")} />
      </div>
    </aside>
  );
}
