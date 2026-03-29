const axios = require("axios");

// ── Offline Mock Fallback ────────────────────────────────────────────────────────
function generateMockGenericMatches(sportKey) {
  const base = Date.now();
  const title = sportKey.charAt(0).toUpperCase() + sportKey.slice(1);
  const mk = (id, t1, t2, comp, status, b1, b2, bx) => ({
    id, t1, t2,
    competition: comp,
    event: comp,
    status,
    time: new Date(base).toISOString(),
    b1, b2, bx,
  });

  return [
    mk("g1",  `Team A (${title})`,   `Team B (${title})`,   `${title} Pro League`,  "LIVE",     "1.85", "1.95", "-"),
    mk("g2",  `Team C (${title})`,   `Team D (${title})`,   `${title} World Cup`,   "LIVE",     "2.10", "1.75", "-"),
    mk("g3",  `Team E (${title})`,   `Team F (${title})`,   `${title} Masters`,     "UPCOMING", "1.60", "2.30", "-"),
    mk("g4",  `Team G (${title})`,   `Team H (${title})`,   `${title} Open`,        "UPCOMING", "1.90", "1.90", "-"),
    mk("g5",  `Team I (${title})`,   `Team J (${title})`,   `${title} Challengers`, "UPCOMING", "1.45", "2.65", "-"),
  ];
}

/**
 * GET /api/sports/:sportKey/live
 * Attempts The Odds API; falls back to offline mock on any failure.
 */
exports.getLiveMatches = async (req, res) => {
  const apiKey = process.env.THE_ODDS_API_KEY || "e35ee6deb6b54291ddbe2c6e8ddf4085";
  const { sportKey: filterKey } = req.params;

  try {
    const sportsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`,
      { timeout: 8000 }
    );

    const activeTournaments = sportsRes.data
      .filter((s) => s.key.toLowerCase().includes(filterKey.toLowerCase()) && s.active)
      .map((s) => s.key)
      .slice(0, 3);

    if (!activeTournaments.length) {
      return res.json(generateMockGenericMatches(filterKey));
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
          event: match.sport_title || `${filterKey} Match`,
          competition: match.sport_title || filterKey,
          time: new Date(match.commence_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                " - " + new Date(match.commence_time).toLocaleDateString(),
          status: new Date() >= new Date(match.commence_time) ? "LIVE" : "UPCOMING",
          b1, b2, bx: "-",
        });
      });
    });

    return res.json(allMatches.length ? allMatches : generateMockGenericMatches(filterKey));

  } catch (err) {
    const status = err?.response?.status;
    console.warn(`${filterKey} API ${status ? `HTTP ${status}` : "unreachable"} — serving offline mock`);
    return res.json(generateMockGenericMatches(filterKey));
  }
};
