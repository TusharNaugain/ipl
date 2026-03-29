const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockTennisMatches() {
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
    mk("t1",  "Novak Djokovic",    "Carlos Alcaraz",    "ATP Masters 1000",   "LIVE",     "1.55", "2.40"),
    mk("t2",  "Rafael Nadal",      "Daniil Medvedev",   "ATP Roland Garros",  "LIVE",     "2.10", "1.75"),
    mk("t3",  "Jannik Sinner",     "Stefanos Tsitsipas","ATP Barcelona Open",  "UPCOMING", "1.45", "2.65"),
    mk("t4",  "Iga Swiatek",       "Aryna Sabalenka",   "WTA Finals",         "LIVE",     "1.60", "2.30"),
    mk("t5",  "Coco Gauff",        "Elena Rybakina",    "WTA Miami Open",     "UPCOMING", "1.90", "1.95"),
    mk("t6",  "Andrey Rublev",     "Alexander Zverev",  "ATP Monte-Carlo",    "UPCOMING", "2.20", "1.70"),
    mk("t7",  "Taylor Fritz",      "Tommy Paul",        "ATP Eastbourne",     "UPCOMING", "1.80", "2.05"),
    mk("t8",  "Jessica Pegula",    "Caroline Garcia",   "WTA Dubai",          "LIVE",     "1.70", "2.15"),
    mk("t9",  "Holger Rune",       "Hubert Hurkacz",    "ATP Hamburg Open",   "UPCOMING", "2.00", "1.85"),
    mk("t10", "Madison Keys",      "Victoria Azarenka", "WTA Stuttgart",      "UPCOMING", "1.95", "1.90"),
  ];
}

/**
 * GET /api/tennis/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveTennisMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.startsWith("tennis") && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockTennisMatches());
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
          event: match.sport_title || "Tennis Match",
          competition: match.sport_title || "Tennis",
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockTennisMatches());

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`Tennis API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockTennisMatches());
  }
};
