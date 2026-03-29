import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../services/api";
import socket from "../services/socket";

// ── IPL 2026 Static Schedule (shown when backend has no matches) ───────────────
const TEAMS = {
  CSK:  { name: "Chennai Super Kings",          short: "CSK",  color: "#F9CD1B", bg: "#1a1200" },
  MI:   { name: "Mumbai Indians",                short: "MI",   color: "#004BA0", bg: "#000d1f" },
  RCB:  { name: "Royal Challengers Bangalore",   short: "RCB",  color: "#EC1C24", bg: "#1a0001" },
  KKR:  { name: "Kolkata Knight Riders",         short: "KKR",  color: "#3A225D", bg: "#0d0018" },
  SRH:  { name: "Sunrisers Hyderabad",           short: "SRH",  color: "#FF822A", bg: "#1a0c00" },
  DC:   { name: "Delhi Capitals",                short: "DC",   color: "#0078BC", bg: "#00101a" },
  PBKS: { name: "Punjab Kings",                  short: "PBKS", color: "#D71920", bg: "#1a0001" },
  RR:   { name: "Rajasthan Royals",              short: "RR",   color: "#EA1A85", bg: "#1a0011" },
  GT:   { name: "Gujarat Titans",                short: "GT",   color: "#1C1C1C", bg: "#111"    },
  LSG:  { name: "Lucknow Super Giants",          short: "LSG",  color: "#A72056", bg: "#150010" },
};

const POINTS_TABLE = [
  { team:"SRH",  mp:6, w:4, l:2, pts:8,  nrr:"+0.892" },
  { team:"KKR",  mp:6, w:4, l:2, pts:8,  nrr:"+0.731" },
  { team:"RCB",  mp:6, w:4, l:2, pts:8,  nrr:"+0.614" },
  { team:"MI",   mp:6, w:3, l:3, pts:6,  nrr:"+0.253" },
  { team:"CSK",  mp:6, w:3, l:3, pts:6,  nrr:"-0.102" },
  { team:"GT",   mp:6, w:3, l:3, pts:6,  nrr:"-0.234" },
  { team:"PBKS", mp:6, w:3, l:3, pts:6,  nrr:"-0.401" },
  { team:"LSG",  mp:6, w:2, l:4, pts:4,  nrr:"-0.534" },
  { team:"DC",   mp:6, w:2, l:4, pts:4,  nrr:"-0.672" },
  { team:"RR",   mp:6, w:2, l:4, pts:4,  nrr:"-0.890" },
];

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
}

// ── Odds Box Component ─────────────────────────────────────────────────────────
function OddsBox({ value, label, type, flash, onClick, disabled }) {
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    if (flash) {
      setHighlighted(true);
      const t = setTimeout(() => setHighlighted(false), 400);
      return () => clearTimeout(t);
    }
  }, [flash]);

  const bgColor = type === "back" ? "#72BBEF" : "#FAA9BA";
  const textColor = "#1a1a2e";

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        background: disabled ? "#2a2a3a" : bgColor,
        color: disabled ? "#555" : textColor,
        borderRadius: 4,
        padding: "6px 10px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 56,
        opacity: highlighted ? 1 : 0.95,
        transform: highlighted ? "scale(1.06)" : "scale(1)",
        transition: "all 0.15s",
        boxShadow: highlighted ? `0 0 8px ${bgColor}` : "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{value?.toFixed(2) || "–"}</div>
      {label && <div style={{ fontSize: 9, fontWeight: 600, marginTop: 1, opacity: 0.75 }}>{label}</div>}
    </div>
  );
}

