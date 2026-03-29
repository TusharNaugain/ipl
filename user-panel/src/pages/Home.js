import { useState, useEffect } from "react";

// ── Parimatch-style Homepage ──────────────────────────────────────────────────

// Quick game filter bar items (top horizontal scroll bar below nav)
const QUICK_GAMES = [
  { id: "soccer",     label: "Soccer",       icon: "⚽" },
  { id: "ipl",        label: "Cricket",      icon: "🏏" },
  { id: "tennis",     label: "Tennis",       icon: "🎾" },
  { id: "basketball", label: "Basketball",   icon: "🏀" },
  { id: "volleyball", label: "Volleyball",   icon: "🏐" },
  { id: "icehockey",  label: "Ice Hockey",   icon: "🏒" },
  { id: "esports",    label: "Esports",      icon: "🎮" },
  { id: "horseracing", label: "Horse Racing", icon: "🏇" },
  { id: "rugbyunion",  label: "Rugby Union",  icon: "🏉" },
  { id: "boxing",      label: "Boxing",       icon: "🥊" },
  { id: "baseball",    label: "Baseball",     icon: "⚾" },
  { id: "greyhound",   label: "Greyhounds",   icon: "🐕" },
  { id: "snooker",     label: "Snooker",      icon: "🎱" },
  { id: "golf",        label: "Golf",         icon: "⛳" },
  { id: "darts",       label: "Darts",        icon: "🎯" },
  { id: "americanfootball", label: "Am. Football", icon: "🏈" },
  { id: "rugbyleague", label: "Rugby League", icon: "🏉" },
];

// Trending games
const TRENDING = [
  { id: "crash",       label: "Aviator",         icon: "✈️",  bg: "linear-gradient(135deg,#1a0a2e,#5b2d8e)", players: "24.8K" },
];

// TOP Live Casino
const LIVE_CASINO = [
  { id: "andarBahar",  label: "Andar Bahar",       icon: "🎴",  bg: "linear-gradient(135deg,#1a0a2e,#4a1a6a)" },
  { id: "teenPatti",   label: "Bet on Teen Patti",  icon: "🃏",  bg: "linear-gradient(135deg,#0d5a1a,#1a8a2a)" },
  { id: "livecasino",  label: "Lucky 7",            icon: "7️⃣", bg: "linear-gradient(135deg,#1a1a0a,#5a5a0a)" },
  { id: "livecasino",  label: "Namaste Roulette",   icon: "🎡",  bg: "linear-gradient(135deg,#1a0a0a,#5a1a1a)" },
  { id: "dragonTiger", label: "Dragon Tiger",       icon: "🐉",  bg: "linear-gradient(135deg,#1a0000,#600000)" },
  { id: "livecasino",  label: "Ultimate Sic Bo",    icon: "🎲",  bg: "linear-gradient(135deg,#0a0a1a,#1a1a5a)" },
  { id: "livecasino",  label: "Cricket War",        icon: "🏏",  bg: "linear-gradient(135deg,#0a1a0a,#1a4a1a)" },
  { id: "livecasino",  label: "Teen Patti",         icon: "🃏",  bg: "linear-gradient(135deg,#1a0a2e,#4a1a6a)" },
  { id: "livecasino",  label: "Andar Bahar",        icon: "🎴",  bg: "linear-gradient(135deg,#2a0a0a,#6a1a1a)" },
];

// TOP Slots
const SLOTS = [
  { id: "slots", label: "3 Super Hot Chillies", icon: "🔥", bg: "#c0392b" },
  { id: "slots", label: "Buffalo King Megaways",icon: "🦬", bg: "#8e44ad" },
  { id: "slots", label: "Thunder Coins XXL",    icon: "⚡", bg: "#2980b9" },
  { id: "slots", label: "4 Pots Riches",        icon: "🪣", bg: "#27ae60" },
  { id: "slots", label: "Wild Hot 40",          icon: "🌶️",bg: "#e74c3c" },
  { id: "slots", label: "Sun of Egypt 3",       icon: "☀️", bg: "#f39c12" },
  { id: "slots", label: "777 Coins",            icon: "7️⃣",bg: "#d35400" },
  { id: "slots", label: "Fortune Gems 2",       icon: "💎", bg: "#16a085" },
  { id: "slots", label: "Fruit Box Classic",    icon: "🍒", bg: "#c0392b" },
  { id: "slots", label: "Candy Palace",         icon: "🍭", bg: "#e91e8c" },
];

