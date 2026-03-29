import { useState } from "react";

// ── GameHub — fair99/Fairplay Casino Style ────────────────────────────────────
const CATS = [
  { id: "all",     label: "All Games",    icon: "🎮" },
  { id: "indian",  label: "Indian Games", icon: "🇮🇳" },
  { id: "crash",   label: "Crash Games",  icon: "🚀" },
  { id: "table",   label: "Table Games",  icon: "🃏" },
  { id: "live",    label: "Live Casino",  icon: "🎰" },
  { id: "lottery", label: "Lottery",      icon: "🎟️" },
];

const GAMES = [
  // 🇮🇳 Indian Games
  { id: "teenPatti",   cat: "indian",  label: "Teen Patti",      sub: "Indian Poker",   icon: "🃏",  bg: "linear-gradient(135deg,#0d5a1a,#1a8a2a)", players: "18.2K", hot: true,  tag: "HOT" },
  { id: "andarBahar",  cat: "indian",  label: "Andar Bahar",     sub: "Card Game",      icon: "🎴",  bg: "linear-gradient(135deg,#1a0a2e,#4a1a6a)", players: "14.5K", hot: true,  tag: "HOT" },
  { id: "dragonTiger", cat: "indian",  label: "Dragon Tiger",    sub: "Card Showdown",  icon: "🐉",  bg: "linear-gradient(135deg,#1a0000,#600000)", players: "11.3K", hot: true,  tag: "HOT" },
  { id: "keno",        cat: "indian",  label: "Keno",            sub: "Number Draw",    icon: "🎟️", bg: "linear-gradient(135deg,#001a1a,#004a4a)", players: "6.7K",  hot: false, tag: "NEW" },
  // 🚀 Crash
  { id: "crash",       cat: "crash",   label: "Spribe Aviator Game",         sub: "Crash Game",     icon: "✈️",  bg: "linear-gradient(135deg,#1a0a2e,#5b2d8e)", players: "24.8K", hot: true,  tag: "HOT" },
  { id: "crash",       cat: "crash",   label: "Crash",           sub: "Multiplier",     icon: "🚀",  bg: "linear-gradient(135deg,#0d1117,#220e4a)", players: "12.4K", hot: true,  tag: "HOT" },
  { id: "limbo",       cat: "crash",   label: "Limbo",           sub: "Crash Game",     icon: "🌀",  bg: "linear-gradient(135deg,#0a1a2a,#0d3250)", players: "3.2K",  hot: false, tag: null  },
  // 🃏 Table Games
  { id: "teenPatti",   cat: "table",   label: "Teen Patti",      sub: "Indian Poker",   icon: "🃏",  bg: "linear-gradient(135deg,#0d5a1a,#1a8a2a)", players: "18.2K", hot: true,  tag: "HOT" },
  { id: "andarBahar",  cat: "table",   label: "Andar Bahar",     sub: "Card Game",      icon: "🎴",  bg: "linear-gradient(135deg,#1a0a2e,#4a1a6a)", players: "14.5K", hot: true,  tag: "HOT" },
  { id: "roulette",    cat: "table",   label: "Roulette",        sub: "Table Game",     icon: "🎡",  bg: "linear-gradient(135deg,#1a0a0a,#3a1010)", players: "6.4K",  hot: true,  tag: null  },
  { id: "dice",        cat: "table",   label: "Dice",            sub: "Table Game",     icon: "🎲",  bg: "linear-gradient(135deg,#0a0a1a,#202060)", players: "3.7K",  hot: false, tag: null  },
  { id: "spin",        cat: "table",   label: "Spin Wheel",      sub: "Fortune Wheel",  icon: "🌀",  bg: "linear-gradient(135deg,#001a1a,#003a3a)", players: "2.3K",  hot: false, tag: null  },
  { id: "color",       cat: "table",   label: "Color Prediction",sub: "Prediction",     icon: "🎨",  bg: "linear-gradient(135deg,#0a0a1a,#101050)", players: "7.8K",  hot: true,  tag: "HOT" },
  // 🎰 Live Casino
  { id: "dragonTiger", cat: "live",    label: "Live Dragon Tiger",sub: "Live Dealer",   icon: "🐉",  bg: "linear-gradient(135deg,#1a0000,#600000)", players: "11.3K", hot: true,  tag: "HOT" },
  { id: "roulette",    cat: "live",    label: "Live Roulette",   sub: "Live Dealer",    icon: "🎡",  bg: "linear-gradient(135deg,#1a0000,#500000)", players: "3.1K",  hot: false, tag: null  },
  { id: "teenPatti",   cat: "live",    label: "Live Teen Patti", sub: "Live Dealer",    icon: "🃏",  bg: "linear-gradient(135deg,#0d5a1a,#005000)", players: "9.4K",  hot: true,  tag: "HOT" },
  { id: "andarBahar",  cat: "live",    label: "Live Andar Bahar",sub: "Live Dealer",    icon: "🎴",  bg: "linear-gradient(135deg,#1a0a2e,#002a50)", players: "7.2K",  hot: false, tag: null  },
  { id: "color",       cat: "live",    label: "Live Baccarat",   sub: "Live Dealer",    icon: "🎴",  bg: "linear-gradient(135deg,#000a1a,#001a50)", players: "2.6K",  hot: false, tag: null  },
  // 🎟️ Lottery
  { id: "keno",        cat: "lottery", label: "Keno",            sub: "Number Draw",    icon: "🎟️", bg: "linear-gradient(135deg,#001a1a,#004a4a)", players: "6.7K",  hot: false, tag: "NEW" },
  { id: "color",       cat: "lottery", label: "Wingo",           sub: "Lottery",        icon: "🎲",  bg: "linear-gradient(135deg,#1a0a2e,#3a105a)", players: "9.2K",  hot: true,  tag: "HOT" },
  { id: "spin",        cat: "lottery", label: "K3 Lottery",      sub: "Lottery",        icon: "🎰",  bg: "linear-gradient(135deg,#0a1a0a,#2a4a0a)", players: "4.5K",  hot: false, tag: null  },
  { id: "number",      cat: "lottery", label: "5D Lottery",      sub: "Lottery",        icon: "🔢",  bg: "linear-gradient(135deg,#1a1000,#4a3000)", players: "3.8K",  hot: false, tag: "NEW" },
];

