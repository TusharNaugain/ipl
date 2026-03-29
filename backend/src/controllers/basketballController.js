const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockBasketballMatches() {
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
    mk("b1",  "Los Angeles Lakers",   "Golden State Warriors", "NBA",        "LIVE",     "1.80", "2.05"),
    mk("b2",  "Boston Celtics",        "Miami Heat",            "NBA",        "LIVE",     "1.55", "2.45"),
    mk("b3",  "Milwaukee Bucks",       "Philadelphia 76ers",    "NBA",        "UPCOMING", "1.70", "2.20"),
    mk("b4",  "Phoenix Suns",          "Denver Nuggets",        "NBA",        "UPCOMING", "1.90", "1.95"),
    mk("b5",  "Dallas Mavericks",      "Memphis Grizzlies",     "NBA",        "UPCOMING", "1.65", "2.30"),
    mk("b6",  "Brooklyn Nets",         "Chicago Bulls",         "NBA",        "LIVE",     "2.10", "1.75"),
    mk("b7",  "Real Madrid",           "FC Barcelona",          "EuroLeague", "LIVE",     "1.85", "2.00"),
    mk("b8",  "Fenerbahçe",            "Olympiacos",            "EuroLeague", "UPCOMING", "1.75", "2.10"),
    mk("b9",  "CSKA Moscow",           "Anadolu Efes",          "EuroLeague", "UPCOMING", "2.00", "1.85"),
    mk("b10", "Duke Blue Devils",      "Kansas Jayhawks",       "NCAA",       "UPCOMING", "1.60", "2.40"),
  ];
}

/**
 * GET /api/basketball/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveBasketballMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.startsWith("basketball") && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockBasketballMatches());
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
          event: match.sport_title || "Basketball Match",
          competition: match.sport_title || "Basketball",
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockBasketballMatches());

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`Basketball API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockBasketballMatches());
  }
};
