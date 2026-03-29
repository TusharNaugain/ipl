// ── Right Panel — Betslip (Parimatch style) ────────────────────────────────
import { useState, useEffect } from "react";

export default function RightPanel({ setPage }) {
  const [tab, setTab] = useState("betslip"); // betslip | mybets
  const [myBets, setMyBets] = useState([]);

  // Load bets globally across components
  useEffect(() => {
    const loadBets = () => {
      const saved = JSON.parse(localStorage.getItem("betlab_my_bets") || "[]");
      setMyBets(saved);
    };
    loadBets();
    window.addEventListener("bet_placed", loadBets);
    return () => window.removeEventListener("bet_placed", loadBets);
  }, []);

  return (
    <aside style={{
      width: 280, minWidth: 280, height: "100%", background: "var(--bg)",
      borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Header Tabs */}
      <div style={{ display: "flex", background: "var(--navy-2)" }}>
        {["betslip", "mybets"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "16px 0", border: "none", background: "transparent",
              fontFamily: "inherit", fontSize: 13, fontWeight: tab === t ? 800 : 600, cursor: "pointer",
              color: tab === t ? "var(--yellow)" : "var(--text-3)",
              borderBottom: tab === t ? "3px solid var(--yellow)" : "3px solid transparent",
              transition: "var(--transition)", textTransform: "uppercase", letterSpacing: "0.5px"
            }}
            onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = "var(--text-2)"; }}
            onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = "var(--text-3)"; }}
          >
            {t === "betslip" ? "Betslip" : "My Bets"}
          </button>
        ))}
      </div>

      {/* Slip Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--navy-2)", margin: "16px", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden" }}>
        {tab === "betslip" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
            {/* Empty ticket icon */}
            <div style={{ width: 64, height: 64, background: "rgba(252,163,17,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              🎟️
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>Your betslip is empty</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>Please make one or more selections in order to place bets.</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: myBets.length > 0 ? 0 : 24, overflow: "hidden" }}>
            {myBets.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, margin: "auto" }}>
                <span style={{ fontSize: 32, opacity: 0.5 }}>📋</span>
                <div style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", lineHeight: 1.5 }}>No active bets found.</div>
                <button onClick={() => setPage("home")} style={{ marginTop: 12, padding: "10px 24px", background: "var(--navy-4)", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--text-1)", fontFamily: "inherit", transition: "var(--transition)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--navy-5)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--navy-4)"}>
                  Go to Sports
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {myBets.map((b, i) => (
                  <div key={i} style={{ background: "var(--navy-3)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 700 }}>{b.date}</span>
                      <span style={{ fontSize: 10, color: "var(--yellow)", fontWeight: 800 }}>PENDING</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
                      {b.team} <span style={{ color: "var(--yellow)", marginLeft: 6 }}>@{b.odds}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 10 }}>{b.matchDesc}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 9, color: "var(--text-3)" }}>STAKE</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>₹{b.stake}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                        <span style={{ fontSize: 9, color: "var(--text-3)" }}>EST. RETURN</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--green)" }}>₹{b.return}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Betslip Footer Actions (Disabled when empty) */}
      <div style={{ padding: "0 16px 16px" }}>
        <button disabled style={{ width: "100%", padding: "14px", background: "var(--navy-4)", color: "var(--text-3)", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 800, textTransform: "uppercase", cursor: "not-allowed", fontFamily: "inherit" }}>
          Place Bet
        </button>
      </div>

    </aside>
  );
}
