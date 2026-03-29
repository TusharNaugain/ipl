const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockHockeyMatches() {
  const base = Date.now();
  const mk = (id, t1, t2, comp, status, b1, b2, bx) => ({
    id, t1, t2,
    competition: comp,
    event: comp,
    status,
    time: new Date(base).toISOString(),
    b1, b2, bx,
  });

  return [
    mk("h1",  "Edmonton Oilers",     "Colorado Avalanche",  "NHL",             "LIVE",     "1.70", "2.15", "5.50"),
    mk("h2",  "Boston Bruins",       "Tampa Bay Lightning",  "NHL",            "LIVE",     "1.85", "1.98", "5.20"),
    mk("h3",  "Toronto Maple Leafs", "Montreal Canadiens",   "NHL",            "UPCOMING", "1.55", "2.45", "5.80"),
    mk("h4",  "Vegas Golden Knights","Dallas Stars",         "NHL",            "UPCOMING", "1.90", "1.95", "5.40"),
    mk("h5",  "New York Rangers",    "Carolina Hurricanes",  "NHL",            "UPCOMING", "2.05", "1.80", "5.30"),
    mk("h6",  "Sweden",              "Finland",              "IIHF World Champ","LIVE",    "1.80", "2.05", "4.80"),
    mk("h7",  "Canada",              "Russia",               "IIHF World Champ","UPCOMING","1.40", "2.80", "5.00"),
    mk("h8",  "Czech Republic",      "USA",                  "IIHF World Champ","UPCOMING","2.10", "1.75", "4.90"),
    mk("h9",  "Djurgårdens IF",      "Frölunda HC",          "SHL Sweden",     "LIVE",     "2.00", "1.85", "5.10"),
    mk("h10", "HC Davos",            "ZSC Lions",            "NL Switzerland", "UPCOMING", "1.95", "1.90", "5.20"),
  ];
}

/**
 * GET /api/hockey/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveHockeyMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.startsWith("icehockey") && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockHockeyMatches());
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
          event: match.sport_title || "Ice Hockey Match",
          competition: match.sport_title || "Ice Hockey",
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockHockeyMatches());

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`Hockey API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockHockeyMatches());
  }
};