// ── Match Card (in list view) ──────────────────────────────────────────────────
function MatchCard({ m, onSelect, liveOdds }) {
  const t1 = TEAMS[m.team1] || { name: m.team1, short: m.team1?.substring(0,3).toUpperCase(), color: "#888", bg: "#111" };
  const t2 = TEAMS[m.team2] || { name: m.team2, short: m.team2?.substring(0,3).toUpperCase(), color: "#888", bg: "#111" };
  const isLive = m.status === "LIVE";
  const isDone = m.status === "COMPLETED";

  const odds = liveOdds[m._id] || m.odds || {};
  const t1odds = odds.team1 || {};
  const t2odds = odds.team2 || {};

  return (
    <div
      onClick={() => !isDone && onSelect(m)}
      style={{
        background: "var(--navy-3)",
        border: `1px solid ${isLive ? "rgba(46,204,113,0.35)" : "var(--border)"}`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: isDone ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "all 0.15s",
        boxShadow: isLive ? "0 0 16px rgba(46,204,113,0.08)" : "none",
      }}
      onMouseEnter={e => !isDone && (e.currentTarget.style.background = "var(--navy-4)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--navy-3)")}
    >
      {/* Teams */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {isLive && <span className="inplay-badge">IN-PLAY</span>}
          {isDone && <span style={{ fontSize: 9, background: "rgba(46,204,113,0.15)", color: "var(--green)", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>ENDED</span>}
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{m.competition || "IPL T20"}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span style={{ color: t1.color }}>{t1.short}</span>
          <span style={{ color: "var(--text-3)", fontWeight: 400, margin: "0 6px" }}>vs</span>
          <span style={{ color: t2.color }}>{t2.short}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
          {isLive && m.score ? `🔴 ${m.score}` : `📅 ${fmtDate(m.scheduledAt)}`}
        </div>
      </div>

      {/* Odds preview */}
      {!isDone && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--text-3)", marginBottom: 3, fontWeight: 700 }}>{t1.short}</div>
            <div style={{ display: "flex", gap: 2 }}>
              <div style={{ background: "#72BBEF", borderRadius: 3, padding: "4px 8px", textAlign: "center", minWidth: 44 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e" }}>{(t1odds.back || 1.90).toFixed(2)}</div>
                <div style={{ fontSize: 8, color: "#333" }}>BACK</div>
              </div>
              <div style={{ background: "#FAA9BA", borderRadius: 3, padding: "4px 8px", textAlign: "center", minWidth: 44 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e" }}>{(t1odds.lay || 2.00).toFixed(2)}</div>
                <div style={{ fontSize: 8, color: "#333" }}>LAY</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--text-3)", marginBottom: 3, fontWeight: 700 }}>{t2.short}</div>
            <div style={{ display: "flex", gap: 2 }}>
              <div style={{ background: "#72BBEF", borderRadius: 3, padding: "4px 8px", textAlign: "center", minWidth: 44 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e" }}>{(t2odds.back || 1.90).toFixed(2)}</div>
                <div style={{ fontSize: 8, color: "#333" }}>BACK</div>
              </div>
              <div style={{ background: "#FAA9BA", borderRadius: 3, padding: "4px 8px", textAlign: "center", minWidth: 44 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1a2e" }}>{(t2odds.lay || 2.00).toFixed(2)}</div>
                <div style={{ fontSize: 8, color: "#333" }}>LAY</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bet Slip Panel (inline, at bottom of match detail) ─────────────────────────
function BetSlip({ match, betContext, onClose, onPlaced }) {
  const [stake, setStake] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const balance = user.coins || 0;

  const { type, selection, label, odds } = betContext;

  const potentialPayout = Math.floor(parseInt(stake || 0) * (parseFloat(odds) || 1));
  const profit = potentialPayout - parseInt(stake || 0);

  const handlePlace = () => {
    setError("");
    const stakeAmt = parseInt(stake);
    if (!stakeAmt || stakeAmt < 10) return setError("Minimum stake is ₹10");
    if (stakeAmt > balance) return setError("Insufficient balance!");

    setLoading(true);
    try {
      user.coins = balance - stakeAmt;
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("balance_updated"));

      const newBet = {
        id: Date.now().toString(),
        date: new Date().toLocaleString("en-IN"),
        type,
        selection: label,
        matchDesc: `${match.team1} vs ${match.team2}`,
        odds: parseFloat(odds).toFixed(2),
        stake: stakeAmt,
        payout: potentialPayout,
        status: "PENDING",
      };

      const saved = JSON.parse(localStorage.getItem("betlab_my_bets") || "[]");
      localStorage.setItem("betlab_my_bets", JSON.stringify([newBet, ...saved]));
      window.dispatchEvent(new Event("bet_placed"));

      setPlaced(true);
      setTimeout(() => { setPlaced(false); onPlaced(); }, 2000);
    } catch (e) {
      setError("Failed to place bet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: "linear-gradient(135deg, #1a1a2e, #16213e)",
      border: "1px solid rgba(242,184,36,0.3)",
      borderRadius: "16px 16px 0 0",
      padding: "16px 20px",
      boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
      animation: "slideUp 0.25s ease",
    }}>
      {placed ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 36 }}>✅</div>
          <div style={{ fontWeight: 800, color: "var(--green)", fontSize: 15, marginTop: 4 }}>Bet Placed Successfully!</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase" }}>{type} Bet</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)", marginTop: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{match.team1} vs {match.team2}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>ODDS</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: type === "BACK" ? "#72BBEF" : type === "LAY" ? "#FAA9BA" : "var(--yellow)" }}>{parseFloat(odds).toFixed(2)}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 20, cursor: "pointer", marginLeft: 8 }}>✕</button>
          </div>

          {/* Stake input */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5 }}>Stake (Balance: 🪙 {balance})</div>
            <input
              type="number" min="10" value={stake}
              onChange={e => setStake(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", color: "var(--text-1)", fontSize: 14, fontWeight: 700, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {[100, 500, 1000, 5000, 10000].map(v => (
                <button key={v} onClick={() => setStake(v)} className="btn btn-outline" style={{ padding: "3px 10px", fontSize: 11 }}>{v}</button>
              ))}
            </div>
          </div>

          {/* Payout info */}
          <div style={{ background: "rgba(242,184,36,0.06)", border: "1px solid rgba(242,184,36,0.2)", borderRadius: 6, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <div>
              <div style={{ color: "var(--text-3)" }}>Potential Payout</div>
              <div style={{ fontWeight: 800, color: "var(--yellow)", fontSize: 15 }}>🪙 {potentialPayout}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--text-3)" }}>Profit</div>
              <div style={{ fontWeight: 700, color: "var(--green)", fontSize: 15 }}>+🪙 {profit}</div>
            </div>
          </div>

          {error && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 8 }}>⚠️ {error}</div>}

          <button
            onClick={handlePlace}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 800 }}
          >
            {loading ? "Placing..." : `Place ${type} Bet • 🪙 ${stake}`}
          </button>
        </>
      )}
    </div>
  );
}

