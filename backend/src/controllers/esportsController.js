const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockEsportsMatches() {
  const base = Date.now();
  const mk = (id, t1, t2, comp, status, b1, b2) => ({
    id, t1, t2,
    competition: comp,
    event: comp,
    status,
    time: new Date(base).toISOString(),
    b1, b2, bx: "-",
  });

  return [
    mk("e1",  "T1",                  "JD Gaming",           "League of Legends Worlds", "LIVE",     "1.85", "1.95"),
    mk("e2",  "Natus Vincere",       "Team Vitality",       "CS:GO Major",              "LIVE",     "1.70", "2.10"),
    mk("e3",  "Team Liquid",         "Gaimin Gladiators",   "Dota 2 The International", "UPCOMING", "2.20", "1.65"),
    mk("e4",  "Fnatic",              "LOUD",                "Valorant Champions",       "UPCOMING", "1.50", "2.50"),
    mk("e5",  "Gen.G",               "Bilibili Gaming",     "League of Legends MSI",    "UPCOMING", "1.80", "1.90"),
    mk("e6",  "FaZe Clan",           "Cloud9",              "CS:GO IEM",                "LIVE",     "1.60", "2.30"),
    mk("e7",  "Tundra Esports",      "Team Spirit",         "Dota 2 Riyadh Masters",    "UPCOMING", "1.95", "1.85"),
    mk("e8",  "Paper Rex",           "Evil Geniuses",       "Valorant Masters",         "UPCOMING", "1.75", "2.05"),
    mk("e9",  "G2 Esports",          "MAD Lions",           "League of Legends LEC",    "LIVE",     "1.40", "2.80"),
    mk("e10", "Heroic",              "ENCE",                "CS:GO Blast Premier",      "UPCOMING", "1.85", "1.85"),
  ];
}

/**
 * GET /api/esports/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveEsportsMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.startsWith("esports") && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockEsportsMatches());
    }

    const matchResponses = await Promise.allSettled(
      activeTournaments.map((key) =>
        axios.get(
          `https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=eu,us&markets=h2h&oddsFormat=decimal`,
          { timeout: 8000 }
        )
      )
    );

    const allMatches = [];
    matchResponses.forEach((r) => {
      if (r.status !== "fulfilled" || !r.value.data) return;
      r.value.data.forEach((match) => {
        const homeTeam = match.home_team;
        const awayTeam = match.away_team;
        let b1 = "-", b2 = "-";

        if (match.bookmakers?.length) {
          const h2h = match.bookmakers[0].markets?.find((m) => m.key === "h2h");
          if (h2h?.outcomes) {
            const ho = h2h.outcomes.find((o) => o.name === homeTeam);
            const ao = h2h.outcomes.find((o) => o.name === awayTeam);
            if (ho) b1 = ho.price.toFixed(2);
            if (ao) b2 = ao.price.toFixed(2);
          }
        }

        allMatches.push({
          id: match.id,
          t1: homeTeam,
          t2: awayTeam,
          event: match.sport_title || "Esports Match",
          competition: match.sport_title || "Esports",
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockEsportsMatches());

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`Esports API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockEsportsMatches());
  }
};
