import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";

// ── Bet Slip (inline bottom panel) ────────────────────────────────────────────
function BetSlip({ match, betContext, onClose, onPlaced }) {
  const [stake, setStake] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const balance = user.coins || 0;
  const { type, label, odds } = betContext;
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
    } catch { setError("Failed to place bet"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: "var(--bg-card, #1a1a2e)",
      borderTop: "2px solid var(--accent, #6c63ff)",
      borderRadius: "16px 16px 0 0",
      padding: "16px 20px",
      boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
    }}>
      {placed ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 36 }}>✅</div>
          <div style={{ fontWeight: 800, color: "var(--success, #43e97b)", fontSize: 15, marginTop: 4 }}>Bet Placed!</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase" }}>{type} Bet</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1, #fff)", marginTop: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 1 }}>{match.team1} vs {match.team2}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>ODDS</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: type === "BACK" ? "#72BBEF" : type === "LAY" ? "#FAA9BA" : "#f2b824" }}>{parseFloat(odds).toFixed(2)}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: 20, cursor: "pointer", marginLeft: 8 }}>✕</button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 5 }}>Stake (Balance: 🪙 {balance})</div>
            <input type="number" min="10" value={stake} onChange={e => setStake(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid var(--border, #333)", borderRadius: 6, padding: "8px 10px", color: "var(--text-1, #fff)", fontSize: 14, fontWeight: 700, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {[100, 500, 1000, 5000].map(v => (
                <button key={v} onClick={() => setStake(v)} className="btn" style={{ padding: "3px 10px", fontSize: 11 }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 6, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <div>
              <div style={{ color: "var(--text-2)" }}>Payout</div>
              <div style={{ fontWeight: 800, color: "#f2b824", fontSize: 15 }}>🪙 {potentialPayout}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--text-2)" }}>Profit</div>
              <div style={{ fontWeight: 700, color: "var(--success, #43e97b)", fontSize: 15 }}>+🪙 {profit}</div>
            </div>
          </div>
          {error && <div style={{ color: "var(--danger, #ff6584)", fontSize: 12, marginBottom: 8 }}>⚠️ {error}</div>}
          <button onClick={handlePlace} disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "13px", fontSize: 14, fontWeight: 800 }}>
            {loading ? "Placing..." : `Place ${type} • 🪙 ${stake}`}
          </button>
        </>
      )}
    </div>
  );
}

