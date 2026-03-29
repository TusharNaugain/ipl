// ── Live Casino — Parimatch style ─────────────────────────────────────────────
import { useState } from "react";

const CATEGORIES = ["All", "Andar Bahar", "Teen Patti", "Dragon Tiger", "Roulette", "Baccarat", "Crash", "Others"];

const LIVE_GAMES = [
  { id: "andarBahar",  label: "Andar Bahar",           cat: "Andar Bahar", icon:"🎴", bg:"linear-gradient(135deg,#1a0a2e,#4a1a6a)", players:"14.5K", hot:true  },
  { id: "teenPatti",   label: "Bet on Teen Patti",      cat: "Teen Patti",  icon:"🃏", bg:"linear-gradient(135deg,#0d5a1a,#1a8a2a)", players:"18.2K", hot:true  },
  { id: "livecasino",  label: "Lucky 7",                cat: "Others",      icon:"7️⃣",bg:"linear-gradient(135deg,#1a1a0a,#5a5a1a)", players:"9.1K",  hot:false },
  { id: "roulette",    label: "Namaste Roulette",       cat: "Roulette",    icon:"🎡", bg:"linear-gradient(135deg,#1a0a0a,#5a1a1a)", players:"6.4K",  hot:false },
  { id: "dragonTiger", label: "Dragon Tiger",           cat: "Dragon Tiger",icon:"🐉", bg:"linear-gradient(135deg,#1a0000,#600000)", players:"11.3K", hot:true  },
  { id: "livecasino",  label: "Ultimate Sic Bo",        cat: "Others",      icon:"🎲", bg:"linear-gradient(135deg,#0a0a1a,#202060)", players:"3.2K",  hot:false },
  { id: "andarBahar",  label: "Ultimate Andar Bahar",   cat: "Andar Bahar", icon:"🎴", bg:"linear-gradient(135deg,#2a0a0a,#6a2a2a)", players:"7.8K",  hot:false },
  { id: "livecasino",  label: "Cricket War",            cat: "Others",      icon:"🏏", bg:"linear-gradient(135deg,#0a2a0a,#1a6a1a)", players:"5.5K",  hot:false },
  { id: "teenPatti",   label: "Teen Patti",             cat: "Teen Patti",  icon:"🃏", bg:"linear-gradient(135deg,#2a0a2e,#6a1a6a)", players:"9.4K",  hot:true  },
  { id: "andarBahar",  label: "Andar Bahar",            cat: "Andar Bahar", icon:"🎴", bg:"linear-gradient(135deg,#2a0a1a,#6a1a4a)", players:"8.1K",  hot:false },
  { id: "livecasino",  label: "Ice Fishing",            cat: "Others",      icon:"🎣", bg:"linear-gradient(135deg,#0a1a2a,#1a4a6a)", players:"4.8K",  hot:false },
  { id: "livecasino",  label: "Mega Fire Blaze Live",   cat: "Others",      icon:"🔥", bg:"linear-gradient(135deg,#2a1a0a,#6a3a0a)", players:"3.9K",  hot:false },
  { id: "livecasino",  label: "Gravity Wheel",          cat: "Others",      icon:"🎡", bg:"linear-gradient(135deg,#0a2a2a,#0a6a6a)", players:"2.8K",  hot:false },
  { id: "livecasino",  label: "Cricket Roulette",       cat: "Roulette",    icon:"🏏", bg:"linear-gradient(135deg,#0a2a0a,#0a6a2a)", players:"7.2K",  hot:true  },
  { id: "livecasino",  label: "Adventures Beyond Wlnd", cat: "Others",      icon:"🌀", bg:"linear-gradient(135deg,#1a0a2e,#4a2a6e)", players:"5.1K",  hot:false },
  { id: "roulette",    label: "XXXtreme Lightning Rlt.", cat: "Roulette",   icon:"⚡", bg:"linear-gradient(135deg,#2a2a0a,#6a6a0a)", players:"4.3K",  hot:false },
  { id: "roulette",    label: "Lightning Roulette",     cat: "Roulette",    icon:"⚡", bg:"linear-gradient(135deg,#1a1a0a,#4a4a0a)", players:"6.8K",  hot:true  },
  { id: "livecasino",  label: "Crazy Time",             cat: "Others",      icon:"🎪", bg:"linear-gradient(135deg,#2a0a2a,#7a0a7a)", players:"24.8K", hot:true  },
  { id: "roulette",    label: "Ultimate Roulette",      cat: "Roulette",    icon:"🎡", bg:"linear-gradient(135deg,#2a0a0a,#7a0a0a)", players:"3.5K",  hot:false },
  { id: "roulette",    label: "Red Door Roulette",      cat: "Roulette",    icon:"🚪", bg:"linear-gradient(135deg,#3a0a0a,#9a0a0a)", players:"2.9K",  hot:false },
];

function GameCard({ g, setPage }) {
  return (
    <div onClick={() => setPage(g.id)}
      style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden", border: "1px solid #222", position: "relative", transition: "transform 0.18s, box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ height: 120, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, position: "relative" }}>
        {g.icon}
        {g.hot && <div style={{ position: "absolute", top: 6, left: 6, background: "#e74c3c", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3 }}>🔥 HOT</div>}
        <div style={{ position: "absolute", bottom: 5, right: 6, background: "rgba(0,0,0,0.7)", borderRadius: 10, padding: "2px 7px", fontSize: 9, color: "#2ecc71", fontWeight: 600 }}>👤 {g.players}</div>
      </div>
      <div style={{ padding: "8px 10px", background: "#1c1c1c" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#ddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.label}</div>
        <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>Live Dealer</div>
      </div>
    </div>
  );
}

export default function LiveCasino({ setPage }) {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? LIVE_GAMES : LIVE_GAMES.filter(g => g.cat === cat);

  return (
    <div style={{ background: "#111111", margin: -20, padding: 0, minHeight: "100%" }}>
      {/* Category filter */}
      <div style={{ display: "flex", overflowX: "auto", background: "#1c1c1c", borderBottom: "1px solid #222", padding: "0 12px" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ flexShrink: 0, padding: "12px 16px", background: "transparent", border: "none", borderBottom: cat===c?"2px solid #e9f400":"2px solid transparent", color: cat===c?"#e9f400":"#888", fontWeight: cat===c?700:400, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.12s" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* TOP section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14 }}>🎰 TOP Games</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {filtered.map((g, i) => <GameCard key={i} g={g} setPage={setPage} />)}
          </div>
        </div>

        {/* Events/Promo banner */}
        <div style={{ padding: "20px 24px", borderRadius: 10, background: "linear-gradient(135deg,#1a0000,#3a0000)", border: "1px solid #400000", cursor: "pointer" }} onClick={() => setPage("wallet")}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#e9f400", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>EXCLUSIVE</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>SPRING LUCK AWAITS</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>INSTANT PAYOUTS</div>
          <button style={{ padding: "9px 22px", background: "#e9f400", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 800, cursor: "pointer", color: "#000", fontFamily: "inherit" }}>BET NOW</button>
        </div>
      </div>
    </div>
  );
}