function GameCard({ g, setPage }) {
  return (
    <div onClick={() => setPage(g.id)}
      style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "#141e30", border: "1px solid rgba(255,255,255,0.07)", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5)"; e.currentTarget.style.borderColor = "rgba(242,184,36,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <div style={{ height: 110, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: 40 }}>{g.icon}</span>
        {g.tag === "HOT" && <div style={{ position: "absolute", top: 8, left: 8, background: "#e74c3c", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>🔥 HOT</div>}
        {g.tag === "NEW" && <div style={{ position: "absolute", top: 8, left: 8, background: "#2ecc71", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4 }}>✨ NEW</div>}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff" }}>{g.label}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: "#5a6a85" }}>{g.sub}</span>
          <span style={{ fontSize: 10, color: "#2ecc71", fontWeight: 600 }}>👤 {g.players}</span>
        </div>
      </div>
    </div>
  );
}

export default function GameHub({ setPage }) {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? GAMES : GAMES.filter(g => g.cat === cat);
  const hot = GAMES.filter(g => g.hot && g.cat !== "indian").slice(0, 6);
  const indianHot = GAMES.filter(g => g.cat === "indian").slice(0, 4);

  return (
    <div style={{ marginLeft: -20, marginRight: -20, marginTop: -20 }}>
      {/* Category tabs */}
      <div style={{ display: "flex", overflowX: "auto", background: "#111827", borderBottom: "2px solid rgba(255,255,255,0.07)", padding: "0 8px", gap: 0 }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: cat === c.id ? "2px solid #F2B824" : "2px solid transparent", marginBottom: -2, color: cat === c.id ? "#F2B824" : "#5a6a85", fontWeight: cat === c.id ? 800 : 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s" }}
            onMouseEnter={e => { if (cat !== c.id) e.currentTarget.style.color = "#a8b4cc"; }}
            onMouseLeave={e => { if (cat !== c.id) e.currentTarget.style.color = "#5a6a85"; }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Indian Games section (on All tab) */}
        {cat === "all" && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 18, background: "#F2B824", borderRadius: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>🇮🇳 Indian Casino Games</span>
              </div>
              <button onClick={() => setCat("indian")} style={{ background: "none", border: "1px solid rgba(242,184,36,0.3)", color: "#F2B824", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>See All</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {indianHot.map((g, i) => <GameCard key={i} g={g} setPage={setPage} />)}
            </div>
          </div>
        )}

        {/* HOT & Trending (on All tab) */}
        {cat === "all" && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 18, background: "#F2B824", borderRadius: 2 }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>🔥 HOT & TRENDING</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {hot.map((g, i) => <GameCard key={i} g={g} setPage={setPage} />)}
            </div>
          </div>
        )}

        {/* Main grid */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 4, height: 18, background: "#F2B824", borderRadius: 2 }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>
              {cat === "all" ? "🎮 All Games" : CATS.find(c => c.id === cat)?.icon + " " + CATS.find(c => c.id === cat)?.label}
            </span>
            <span style={{ fontSize: 11, color: "#5a6a85" }}>{filtered.length} games</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {filtered.map((g, i) => <GameCard key={i} g={g} setPage={setPage} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