// ── Match Detail View (Odds + Fancy Markets) ───────────────────────────────────
function MatchDetailView({ match, liveOdds, fancyTicks, onBack }) {
  const [betContext, setBetContext] = useState(null);
  const [section, setSection]      = useState("odds");

  const isLive = match.status === "LIVE";
  const currOdds = liveOdds[match._id] || match.odds || {};
  const t1o = currOdds.team1 || { back: 1.90, lay: 2.00 };
  const t2o = currOdds.team2 || { back: 1.90, lay: 2.00 };
  const fancyMarkets = fancyTicks[match._id]?.fancyMarkets || match.fancyMarkets || [];

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "";

  return (
    <div style={{ paddingBottom: betContext ? 220 : 0 }}>
      <button onClick={onBack} className="btn" style={{ marginBottom: 12, fontSize: 12 }}>← Back</button>

      {/* Match Header */}
      <div className="card" style={{ marginBottom: 12, border: isLive ? "1px solid rgba(67,233,123,0.3)" : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{match.competition}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)" }}>
              {match.team1}
              <span style={{ color: "var(--text-2)", margin: "0 10px", fontWeight: 400 }}>vs</span>
              {match.team2}
            </div>
            {match.score && <div style={{ fontSize: 12, color: "#f2b824", marginTop: 4 }}>📊 {match.score}</div>}
            {!isLive && <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>📅 {fmtDate(match.scheduledAt)}</div>}
          </div>
          {isLive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(67,233,123,0.1)", border: "1px solid rgba(67,233,123,0.3)", borderRadius: 20, padding: "5px 14px" }}>
              <span className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--success, #43e97b)" }}>IN-PLAY</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[{ id:"odds", label:"📊 Match Odds" }, { id:"fancy", label:"🎯 Fancy" }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} className="btn"
            style={{ fontSize: 12, padding: "8px 16px", fontWeight: 700, background: section === s.id ? "var(--accent, #6c63ff)" : "var(--bg-card)", color: section === s.id ? "#fff" : "var(--text-2)", border: `1px solid ${section === s.id ? "var(--accent, #6c63ff)" : "var(--border)"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── MATCH ODDS ─────────────────────────────────────────────────────── */}
      {section === "odds" && (
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 100px 100px", fontSize: 10, fontWeight: 700, color: "var(--text-2)" }}>
            <div>TEAM</div>
            <div style={{ textAlign: "center", color: "#72BBEF" }}>BACK</div>
            <div style={{ textAlign: "center", color: "#FAA9BA" }}>LAY</div>
          </div>
          {[
            { label: match.team1, oddsKey: t1o, side: "team1" },
            { label: match.team2, oddsKey: t2o, side: "team2" },
          ].map(({ label, oddsKey, side }) => (
            <div key={side} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 13 }}>{label}</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div onClick={() => setBetContext({ type:"BACK", label:`${label} to WIN`, odds: oddsKey.back })}
                  style={{ background:"#72BBEF", color:"#1a1a2e", borderRadius:4, padding:"6px 12px", textAlign:"center", cursor:"pointer", minWidth:70, transition:"all 0.15s" }}>
                  <div style={{ fontSize:14, fontWeight:900 }}>{(oddsKey.back||1.90).toFixed(2)}</div>
                  <div style={{ fontSize:9, fontWeight:700, opacity:0.7 }}>BACK</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div onClick={() => setBetContext({ type:"LAY", label:`${label} Lay`, odds: oddsKey.lay })}
                  style={{ background:"#FAA9BA", color:"#1a1a2e", borderRadius:4, padding:"6px 12px", textAlign:"center", cursor:"pointer", minWidth:70, transition:"all 0.15s" }}>
                  <div style={{ fontSize:14, fontWeight:900 }}>{(oddsKey.lay||2.00).toFixed(2)}</div>
                  <div style={{ fontSize:9, fontWeight:700, opacity:0.7 }}>LAY</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FANCY MARKETS ──────────────────────────────────────────────────── */}
      {section === "fancy" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color:"var(--text-1)" }}>🎯 Fancy Markets</div>
              <div style={{ fontSize: 10, color:"var(--text-2)", marginTop:2 }}>YES / NO session bets</div>
            </div>
            {isLive && <span style={{ fontSize: 10, background:"rgba(67,233,123,0.1)", border:"1px solid rgba(67,233,123,0.3)", color:"var(--success,#43e97b)", borderRadius:20, padding:"3px 10px", fontWeight:700 }}>🔴 LIVE</span>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px", padding:"6px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:9, fontWeight:700, color:"var(--text-2)", textTransform:"uppercase" }}>
            <div>Market</div>
            <div style={{ textAlign:"center", color:"#FAA9BA" }}>NO</div>
            <div style={{ textAlign:"center", color:"#72BBEF" }}>YES</div>
          </div>

          {fancyMarkets.length === 0 ? (
            <div className="empty-state" style={{ padding:"30px 20px" }}>
              <div style={{ fontSize:32 }}>🎯</div>
              <h3 style={{ color:"var(--text-1)" }}>No Fancy Markets</h3>
              <p>Admin will add fancy markets when the match goes live.</p>
            </div>
          ) : (
            fancyMarkets.map((fm, i) => (
              <div key={fm._id || i} style={{
                display:"grid", gridTemplateColumns:"1fr 90px 90px",
                padding:"9px 16px",
                borderBottom:"1px solid rgba(255,255,255,0.03)",
                alignItems:"center",
                background: i%2===0 ? "transparent" : "rgba(255,255,255,0.01)",
                opacity: fm.suspended ? 0.45 : 1,
              }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{fm.title}</div>
                  {fm.suspended && <div style={{ fontSize:9, color:"#f2b824", fontWeight:700, marginTop:2 }}>⏸ SUSPENDED</div>}
                  {fm.result !== "PENDING" && <div style={{ fontSize:9, color: fm.result==="YES" ? "var(--success,#43e97b)" : "var(--danger,#ff6584)", fontWeight:700 }}>✅ {fm.result}</div>}
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <div onClick={() => !fm.suspended && fm.result!=="YES" && fm.result!=="NO" && setBetContext({ type:"NO", label:`${fm.title} — NO ${fm.noValue}`, odds: 1 + (fm.noRate||10)/100 })}
                    style={{ background: fm.suspended?"#2a2a3a":"#FAA9BA", color: fm.suspended?"#555":"#1a1a2e", borderRadius:4, padding:"5px 10px", textAlign:"center", cursor: fm.suspended?"default":"pointer", minWidth:70, transition:"all 0.15s" }}>
                    <div style={{ fontSize:14, fontWeight:900 }}>{fm.noValue}</div>
                    <div style={{ fontSize:9, fontWeight:700, opacity:0.7 }}>{fm.noRate}</div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <div onClick={() => !fm.suspended && fm.result!=="YES" && fm.result!=="NO" && setBetContext({ type:"YES", label:`${fm.title} — YES ${fm.yesValue}`, odds: 1 + (fm.yesRate||10)/100 })}
                    style={{ background: fm.suspended?"#2a2a3a":"#72BBEF", color: fm.suspended?"#555":"#1a1a2e", borderRadius:4, padding:"5px 10px", textAlign:"center", cursor: fm.suspended?"default":"pointer", minWidth:70, transition:"all 0.15s" }}>
                    <div style={{ fontSize:14, fontWeight:900 }}>{fm.yesValue}</div>
                    <div style={{ fontSize:9, fontWeight:700, opacity:0.7 }}>{fm.yesRate}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {betContext && (
        <BetSlip match={match} betContext={betContext} onClose={() => setBetContext(null)} onPlaced={() => setBetContext(null)} />
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IPLLive() {
  const [matches, setMatches]         = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [liveOdds, setLiveOdds]       = useState({});
  const [fancyTicks, setFancyTicks]   = useState({});
  const [predictions, setPredictions] = useState([]);
  const [livePred, setLivePred]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cricket/live");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const parsed = data.data.map(m => ({
          _id: m.id || Math.random().toString(),
          team1: m.t1, team2: m.t2,
          status: m.status, competition: m.competition,
          score: m.matchDesc,
          scheduledAt: new Date(m.time + "Z").getTime(),
          fancyMarkets: m.fancyMarkets || [],
          odds: { team1:{back:parseFloat(m.b1),lay:parseFloat(m.l1)}, team2:{back:parseFloat(m.b2),lay:parseFloat(m.l2)} }
        }));
        setMatches(parsed);
      }
    } catch { setMatches([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMatches(); }, []);

  useEffect(() => {
    if (selectedMatch) {
      api.get(`/predictions?matchId=${selectedMatch._id}`).then(setPredictions).catch(() => {});
    }
  }, [selectedMatch]);

  useEffect(() => {
    socket.on("match:odds_tick", ({ matchId, odds }) => setLiveOdds(prev => ({ ...prev, [matchId]: odds })));
    socket.on("match:fancy_tick", ({ matchId, fancyMarkets }) => setFancyTicks(prev => ({ ...prev, [matchId]: { fancyMarkets } })));
    socket.on("prediction:live", (pred) => {
      setLivePred(pred);
      setPredictions(prev => [pred, ...prev].slice(0, 30));
      setTimeout(() => setLivePred(null), 5000);
    });
    return () => {
      socket.off("match:odds_tick");
      socket.off("match:fancy_tick");
      socket.off("prediction:live");
    };
  }, []);

  const confColor = c => c >= 80 ? "#43e97b" : c >= 60 ? "#ffc700" : "#ff6584";

  // If a match is selected, show match detail with fancy markets
  if (selectedMatch) {
    return (
      <MatchDetailView
        match={selectedMatch}
        liveOdds={liveOdds}
        fancyTicks={fancyTicks}
        onBack={() => setSelectedMatch(null)}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1><span className="live-dot" />IPL Live</h1>
        <p>Live odds, fancy markets & expert predictions</p>
      </div>

      {/* Live prediction flash */}
      {livePred && (
        <div style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.25),rgba(255,101,132,0.15))", border:"1px solid rgba(108,99,255,0.4)", borderRadius:14, padding:"20px 24px", marginBottom:20, animation:"slideIn 0.3s ease" }}>
          <div style={{ fontSize:11, color:"var(--accent)", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>⚡ LIVE PREDICTION</div>
          <div style={{ fontSize:22, fontWeight:700, color:"var(--text-1)" }}>{livePred.prediction}</div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            {livePred.ballNo && <span style={{ fontSize:13, color:"var(--text-2)" }}>Ball {livePred.ballNo}</span>}
            <span style={{ fontSize:13, color:confColor(livePred.confidence), fontWeight:600 }}>{livePred.confidence}% confident</span>
            {livePred.isVIP && <span className="badge purple">VIP</span>}
          </div>
        </div>
      )}

      {/* Match selector */}
      {loading ? (
        <div className="empty-state"><div style={{ fontSize:32 }}>⏳</div><p>Loading matches...</p></div>
      ) : matches.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize:32 }}>🏏</div><h3>No matches</h3><p>Admin hasn't added any matches yet.</p></div>
      ) : (
        <>
          <div style={{ marginBottom:8, fontSize:12, fontWeight:600, color:"var(--text-2)" }}>Select a match to view odds & fancy markets:</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {matches.map(m => {
              const isLive = m.status === "LIVE";
              const o = liveOdds[m._id] || m.odds || {};
              return (
                <div key={m._id} onClick={() => setSelectedMatch(m)}
                  style={{ background:"var(--bg-card)", border:`1px solid ${isLive?"rgba(67,233,123,0.3)":"var(--border)"}`, borderRadius:10, padding:"12px 16px", cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                    <div>
                      {isLive && <span style={{ fontSize:9, background:"rgba(67,233,123,0.15)", color:"var(--success,#43e97b)", borderRadius:20, padding:"2px 8px", fontWeight:800, marginRight:8 }}>🔴 IN-PLAY</span>}
                      <span style={{ fontSize:10, color:"var(--text-2)" }}>{m.competition}</span>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--text-1)", marginTop:4 }}>{m.team1} <span style={{ fontWeight:400, color:"var(--text-2)", margin:"0 6px" }}>vs</span> {m.team2}</div>
                      {m.score && <div style={{ fontSize:11, color:"#f2b824", marginTop:2 }}>{m.score}</div>}
                    </div>
                    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      <div style={{ background:"#72BBEF", color:"#1a1a2e", borderRadius:4, padding:"5px 10px", textAlign:"center", minWidth:56 }}>
                        <div style={{ fontSize:13, fontWeight:900 }}>{(o.team1?.back||1.90).toFixed(2)}</div>
                        <div style={{ fontSize:8, fontWeight:700 }}>BACK</div>
                      </div>
                      <div style={{ background:"#FAA9BA", color:"#1a1a2e", borderRadius:4, padding:"5px 10px", textAlign:"center", minWidth:56 }}>
                        <div style={{ fontSize:13, fontWeight:900 }}>{(o.team1?.lay||2.00).toFixed(2)}</div>
                        <div style={{ fontSize:8, fontWeight:700 }}>LAY</div>
                      </div>
                    </div>
                  </div>
                  {m.fancyMarkets?.length > 0 && (
                    <div style={{ marginTop:6, fontSize:10, color:"var(--text-2)", display:"flex", alignItems:"center", gap:4 }}>
                      <span>🎯</span> <span>{m.fancyMarkets.length} Fancy Markets available</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Predictions */}
      {selectedMatch === null && predictions.length > 0 && (
        <div className="card" style={{ marginTop:24 }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"var(--text-2)" }}>Expert Predictions</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Ball</th><th>Prediction</th><th>Confidence</th><th>Result</th></tr></thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p._id}>
                    <td>{p.ballNo || "—"}</td>
                    <td style={{ color:"var(--text-1)", fontWeight:500 }}>
                      {p.isVIP && !user.isVIP
                        ? <span style={{ color:"var(--text-2)" }}>💎 VIP Only</span>
                        : p.prediction}
                    </td>
                    <td><span style={{ color:confColor(p.confidence), fontWeight:600 }}>{p.confidence}%</span></td>
                    <td><span className={`badge ${p.result==="CORRECT"?"green":p.result==="WRONG"?"red":"yellow"}`}>{p.result}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
