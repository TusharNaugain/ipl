import { useState, useCallback } from "react";
import { getWalletUser, getTransactions } from "../../services/gameEngine";

// ── Pure client-side mines engine ─────────────────────────────────────────────
function generateBoard(mineCount) {
  // Place mines randomly on a 25-tile board
  const positions = Array.from({ length: 25 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return new Set(positions.slice(0, mineCount)); // set of mine indices
}

function getSurvivalMultiplier(totalSafe, revealed) {
  // Fair multiplier for revealing `revealed` tiles out of 25 with (25-totalSafe) mines
  // = (0.97) / P(surviving all picks)
  if (revealed === 0) return 1;
  const totalMines = 25 - totalSafe;
  let prob = 1;
  for (let i = 0; i < revealed; i++) {
    prob *= (totalSafe - i) / (25 - i);
  }
  return Math.max(1.01, parseFloat((0.97 / prob).toFixed(2)));
}

function deductLocal(amount) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if ((user.coins || 0) < amount) throw new Error("Not enough coins! 🪙");
  user.coins -= amount;
  localStorage.setItem("user", JSON.stringify(user));
  const txns = JSON.parse(localStorage.getItem("txns") || "[]");
  txns.unshift({ _id: Date.now() + Math.random(), type: "BET", amount, description: "Mines bet placed", createdAt: new Date().toISOString() });
  localStorage.setItem("txns", JSON.stringify(txns.slice(0, 200)));
  return user.coins;
}

function creditLocal(amount, description) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  user.coins = (user.coins || 0) + amount;
  localStorage.setItem("user", JSON.stringify(user));
  const txns = JSON.parse(localStorage.getItem("txns") || "[]");
  txns.unshift({ _id: Date.now() + Math.random(), type: "WIN", amount, description, createdAt: new Date().toISOString() });
  localStorage.setItem("txns", JSON.stringify(txns.slice(0, 200)));
  return user.coins;
}

function lossLocal(amount) {
  const txns = JSON.parse(localStorage.getItem("txns") || "[]");
  txns.unshift({ _id: Date.now() + Math.random(), type: "LOSS", amount, description: "Mines — hit a mine!", createdAt: new Date().toISOString() });
  localStorage.setItem("txns", JSON.stringify(txns.slice(0, 200)));
}
// ─────────────────────────────────────────────────────────────────────────────

const MINE_COUNTS = [1, 3, 5, 10, 15, 20, 24];

