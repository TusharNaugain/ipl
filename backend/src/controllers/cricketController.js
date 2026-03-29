const axios = require("axios");

// Helper to generate realistic fancy markets for a cricket match
function generateFancyMarkets(team1, team2) {
  const t1 = team1.split(" ").pop(); // Short team name e.g. "Kings"
  const t2 = team2.split(" ").pop();
  return [
    { title: `6 OVER RUN ${t1}`,         yesValue: 44, noValue: 45, yesRate: 10, noRate: 10, minBet: 100, maxBet: 50000 },
    { title: `6 OVER RUN ${t2}`,         yesValue: 42, noValue: 43, yesRate: 10, noRate: 10, minBet: 100, maxBet: 50000 },
    { title: `MATCH 1ST OVER RUN ${t1}`, yesValue: 8,  noValue: 9,  yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `1ST WKT FALL RUN ${t1}`,   yesValue: 32, noValue: 33, yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `1ST WKT FALL RUN ${t2}`,   yesValue: 28, noValue: 29, yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `10 OVER RUN ${t1}`,        yesValue: 82, noValue: 83, yesRate: 10, noRate: 10, minBet: 100, maxBet: 50000 },
    { title: `10 OVER RUN ${t2}`,        yesValue: 80, noValue: 81, yesRate: 10, noRate: 10, minBet: 100, maxBet: 50000 },
    { title: `TOTAL MATCH 50S`,           yesValue: 4,  noValue: 5,  yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `TOTAL MATCH 100S`,          yesValue: 1,  noValue: 2,  yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `TOTAL MATCH WICKETS`,       yesValue: 12, noValue: 13, yesRate: 10, noRate: 10, minBet: 100, maxBet: 25000 },
    { title: `TOTAL MATCH RUNS`,          yesValue: 336, noValue: 337, yesRate: 10, noRate: 10, minBet: 100, maxBet: 100000 },
    { title: `${t1} TOTAL RUNS`,         yesValue: 168, noValue: 169, yesRate: 10, noRate: 10, minBet: 100, maxBet: 100000 },
  ];
}

// Fallback Offline Generator — prevents server crash when API quota runs out
function generateMockMatches() {
  const matches = [];
  const baseTime = Date.now();
  let idAcc = 100;

  const createSet = (comp, teams, liveMatchDesc) => {
    // 1 Live Match with full fancy markets
    matches.push({
      id: `mock_${idAcc++}`, t1: teams[0], t2: teams[1],
      time: new Date(baseTime).toISOString(),
      matchDesc: liveMatchDesc, competition: comp, status: "LIVE",
      b1: "1.85", l1: "1.90", b2: "2.10", l2: "2.15",
      fancyMarkets: generateFancyMarkets(teams[0], teams[1]),
    });
    // 3 Upcoming Matches (with indicative fancy markets)
    for (let i = 2; i <= 4; i++) {
      matches.push({
        id: `mock_${idAcc++}`, t1: teams[i % teams.length], t2: teams[(i+1) % teams.length],
        time: new Date(baseTime + (i * 86400000)).toISOString(),
        matchDesc: "Match starting soon", competition: comp, status: "UPCOMING",
        b1: "1.75", l1: "1.80", b2: "2.20", l2: "2.25",
        fancyMarkets: generateFancyMarkets(teams[i % teams.length], teams[(i+1) % teams.length]),
      });
    }
  };

  createSet("Indian Premier League 2026", ["Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bengaluru", "Kolkata Knight Riders", "Delhi Capitals"], "🔴 LIVE - 2nd Innings, 14.2 Overs, CSK need 45 runs");
  createSet("Pakistan Super League 2026", ["Lahore Qalandars", "Karachi Kings", "Peshawar Zalmi", "Islamabad United", "Quetta Gladiators"], "🔴 LIVE - 1st Innings, 8.4 Overs");
  createSet("Women's ODI Series 2026", ["India Women", "Australia Women", "England Women", "South Africa Women"], "🔴 LIVE - 2nd Innings, 38.4 Overs, India need 74 runs");
  createSet("Legends League Cricket 2026", ["India Capitals", "Bhilwara Kings", "Manipal Tigers", "Gujarat Giants"], "🔴 LIVE - 1st Innings, 12.0 Overs");

  return matches;
}

exports.getLiveScores = async (req, res) => {
  return res.status(200).json({ success: true, data: generateMockMatches(), cached: "offline_demo_mode" });
};