// Top wins...

// TOP Wins (leaderboard)
const TOP_WINS = [
  { user: "Raj***", game: "Aviator", win: "₹2,45,000", time: "2h ago"  },
  { user: "Pra***", game: "Teen Patti", win: "₹1,80,000", time: "4h ago" },
  { user: "Ani***", game: "Dragon Tiger", win: "₹95,000", time: "5h ago" },
  { user: "Sun***", game: "Andar Bahar", win: "₹75,500", time: "6h ago" },
  { user: "Vik***", game: "Crazy Time", win: "₹68,000", time: "8h ago"  },
];

const NEW_LAUNCH = [
  { label: "Dragon Tower", icon: "🐉", bg: "linear-gradient(160deg,#1a0a0a,#5a1800)" },
  { label: "Packs", icon: "🎁", bg: "linear-gradient(160deg,#0a1a2e,#0d3a5c)" },
  { label: "Naughty Button", icon: "🔔", bg: "linear-gradient(160deg,#1a001a,#3d0054)" },
  { label: "Race Track", icon: "🏇", bg: "linear-gradient(160deg,#0a1a00,#1a4000)" },
  { label: "Jhandi Munda", icon: "🎲", bg: "linear-gradient(160deg,#1a1a00,#3d3d00)" },
  { label: "The Voice", icon: "🎤", bg: "linear-gradient(160deg,#1a000a,#3d0016)" },
  { label: "Twist X", icon: "🌀", bg: "linear-gradient(160deg,#00101a,#00304d)" },
  { label: "Rock Paper Scissors", icon: "✂️", bg: "linear-gradient(160deg,#0d1a00,#254500)" },
  { label: "Deal or No Deal", icon: "💼", bg: "linear-gradient(160deg,#1a0800,#4d2000)" },
];

function getRankStyle(i) {
  if (i === 0) return { bg: "rgba(252,163,17,0.2)", color: "var(--yellow)", border: "1px solid var(--yellow)" };
  if (i === 1) return { bg: "rgba(203,213,225,0.2)", color: "var(--text-1)", border: "none" };
  if (i === 2) return { bg: "rgba(205,127,50,0.2)", color: "#cd7f32", border: "none" };
  return { bg: "var(--navy-4)", color: "var(--text-3)", border: "none" };
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, background: "var(--yellow)", borderRadius: 2 }}></div>
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "0.5px" }}>{title}</span>
      </div>
      {onSeeAll && (
        <button onClick={onSeeAll} style={{ background: "none", border: "none", color: "var(--yellow)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", textTransform: "uppercase" }}>
          View All ›
        </button>
      )}
    </div>
  );
}

