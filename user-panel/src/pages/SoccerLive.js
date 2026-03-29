import { useEffect, useState } from "react";

function SectionHeader({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, background: "var(--yellow)", borderRadius: 2 }}></div>
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "0.5px" }}>{title}</span>
      </div>
    </div>
  );
}

export default function SoccerLive({ setPage }) {
  const [soccerMatches, setSoccerMatches] = useState([]);
  const [loadingSoccer, setLoadingSoccer] = useState(true);

  // Simple local state to simulate selection
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
      matchDesc: selectedBet.matchDesc || "Soccer Match",
      stake: stake,
      return: estReturn
    };

    const saved = JSON.parse(localStorage.getItem("betlab_my_bets") || "[]");
    localStorage.setItem("betlab_my_bets", JSON.stringify([newBet, ...saved]));
    window.dispatchEvent(new Event("bet_placed"));
    setBetSuccess(true);
  };

  useEffect(() => { 
    // Fetch live soccer data from our new RapidAPI integration
    fetch('http://localhost:5000/api/soccer/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.schedules) {
          // Process ALL matches instead of just slice(0, 5)
          const sMatches = data.data.schedules.map(s => {
            const event = s.sport_event;
            const home = event.competitors?.find(c => c.qualifier === "home")?.name || "Home";
            const away = event.competitors?.find(c => c.qualifier === "away")?.name || "Away";
            const comp = event.sport_event_context?.competition?.name || "Soccer Match";
            
            // Format time nicely
            const dateObj = new Date(event.start_time);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + dateObj.toLocaleDateString();

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
  }, []);

  return (
    <div style={{ background: "var(--bg)", margin: -20, padding: 24, minHeight: "100%" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>⚽</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Soccer Center</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>All Live & Upcoming Global Matches</div>
            </div>
            {soccerMatches.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "var(--green)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                {soccerMatches.length} MATCHES
              </div>
            )}
          </div>
        </div>

        {/* ── All Soccer Matches ──────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            
            {loadingSoccer ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", background: "var(--navy-3)", borderRadius: 8, border: "1px solid var(--border)" }}>Loading Sportradar Soccer...</div>
            ) : soccerMatches.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", background: "var(--navy-3)", borderRadius: 8, border: "1px solid var(--border)" }}>No soccer matches currently available.</div>
            ) : (
              soccerMatches.map((m, i) => (
                <div key={m.id || i} style={{ background: "var(--navy-3)", borderRadius: 8, border: "1px solid var(--border)", transition: "var(--transition)", overflow: "hidden" }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = "var(--yellow)"}
                     onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  
                  {/* Match Header Row */}
                  <div style={{ display: "flex", alignItems: "center", padding: "16px 20px" }}>
                    {/* Match Info */}
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setSelectedBet(null)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, background: "var(--red)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>LIVE</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>{m.time} • {m.matchDesc}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(255,255,255,0.2)", borderRadius: "50%" }} /> {m.t1}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, background: "rgba(255,255,255,0.2)", borderRadius: "50%" }} /> {m.t2}
                        </div>
                      </div>
                    </div>

                    {/* 1X2 Odds Section */}
                    <div style={{ display: "flex", gap: 32 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)" }}>1 (Home)</span>
                        <button onClick={() => { setSelectedBet({ match: m, type: "1", team: m.t1, odds: m.b1, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                                style={{ width: 60, padding: "8px 0", background: selectedBet?.match.id === m.id && selectedBet?.type === "1" ? "var(--yellow)" : "var(--navy-4)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 14, fontWeight: 800, color: selectedBet?.match.id === m.id && selectedBet?.type === "1" ? "#000" : "var(--yellow)", cursor: "pointer", transition: "var(--transition)" }}
                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
                                onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>{m.b1}</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)" }}>X (Draw)</span>
                        <button onClick={() => { setSelectedBet({ match: m, type: "X", team: "Draw", odds: m.bx, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                                style={{ width: 60, padding: "8px 0", background: selectedBet?.match.id === m.id && selectedBet?.type === "X" ? "var(--yellow)" : "var(--navy-4)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 14, fontWeight: 800, color: selectedBet?.match.id === m.id && selectedBet?.type === "X" ? "#000" : "var(--text-2)", cursor: "pointer", transition: "var(--transition)" }}
                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
                                onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>{m.bx}</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)" }}>2 (Away)</span>
                        <button onClick={() => { setSelectedBet({ match: m, type: "2", team: m.t2, odds: m.b2, matchDesc: `${m.t1} vs ${m.t2}` }); setBetSuccess(false); }}
                                style={{ width: 60, padding: "8px 0", background: selectedBet?.match.id === m.id && selectedBet?.type === "2" ? "var(--yellow)" : "var(--navy-4)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 14, fontWeight: 800, color: selectedBet?.match.id === m.id && selectedBet?.type === "2" ? "#000" : "var(--yellow)", cursor: "pointer", transition: "var(--transition)" }}
                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
                                onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>{m.b2}</button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Betting Slip (Expands when an odd is clicked) */}
                  {selectedBet?.match.id === m.id && (
                    <div style={{ background: "rgba(252,163,17,0.05)", padding: "16px 20px", borderTop: "1px solid rgba(252,163,17,0.2)", display: "flex", gap: 20, alignItems: "center", animation: "slideIn 0.2s ease" }}>
                      {betSuccess ? (
                        <div style={{ width: "100%", textAlign: "center", padding: "10px", color: "var(--green)", fontWeight: 800, fontSize: 16 }}>
                          ✅ Bet placed successfully on {selectedBet.team} @ {selectedBet.odds}!
                        </div>
                      ) : (
                        <>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>SELECTED PICK</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>{selectedBet.team} <span style={{ color: "var(--yellow)", marginLeft: 8 }}>{selectedBet.odds}</span></div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 14, fontWeight: 700 }}>₹</span>
                              <input id="stake-input" type="number" defaultValue="1000" style={{ width: 120, padding: "12px 12px 12px 28px", background: "var(--navy-5)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-1)", fontSize: 14, fontWeight: 800, outline: "none" }} />
                            </div>
                            <button onClick={handlePlaceBet}
                                    style={{ padding: "12px 24px", background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", transition: "var(--transition)" }}
                                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                                    onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>
                              Place Bet
                            </button>
                            <button onClick={() => setSelectedBet(null)}
                                    style={{ padding: "12px", background: "transparent", color: "var(--text-3)", border: "none", fontSize: 18, cursor: "pointer" }}>
                              ✕
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
