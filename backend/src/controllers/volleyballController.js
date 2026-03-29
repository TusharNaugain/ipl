const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockVolleyballMatches() {
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
    mk("v1",  "Italy",               "Poland",              "Nations League",     "LIVE",     "1.90", "1.90"),
    mk("v2",  "Brazil",              "USA",                 "World Championship", "LIVE",     "1.75", "2.10"),
    mk("v3",  "France",              "Japan",               "Nations League",     "UPCOMING", "1.60", "2.30"),
    mk("v4",  "Serbia",              "Argentina",           "World Championship", "UPCOMING", "2.05", "1.75"),
    mk("v5",  "Slovenia",            "Netherlands",         "European Champ",     "UPCOMING", "1.85", "1.95"),
    mk("v6",  "Turkey",              "China",               "Women's VNL",        "LIVE",     "1.50", "2.50"),
    mk("v7",  "Trentino Volley",     "Lube Civitanova",     "Italian SuperLega",  "LIVE",     "1.80", "2.00"),
    mk("v8",  "Zaksa",               "Jastrzebski Wegiel",  "PlusLiga Poland",    "UPCOMING", "1.95", "1.85"),
    mk("v9",  "Zenit Kazan",         "Dinamo Moscow",       "Russian Super League","UPCOMING", "1.70", "2.15"),
    mk("v10", "Sada Cruzeiro",       "Minas Tenis Clube",   "Brazilian Superliga","UPCOMING", "1.45", "2.65"),
  ];
}

/**
 * GET /api/volleyball/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveVolleyballMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.startsWith("volleyball") && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockVolleyballMatches());
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
          event: match.sport_title || "Volleyball Match",
          competition: match.sport_title || "Volleyball",
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockVolleyballMatches());

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`Volleyball API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockVolleyballMatches());
  }
};