function GameThumb({ g, setPage, size = 120 }) {
  return (
    <div onClick={() => setPage(g.id)}
      style={{ flexShrink: 0, cursor: "pointer", width: size, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--navy-3)", transition: "var(--transition)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.5)"; e.currentTarget.style.borderColor = "var(--yellow)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ height: size * 0.85, background: g.bg || "var(--navy-4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
        {g.icon}
      </div>
      <div style={{ padding: "8px 10px", background: "var(--navy-3)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.label}</div>
        {g.players && <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>👤 {g.players} players</div>}
      </div>
    </div>
  );
}

export default function Home({ setPage }) {
  const [mounted, setMounted] = useState(false);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Soccer State
  const [soccerMatches, setSoccerMatches] = useState([]);
  const [loadingSoccer, setLoadingSoccer] = useState(true);

  // Betting State
  const [selectedBet, setSelectedBet] = useState(null);
  const [betSuccess, setBetSuccess] = useState(false);

  const handlePlaceBet = () => {
    const el = document.getElementById("stake-input");
    const stake = el ? parseInt(el.value || 0) : 1000;
    
    // Deduct coins from local user session
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentCoins = user.coins || 0;
    
    if (currentCoins < stake) {
      alert("Insufficient wallet balance to place this bet!");
      return;
    }
    
    user.coins = currentCoins - stake;
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("balance_updated"));

    const estReturn = Math.floor(stake * parseFloat(selectedBet.odds));
    
    const newBet = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      team: selectedBet.team,
      odds: selectedBet.odds,
      matchDesc: selectedBet.matchDesc || "Sports Match",
      stake: stake,
      return: estReturn
    };

    const saved = JSON.parse(localStorage.getItem("betlab_my_bets") || "[]");
    localStorage.setItem("betlab_my_bets", JSON.stringify([newBet, ...saved]));
    window.dispatchEvent(new Event("bet_placed"));
    setBetSuccess(true);
  };

  useEffect(() => { 
    setMounted(true); 

    // 1) Fetch Live Soccer (Sportradar)
    fetch('http://localhost:5000/api/soccer/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.schedules) {
          const sMatches = data.data.schedules.slice(0, 5).map(s => {
            const event = s.sport_event;
            const home = event.competitors?.find(c => c.qualifier === "home")?.name || "Home";
            const away = event.competitors?.find(c => c.qualifier === "away")?.name || "Away";
            const comp = event.sport_event_context?.competition?.name || "Soccer Match";
            
            // Format time nicely
            const dateObj = new Date(event.start_time);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
              id: event.id,
              t1: home,
              t2: away,
              time: timeStr,
              matchDesc: comp,
              // Simulated odds for the UI
              b1: (Math.random() * 1.5 + 1.2).toFixed(2),
              l1: (Math.random() * 1.5 + 1.3).toFixed(2),
              b2: (Math.random() * 2.5 + 1.8).toFixed(2),
              l2: (Math.random() * 2.5 + 1.9).toFixed(2),
              bx: (Math.random() * 1.0 + 3.0).toFixed(2), // Soccer has Draw (X) Odds
            };
          });
          setSoccerMatches(sMatches);
        }
        setLoadingSoccer(false);
      })
      .catch(err => {
        console.error("Failed to fetch soccer matches", err);
        setLoadingSoccer(false);
      });

    // 2) Fetch Live Cricket data (CricAPI proxy)
    fetch('http://localhost:5000/api/cricket/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const matches = data.data.map(m => ({
            id: m.id || Math.random().toString(),
            t1: m.t1,
            t2: m.t2,
            time: m.time,
            matchDesc: m.matchDesc,
            b1: m.b1,
            l1: m.l1,
            b2: m.b2,
            l2: m.l2
          }));
          setLiveMatches(matches.slice(0, 5));
        }
        setLoadingMatches(false);
      })
      .catch(err => {
        console.error("Failed to fetch matches", err);
        setLoadingMatches(false);
      });
  }, []);

  return (
    <div style={{ background: "var(--bg)", margin: -20, padding: 0, minHeight: "100%" }}>

      {/* ── Quick Game Filter Bar ─────────────────────────────────────────── */}
      <div style={{ overflowX: "auto", display: "flex", gap: 0, background: "var(--navy-2)", borderBottom: "1px solid var(--border)", padding: "0 16px" }}>
        {QUICK_GAMES.map((g, i) => (
          <button key={i} onClick={() => setPage(g.id)}
            style={{ flexShrink: 0, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-3)", fontFamily: "inherit", whiteSpace: "nowrap", borderBottom: "3px solid transparent", transition: "var(--transition)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderBottom = "3px solid var(--yellow)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderBottom = "3px solid transparent"; }}
          >
            <span style={{ opacity: 0.8 }}>{g.icon}</span> <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* ── Fair99 Match Feed ──────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Soccer Section ── */}
        <div className="sport-section-header">
          <span className="sport-name">⚽ Soccer</span>
          <div className="col-labels">
            <span className="col-label">1</span>
            <span className="col-label">X</span>
            <span className="col-label">2</span>
          </div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 4px 4px", marginBottom: 4, background: "#fff" }}>
          {loadingSoccer ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading soccer...</div>
          ) : soccerMatches.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No live soccer matches.</div>
          ) : (
            soccerMatches.map((m, i) => {
              const isSel = selectedBet?.matchId === m.id;
              const selType = selectedBet?.type || "";
              const bg1B = isSel && selType === "1B" ? "#f97316" : "#7dd3fc";
              const bgXL = isSel && selType === "XL" ? "#f97316" : "#f9a8d4";
              const bg2B = isSel && selType === "2B" ? "#f97316" : "#7dd3fc";
              return (
                <div key={m.id || i}>
                  <div className="f99-match-row">
                    {/* Status badge */}
                    <div style={{ width: 52, flexShrink: 0 }}>
                      <span className="inplay-badge">Inplay</span>
                    </div>
                    {/* Match Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{m.matchDesc}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.t1}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.t2}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{m.time}</div>
                    </div>
                    {/* Back/Lay odds grid: 3 columns (1, X, 2) each with back+lay */}
                    <div style={{ display: "flex", gap: 3 }}>
                      {/* 1 - Back */}
                      <button onClick={() => { setSelectedBet({ matchId: m.id, type: "1B", team: m.t1, odds: m.b1, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                        style={{ width: 52, minHeight: 42, background: bg1B, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "filter 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0c1a26", lineHeight: 1 }}>{m.b1}</span>
                        <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>{m.l1}</span>
                      </button>
                      {/* X - Lay (Draw) */}
                      <button onClick={() => { setSelectedBet({ matchId: m.id, type: "XL", team: "Draw", odds: m.bx, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                        style={{ width: 52, minHeight: 42, background: bgXL, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "filter 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0c1a26", lineHeight: 1 }}>{m.bx}</span>
                        <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>{m.bx}</span>
                      </button>
                      {/* 2 - Back */}
                      <button onClick={() => { setSelectedBet({ matchId: m.id, type: "2B", team: m.t2, odds: m.b2, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                        style={{ width: 52, minHeight: 42, background: bg2B, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "filter 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0c1a26", lineHeight: 1 }}>{m.b2}</span>
                        <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>{m.l2}</span>
                      </button>
                    </div>
                  </div>
                  {/* Expandable Bet Slip */}
                  {isSel && (
                    <div style={{ background: "#fff7ed", padding: "12px 20px", borderTop: "1px solid #fed7aa", display: "flex", gap: 16, alignItems: "center", animation: "slideIn 0.2s ease" }}>
                      {betSuccess ? (
                        <div style={{ flex: 1, textAlign: "center", color: "#16a34a", fontWeight: 800 }}>✅ Bet placed on {selectedBet.team} @ {selectedBet.odds}</div>
                      ) : (
                        <>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>SELECTED PICK</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{selectedBet.team} <span style={{ color: "#f97316" }}>@ {selectedBet.odds}</span></div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontWeight: 700 }}>₹</span>
                              <input id="stake-input" type="number" defaultValue="1000" style={{ width: 110, padding: "9px 9px 9px 24px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 5, color: "#111827", fontSize: 14, fontWeight: 700, outline: "none" }} />
                            </div>
                            <button onClick={handlePlaceBet} style={{ padding: "9px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Place Bet</button>
                            <button onClick={() => setSelectedBet(null)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer" }}>✕</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Cricket Section ── */}
        <div className="sport-section-header">
          <span className="sport-name">🏏 Cricket</span>
          <div className="col-labels">
            <span className="col-label">1</span>
            <span className="col-label">X</span>
            <span className="col-label">2</span>
          </div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 4px 4px", marginBottom: 4, background: "#fff" }}>
          {loadingMatches ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading cricket...</div>
          ) : liveMatches.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No matches at the moment.</div>
          ) : (
            liveMatches.map((m, i) => {
              const isSel = selectedBet?.matchId === m.id;
              const isLive = m.status === "LIVE";
              const selType2 = selectedBet?.type || "";
              const crBg1 = isSel && selType2 === "1B" ? "#f97316" : "#7dd3fc";
              const crBg2 = isSel && selType2 === "2B" ? "#f97316" : "#f9a8d4";
              return (
                <div key={m.id || i}>
                  <div className="f99-match-row">
                    <div style={{ width: 52, flexShrink: 0 }}>
                      <span className="inplay-badge" style={{ background: isLive ? "#dc2626" : "#1d4ed8" }}>
                        {isLive ? "Inplay" : "Soon"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{m.matchDesc}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.t1}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.t2}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{new Date(m.time + "Z").toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      <button onClick={() => { setSelectedBet({ matchId: m.id, type: "1B", team: m.t1, odds: m.b1, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                        style={{ width: 52, minHeight: 42, background: crBg1, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0c1a26" }}>{m.b1}</span>
                        <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)" }}>{m.l1}</span>
                      </button>
                      <button style={{ width: 52, minHeight: 42, background: "#f1f5f9", border: "none", borderRadius: 4, cursor: "default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#9ca3af" }}>—</span>
                      </button>
                      <button onClick={() => { setSelectedBet({ matchId: m.id, type: "2B", team: m.t2, odds: m.b2, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                        style={{ width: 52, minHeight: 42, background: crBg2, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0c1a26" }}>{m.b2}</span>
                        <span style={{ fontSize: 9, color: "rgba(0,0,0,0.5)" }}>{m.l2}</span>
                      </button>
                    </div>
                  </div>
                  {isSel && (
                    <div style={{ background: "#fff7ed", padding: "12px 20px", borderTop: "1px solid #fed7aa", display: "flex", gap: 16, alignItems: "center", animation: "slideIn 0.2s ease" }}>
                      {betSuccess ? (
                        <div style={{ flex: 1, textAlign: "center", color: "#16a34a", fontWeight: 800 }}>✅ Bet placed on {selectedBet.team} @ {selectedBet.odds}</div>
                      ) : (
                        <>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>SELECTED PICK</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{selectedBet.team} <span style={{ color: "#f97316" }}>@ {selectedBet.odds}</span></div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontWeight: 700 }}>₹</span>
                              <input id="stake-input" type="number" defaultValue="1000" style={{ width: 110, padding: "9px 9px 9px 24px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 5, color: "#111827", fontSize: 14, fontWeight: 700, outline: "none" }} />
                            </div>
                            <button onClick={handlePlaceBet} style={{ padding: "9px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Place Bet</button>
                            <button onClick={() => setSelectedBet(null)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer" }}>✕</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── NEW LAUNCH Casino Grid (Fair99 teal-footer grid) ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ background: "#2d2b55", color: "#d1d5db", fontSize: 13, fontWeight: 800, padding: "8px 14px", borderRadius: "4px 4px 0 0", textTransform: "uppercase", letterSpacing: "0.6px" }}>NEW LAUNCH</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, padding: 4, background: "#e5e7eb", borderRadius: "0 0 4px 4px" }}>
            {NEW_LAUNCH.map((g, i) => (
              <div key={i} onClick={() => setPage("slots")} style={{ cursor: "pointer", borderRadius: 4, overflow: "hidden", position: "relative" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                <div style={{ height: 120, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{g.icon}</div>
                <div style={{ background: "#0ea5e9", color: "#fff", padding: "5px 8px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3px", textAlign: "center" }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trending Games ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader title="Popular Casino Games" onSeeAll={() => setPage("slots")} />
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {TRENDING.map((g, i) => <GameThumb key={i} g={g} setPage={setPage} size={140} />)}
          </div>
        </div>

        {/* ── TOP Slots ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader title="Top Slots" onSeeAll={() => setPage("slots")} />
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {SLOTS.map((g, i) => <GameThumb key={i} g={g} setPage={setPage} size={140} />)}
          </div>
        </div>

        {/* ── TOP Wins of the Month ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="Recent Major Wins" />
          <div style={{ background: "var(--navy-3)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
            {TOP_WINS.map((w, i) => {
              const notLast = i !== TOP_WINS.length - 1;
              const { bg, color, border } = getRankStyle(i);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: notLast ? "1px solid var(--border)" : "none", gap: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: color, flexShrink: 0, border: border }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{w.user}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{w.game} · {w.time}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--green)", background: "rgba(16,185,129,0.1)", padding: "4px 12px", borderRadius: 20 }}>{w.win}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