// ── Match Detail View ──────────────────────────────────────────────────────────
function MatchDetailView({ match, liveOdds, fancyTicks, onBack }) {
  const [betContext, setBetContext] = useState(null); // { type, selection, label, odds }
  const [activeSection, setActiveSection] = useState("odds"); // "odds" | "fancy"

  const t1 = TEAMS[match.team1] || { name: match.team1, short: match.team1?.substring(0,3).toUpperCase(), color: "#72BBEF" };
  const t2 = TEAMS[match.team2] || { name: match.team2, short: match.team2?.substring(0,3).toUpperCase(), color: "#FAA9BA" };
  const isLive = match.status === "LIVE";

  const currOdds = liveOdds[match._id] || match.odds || {};
  const t1o = currOdds.team1 || { back: 1.90, lay: 2.00 };
  const t2o = currOdds.team2 || { back: 1.90, lay: 2.00 };
  const dr  = currOdds.draw  || { back: 3.40, lay: 3.60 };

  // Use live fancy tick if available, else match's own data
  const fancyMarkets = fancyTicks[match._id]?.fancyMarkets || match.fancyMarkets || [];

  const openBetSlip = (type, selection, label, odds) => {
    setBetContext({ type, selection, label, odds });
  };

  return (
    <div style={{ paddingBottom: betContext ? 220 : 0 }}>
      {/* Back Button */}
      <button onClick={onBack} className="btn btn-outline" style={{ marginBottom: 12, fontSize: 12 }}>
        ← Back to Matches
      </button>

      {/* Match Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy-3), var(--navy-4))",
        border: `1px solid ${isLive ? "rgba(46,204,113,0.35)" : "var(--border)"}`,
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              {match.competition}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              <span style={{ color: t1.color }}>{match.team1}</span>
              <span style={{ color: "var(--text-3)", margin: "0 10px", fontWeight: 400 }}>vs</span>
              <span style={{ color: t2.color }}>{match.team2}</span>
            </div>
            {match.score && (
              <div style={{ fontSize: 12, color: "var(--yellow)", marginTop: 4 }}>📊 {match.score}</div>
            )}
          </div>
          {isLive ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 20, padding: "5px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--green)" }}>IN-PLAY</span>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>📅 {fmtDate(match.scheduledAt)}</div>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[
          { id: "odds",  label: "📊 Match Odds" },
          { id: "fancy", label: "🎯 Fancy Markets" },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className="btn"
            style={{
              fontSize: 12, padding: "8px 16px", fontWeight: 700,
              background: activeSection === s.id ? "var(--yellow)" : "var(--navy-3)",
              color: activeSection === s.id ? "#000" : "var(--text-2)",
              border: `1px solid ${activeSection === s.id ? "var(--yellow)" : "var(--border)"}`,
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── MATCH ODDS SECTION ──────────────────────────────────────────────── */}
      {activeSection === "odds" && (
        <div style={{ background: "var(--navy-3)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", padding: "8px 14px", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" }}>
            <div>Market</div>
            <div style={{ textAlign: "center", color: "#72BBEF" }}>BACK</div>
            <div style={{ textAlign: "center", color: "#FAA9BA" }}>LAY</div>
            <div style={{ textAlign: "center", color: "#72BBEF" }}>BACK</div>
          </div>

          {/* Team 1 row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t1.color }}>{match.team1}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>WIN</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t1o.back} type="back" onClick={() => openBetSlip("BACK", "team1", `${match.team1} to Win`, t1o.back)} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t1o.lay} type="lay" onClick={() => openBetSlip("LAY", "team1", `${match.team1} to Lose`, t1o.lay)} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t1o.back} type="back" onClick={() => openBetSlip("BACK", "team1", `${match.team1} to Win`, t1o.back)} />
            </div>
          </div>

          {/* Draw row (for non-T20 or soccer) */}
          {match.sport !== "cricket" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>Draw</div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <OddsBox value={dr.back} type="back" onClick={() => openBetSlip("BACK", "draw", "Draw", dr.back)} />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <OddsBox value={dr.lay} type="lay" onClick={() => openBetSlip("LAY", "draw_lay", "Draw Lay", dr.lay)} />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <OddsBox value={dr.back} type="back" onClick={() => openBetSlip("BACK", "draw", "Draw", dr.back)} />
              </div>
            </div>
          )}

          {/* Team 2 row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px", padding: "10px 14px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t2.color }}>{match.team2}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>WIN</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t2o.back} type="back" onClick={() => openBetSlip("BACK", "team2", `${match.team2} to Win`, t2o.back)} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t2o.lay} type="lay" onClick={() => openBetSlip("LAY", "team2", `${match.team2} to Lose`, t2o.lay)} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <OddsBox value={t2o.back} type="back" onClick={() => openBetSlip("BACK", "team2", `${match.team2} to Win`, t2o.back)} />
            </div>
          </div>
        </div>
      )}

      {/* ── FANCY MARKETS SECTION ──────────────────────────────────────────── */}
      {activeSection === "fancy" && (
        <div style={{ background: "var(--navy-3)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "10px 14px", borderBottom: "2px solid rgba(242,184,36,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>🎯 Fancy Markets</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>YES / NO Session & Player Bets</div>
            </div>
            {isLive && <span className="inplay-badge" style={{ fontSize: 10 }}>🔴 LIVE</span>}
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", gap: 0, padding: "6px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 9, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" }}>
            <div>Market Name</div>
            <div style={{ textAlign: "center", color: "#FAA9BA" }}>NO</div>
            <div style={{ textAlign: "center", color: "#72BBEF" }}>YES</div>
          </div>

          {fancyMarkets.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 20px" }}>
              <div style={{ fontSize: 32 }}>🎯</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>No Fancy Markets Yet</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Admin will add fancy markets when the match goes live.</div>
            </div>
          ) : (
            fancyMarkets.map((fm, i) => (
              <div key={fm._id || i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 90px",
                padding: "9px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                alignItems: "center",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                opacity: fm.suspended ? 0.45 : 1,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{fm.title}</div>
                  {fm.suspended && <div style={{ fontSize: 9, color: "var(--yellow)", fontWeight: 700, marginTop: 2 }}>⏸ SUSPENDED</div>}
                  {fm.result !== "PENDING" && <div style={{ fontSize: 9, color: fm.result === "YES" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>✅ {fm.result}</div>}
                </div>
                {/* NO box (pink) */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    onClick={() => !fm.suspended && fm.result !== "YES" && fm.result !== "NO" && openBetSlip("NO", `fancy_${fm._id || i}_NO`, `${fm.title} — NO ${fm.noValue}`, 1 + (fm.noRate || 10) / 100)}
                    style={{
                      background: fm.suspended ? "#2a2a3a" : "#FAA9BA",
                      color: fm.suspended ? "#555" : "#1a1a2e",
                      borderRadius: 4,
                      padding: "5px 10px",
                      textAlign: "center",
                      cursor: fm.suspended ? "not-allowed" : "pointer",
                      minWidth: 70,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>{fm.noValue}</div>
                    <div style={{ fontSize: 9, marginTop: 1, fontWeight: 700, opacity: 0.75 }}>{fm.noRate}</div>
                  </div>
                </div>
                {/* YES box (cyan) */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    onClick={() => !fm.suspended && fm.result !== "YES" && fm.result !== "NO" && openBetSlip("YES", `fancy_${fm._id || i}_YES`, `${fm.title} — YES ${fm.yesValue}`, 1 + (fm.yesRate || 10) / 100)}
                    style={{
                      background: fm.suspended ? "#2a2a3a" : "#72BBEF",
                      color: fm.suspended ? "#555" : "#1a1a2e",
                      borderRadius: 4,
                      padding: "5px 10px",
                      textAlign: "center",
                      cursor: fm.suspended ? "not-allowed" : "pointer",
                      minWidth: 70,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>{fm.yesValue}</div>
                    <div style={{ fontSize: 9, marginTop: 1, fontWeight: 700, opacity: 0.75 }}>{fm.yesRate}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bet Slip */}
      {betContext && (
        <BetSlip
          match={match}
          betContext={betContext}
          onClose={() => setBetContext(null)}
          onPlaced={() => setBetContext(null)}
        />
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IPLLive() {
  const [tab, setTab]                     = useState("schedule");
  const [league, setLeague]               = useState("Indian Premier League");
  const [matches, setMatches]             = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [liveOdds, setLiveOdds]           = useState({});
  const [fancyTicks, setFancyTicks]       = useState({}); // { matchId: { fancyMarkets: [...] } }
  const [myBets, setMyBets]               = useState([]);
  const [betStats, setBetStats]           = useState(null);
  const [filter, setFilter]               = useState("all");
  const [notification, setNotification]   = useState(null);
  const [loading, setLoading]             = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const balance = user.coins || 0;

  // ── Fetch matches ────────────────────────────────────────────────────────────
  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cricket/live");
      const data = await res.json();

      let parsed = [];
      if (data.success && Array.isArray(data.data)) {
        parsed = data.data.map(m => ({
          _id: m.id || Math.random().toString(),
          team1: m.t1,
          team2: m.t2,
          status: m.status,
          competition: m.competition,
          score: m.matchDesc,
          scheduledAt: new Date(m.time + "Z").getTime(),
          fancyMarkets: m.fancyMarkets || [],
          odds: {
            team1: { back: parseFloat(m.b1), lay: parseFloat(m.l1) },
            team2: { back: parseFloat(m.b2), lay: parseFloat(m.l2) }
          }
        }));
      }
      setMatches(parsed);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBets = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("betlab_my_bets") || "[]");
      setMyBets(saved);
      setBetStats({ total: saved.length, pending: saved.filter(b => b.status === "PENDING").length, won: saved.filter(b => b.status === "WON").length, lost: saved.filter(b => b.status === "LOST").length });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadMatches(); loadBets(); }, []);

  // ── WebSocket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    socket.on("match:odds_tick", ({ matchId, odds }) => {
      setLiveOdds(prev => ({ ...prev, [matchId]: odds }));
    });

    socket.on("match:fancy_tick", ({ matchId, fancyMarkets }) => {
      setFancyTicks(prev => ({ ...prev, [matchId]: { fancyMarkets } }));
    });

    socket.on("match:settled", (data) => {
      showNotification(`🏆 ${data.team1} vs ${data.team2} — ${TEAMS[data.winner]?.name || data.winner} won!`);
      loadMatches();
      loadBets();
    });

    socket.on("fancy:settled", (data) => {
      showNotification(`🎯 ${data.title} settled as ${data.result}!`);
    });

    socket.on("wallet:update", ({ userId, coins }) => {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      if (stored._id === userId) {
        stored.coins = coins;
        localStorage.setItem("user", JSON.stringify(stored));
      }
    });

    matches.filter(m => m.status === "LIVE").forEach(m => socket.emit("match:subscribe", m._id));

    return () => {
      socket.off("match:odds_tick");
      socket.off("match:fancy_tick");
      socket.off("match:settled");
      socket.off("fancy:settled");
      socket.off("wallet:update");
    };
  }, [matches]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 6000);
  };

  // ── Normalize league names ───────────────────────────────────────────────────
  const normalizedMatches = matches.map(m => {
    const raw = (m.competition || "").toLowerCase();
    let norm = m.competition;
    if (raw.includes("indian premier league")) norm = "Indian Premier League";
    else if (raw.includes("pakistan super league") || raw.includes("psl")) norm = "Pakistan Super League";
    else if (raw.includes("legends league")) norm = "Legends League Cricket";
    else if (raw.includes("women")) norm = "Women's One Day Internationals";
    return { ...m, competition: norm };
  });

  const _matches = normalizedMatches.filter(m => (m.competition || "Indian Premier League") === league);
  const liveMatches     = _matches.filter(m => m.status === "LIVE");
  const upcomingMatches = _matches.filter(m => m.status === "UPCOMING");
  const doneMatches     = _matches.filter(m => m.status === "COMPLETED");

  const filtered = filter === "live"      ? liveMatches
                 : filter === "upcoming"  ? upcomingMatches
                 : filter === "completed" ? doneMatches
                 : _matches;

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div style={{ background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, animation: "slideIn 0.3s ease" }}>
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ── MATCH DETAIL VIEW (when match is selected) ─────────────────────── */}
      {selectedMatch ? (
        <MatchDetailView
          match={selectedMatch}
          liveOdds={liveOdds}
          fancyTicks={fancyTicks}
          onBack={() => setSelectedMatch(null)}
        />
      ) : (
        <>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>🏏</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{league}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Live & Upcoming Cricket Action</div>
              </div>
              {liveMatches.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "var(--green)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                  {liveMatches.length} LIVE
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[{ id: "schedule", label: "📅 Schedule" }, { id: "points", label: "📊 Table" }, { id: "mybets", label: "📋 My Bets" }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className="btn"
                  style={{ fontSize: 11, padding: "6px 12px", background: tab === t.id ? "var(--yellow)" : "var(--navy-3)", color: tab === t.id ? "#000" : "var(--text-2)", border: `1px solid ${tab === t.id ? "var(--yellow)" : "var(--border)"}`, fontWeight: 700 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leagues Menu */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {["Indian Premier League", "Women's One Day Internationals", "Legends League Cricket", "Pakistan Super League"].map(l => (
              <button key={l} onClick={() => setLeague(l)}
                style={{ padding: "8px 16px", borderRadius: 20, whiteSpace: "nowrap", border: `1px solid ${league === l ? "var(--yellow)" : "var(--border)"}`, background: league === l ? "var(--yellow)" : "var(--navy-3)", color: league === l ? "#000" : "var(--text-2)", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "var(--transition)", flexShrink: 0 }}>
                {l}
              </button>
            ))}
          </div>

          {/* ── SCHEDULE TAB ─────────────────────────────────────────────────── */}
          {tab === "schedule" && (
            <div>
              {/* Filters */}
              <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
                {[
                  { id: "all",       label: `All (${_matches.length})`             },
                  { id: "live",      label: `🔴 Live (${liveMatches.length})`      },
                  { id: "upcoming",  label: `⏳ Upcoming (${upcomingMatches.length})`},
                  { id: "completed", label: `✅ Done (${doneMatches.length})`      },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className="btn"
                    style={{ fontSize: 11, padding: "5px 12px", background: filter === f.id ? "var(--navy-5)" : "var(--navy-3)", color: filter === f.id ? "var(--yellow)" : "var(--text-2)", border: `1px solid ${filter === f.id ? "rgba(242,184,36,0.4)" : "var(--border)"}`, fontWeight: 600 }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="loading"><div className="spinner" /><span>Loading matches...</span></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 40 }}>🏏</div>
                  <h3>No matches found</h3>
                  <p style={{ fontSize: 12, marginTop: 6 }}>Matches will appear here once added by admin</p>
                </div>
              ) : (
                filtered.map(m => (
                  <MatchCard key={m._id} m={m} liveOdds={liveOdds}
                    onSelect={(match) => { setSelectedMatch(match); }} />
                ))
              )}
            </div>
          )}

          {/* ── POINTS TABLE ──────────────────────────────────────────────────── */}
          {tab === "points" && (
            <div style={{ background: "var(--navy-3)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "2px solid var(--yellow)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>IPL 2026 Points Table</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="f-table">
                  <thead><tr>{["#","Team","MP","Won","Lost","Pts","NRR"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {POINTS_TABLE.map((row, i) => {
                      const team = TEAMS[row.team] || {};
                      return (
                        <tr key={row.team} style={{ background: i < 4 ? "rgba(46,204,113,0.03)" : "transparent" }}>
                          <td style={{ fontWeight: 700, color: i < 4 ? "var(--green)" : "var(--text-3)" }}>{i + 1}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: team.color || "#888", flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{row.team}</span>
                              {i < 4 && <span style={{ fontSize: 8, background: "rgba(46,204,113,0.15)", color: "var(--green)", padding: "1px 4px", borderRadius: 3, fontWeight: 800 }}>Q</span>}
                            </div>
                          </td>
                          <td style={{ color: "var(--text-2)" }}>{row.mp}</td>
                          <td style={{ color: "var(--green)", fontWeight: 700 }}>{row.w}</td>
                          <td style={{ color: "var(--red)" }}>{row.l}</td>
                          <td style={{ color: "var(--yellow)", fontWeight: 800, fontSize: 14 }}>{row.pts}</td>
                          <td style={{ color: row.nrr.startsWith("+") ? "var(--green)" : "var(--red)", fontSize: 12 }}>{row.nrr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "8px 16px", fontSize: 10, color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>🟢 Q = Qualified for playoffs (Top 4)</div>
            </div>
          )}

          {/* ── MY BETS ──────────────────────────────────────────────────────── */}
          {tab === "mybets" && (
            <div>
              {betStats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Total", val: betStats.total, color: "var(--text-1)" },
                    { label: "Won",   val: betStats.won,   color: "var(--green)"  },
                    { label: "Lost",  val: betStats.lost,  color: "var(--red)"    },
                    { label: "Pending", val: betStats.pending, color: "var(--yellow)" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "var(--navy-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3, textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              )}

              {myBets.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 40 }}>📋</div>
                  <h3>No bets yet</h3>
                  <p>Place your first bet on an IPL match!</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setTab("schedule")}>View Matches</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {myBets.map((b, i) => {
                    const isWon  = b.status === "WON";
                    const isLost = b.status === "LOST";
                    return (
                      <div key={b.id || i} style={{ background: "var(--navy-3)", border: `1px solid ${isWon ? "rgba(46,204,113,0.3)" : isLost ? "rgba(231,76,60,0.2)" : "var(--border)"}`, borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{b.matchDesc}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{b.type} on <span style={{ fontWeight: 600, color: "var(--yellow)" }}>{b.selection}</span> @ {b.odds}x</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>🪙 {b.stake}</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>
                            {isWon  && <span style={{ color: "var(--green)",  fontWeight: 700 }}>✅ +{b.payout}</span>}
                            {isLost && <span style={{ color: "var(--red)",    fontWeight: 700 }}>❌ Lost</span>}
                            {!isWon && !isLost && <span style={{ color: "var(--yellow)", fontWeight: 700 }}>⏳ Pending</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
