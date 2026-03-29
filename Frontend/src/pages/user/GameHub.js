export default function GameHub({ setPage }) {
  const games = [
    {
      id: "color", icon: "🎨", label: "Color Prediction",
      desc: "Pick Red, Green or Violet and win up to 4.5x!",
      tag: "Popular", tagColor: "purple",
      gradient: "135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1)"
    },
    {
      id: "dice", icon: "🎲", label: "Dice Roll",
      desc: "Guess the dice number correctly and win 5.5x!",
      tag: "High Reward", tagColor: "blue",
      gradient: "135deg, rgba(99,179,255,0.15), rgba(108,99,255,0.1)"
    },
    {
      id: "spin", icon: "🎰", label: "Spin Wheel",
      desc: "Spin the wheel and win up to 10x your bet!",
      tag: "Jackpot", tagColor: "green",
      gradient: "135deg, rgba(67,233,123,0.15), rgba(99,179,255,0.08)"
    },
  ];

  return (
    <div>
      <div className="page-header"><h1>🎮 Games</h1><p>Play and win coins</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {games.map(g => (
          <div key={g.id} onClick={() => setPage(g.id)}
            style={{
              background: `linear-gradient(${g.gradient})`,
              border: "1px solid var(--border)", borderRadius: 16,
              padding: "28px 24px", cursor: "pointer", transition: "all 0.25s"
            }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ fontSize: 48 }}>{g.icon}</div>
              <span className={`badge ${g.tagColor}`}>{g.tag}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>{g.label}</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 20 }}>{g.desc}</div>
            <button className="btn btn-primary" style={{ width: "100%" }}>Play Now →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