export default function MinesGame({ setPage }) {
  const [mineCount, setMineCount] = useState(5);
  const [amount, setAmount] = useState(100);
  const [gameState, setGameState] = useState("idle"); // idle | playing | won | lost
  const [board, setBoard] = useState(null);        // Set of mine positions
  const [revealed, setRevealed] = useState([]);    // array of clicked tile indices
  const [explodedAt, setExplodedAt] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [cashedOut, setCashedOut] = useState(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(() => (JSON.parse(localStorage.getItem("user") || "{}")).coins || 0);

  const totalSafe = 25 - mineCount;

  const startGame = () => {
    setError("");
    const amt = parseInt(amount);
    if (!amt || amt < 10) return setError("Minimum bet is 10 coins");
    try {
      const newBalance = deductLocal(amt);
      const mines = generateBoard(mineCount);
      setBoard(mines);
      setRevealed([]);
      setExplodedAt(null);
      setCashedOut(null);
      setBetAmount(amt);
      setCurrentMultiplier(1);
      setGameState("playing");
      setBalance(newBalance);
    } catch (e) { setError(e.message); }
  };

  const clickTile = useCallback((index) => {
    if (gameState !== "playing") return;
    if (revealed.includes(index)) return;

    if (board.has(index)) {
      // BOOM
      setExplodedAt(index);
      setGameState("lost");
      lossLocal(betAmount);
    } else {
      const newRevealed = [...revealed, index];
      const mult = getSurvivalMultiplier(totalSafe, newRevealed.length);
      setRevealed(newRevealed);
      setCurrentMultiplier(mult);
      // Auto cash out if all safe tiles revealed
      if (newRevealed.length === totalSafe) {
        const payout = Math.floor(betAmount * mult);
        const newBal = creditLocal(payout, `Mines win: ${mult}x (all safe!)`);
        setCashedOut({ payout, mult });
        setGameState("won");
        setBalance(newBal);
      }
    }
  }, [gameState, revealed, board, betAmount, totalSafe]);

  const cashOut = () => {
    if (gameState !== "playing" || revealed.length === 0) return;
    const payout = Math.floor(betAmount * currentMultiplier);
    const newBal = creditLocal(payout, `Mines cash out: ${currentMultiplier}x`);
    setCashedOut({ payout, mult: currentMultiplier });
    setGameState("won");
    setBalance(newBal);
  };

  const reset = () => {
    setGameState("idle");
    setBoard(null);
    setRevealed([]);
    setExplodedAt(null);
    setCashedOut(null);
    setError("");
  };

  const getTileContent = (i) => {
    if (gameState === "playing") {
      if (revealed.includes(i)) return { icon: "💎", bg: "rgba(67,233,123,0.2)", border: "rgba(67,233,123,0.5)" };
      return { icon: "?", bg: "var(--bg-hover)", border: "var(--border)" };
    }
    if (gameState === "lost" || gameState === "won") {
      const isMine = board?.has(i);
      const isRevealed = revealed.includes(i);
      const isExploded = i === explodedAt;
      if (isExploded) return { icon: "💥", bg: "rgba(255,101,132,0.35)", border: "#ff6584" };
      if (isMine) return { icon: "💣", bg: "rgba(255,101,132,0.1)", border: "rgba(255,101,132,0.2)" };
      if (isRevealed) return { icon: "💎", bg: "rgba(67,233,123,0.2)", border: "rgba(67,233,123,0.5)" };
      return { icon: "✓", bg: "rgba(67,233,123,0.05)", border: "rgba(67,233,123,0.15)" };
    }
    return { icon: "?", bg: "var(--bg-hover)", border: "var(--border)" };
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button className="btn" onClick={() => setPage("games")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>← Back</button>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>💣 Mines</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Click tiles — avoid bombs — cash out!</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase" }}>Balance</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#43e97b" }}>🪙 {balance}</div>
        </div>
      </div>

      {/* Result Banner */}
      {gameState === "won" && cashedOut && (
        <div style={{ background: "rgba(67,233,123,0.12)", border: "1px solid rgba(67,233,123,0.4)", borderRadius: 14, padding: "16px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>💎</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#43e97b" }}>+{cashedOut.payout} coins! ({cashedOut.mult}x)</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>New Balance: 🪙 {balance}</div>
        </div>
      )}
      {gameState === "lost" && (
        <div style={{ background: "rgba(255,101,132,0.12)", border: "1px solid rgba(255,101,132,0.4)", borderRadius: 14, padding: "16px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>💥</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#ff6584" }}>BOOM! You hit a mine!</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Lost 🪙 {betAmount}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* 5×5 Grid */}
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {Array.from({ length: 25 }).map((_, i) => {
              const tile = getTileContent(i);
              const isClickable = gameState === "playing" && !revealed.includes(i) && explodedAt !== i;
              return (
                <div key={i} onClick={() => isClickable && clickTile(i)}
                  style={{
                    height: 64, borderRadius: 10,
                    background: tile.bg,
                    border: `2px solid ${tile.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: tile.icon === "?" ? 20 : 26,
                    cursor: isClickable ? "pointer" : "default",
                    transition: "all 0.15s",
                    fontWeight: 700,
                    color: tile.icon === "?" ? "var(--text-3)" : undefined,
                    transform: isClickable ? undefined : undefined,
                    userSelect: "none",
                  }}
                  onMouseEnter={e => { if (isClickable) e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                >
                  {tile.icon}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="card" style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", gap: 16 }}>
          {gameState === "idle" ? (
            <>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase" }}>Mines Count</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MINE_COUNTS.map(c => (
                    <button key={c} onClick={() => setMineCount(c)} className="btn"
                      style={{ padding: "6px 10px", fontSize: 13, fontWeight: 700, background: mineCount === c ? "var(--accent)" : "var(--bg-hover)", color: mineCount === c ? "#fff" : "var(--text-2)", border: `1px solid ${mineCount === c ? "var(--accent)" : "var(--border)"}` }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>💎 Safe tiles: {25 - mineCount}</div>
              <div className="form-group">
                <label>Bet Amount</label>
                <input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)} />
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {[50, 100, 500, 1000].map(v => (
                    <button key={v} className="btn" onClick={() => setAmount(v)} style={{ padding: "3px 8px", fontSize: 11, background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-2)" }}>{v}</button>
                  ))}
                </div>
              </div>
              {error && <div className="error-msg">⚠️ {error}</div>}
              <button className="btn btn-primary" onClick={startGame} style={{ width: "100%", padding: "12px" }}>
                💣 Start Game
              </button>
            </>
          ) : gameState === "playing" ? (
            <>
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase" }}>Current Multiplier</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#43e97b", letterSpacing: "-1px" }}>{currentMultiplier}x</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
                  {revealed.length === 0 ? "Click a tile to start!" : `${revealed.length} safe found`}
                </div>
              </div>
              <div style={{ background: "var(--bg-hover)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Potential payout</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#43e97b" }}>🪙 {Math.floor(betAmount * currentMultiplier)}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
                💣 {mineCount} mines | 💎 {25 - mineCount - revealed.length} safe left
              </div>
              <button className="btn btn-primary" onClick={cashOut} disabled={revealed.length === 0}
                style={{ width: "100%", padding: "12px", background: revealed.length > 0 ? "linear-gradient(90deg, #43e97b, #38f9d7)" : undefined }}>
                💰 Cash Out ({Math.floor(betAmount * currentMultiplier)} coins)
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                  {gameState === "won" ? `Cashed out at ${cashedOut?.mult}x` : `Hit mine after ${revealed.length} safe${revealed.length !== 1 ? "s" : ""}`}
                </div>
              </div>
              <button className="btn btn-primary" onClick={reset} style={{ width: "100%", padding: "12px" }}>
                🔄 Play Again
              </button>
              <button className="btn" onClick={() => setPage("games")} style={{ width: "100%", background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                All Games
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
