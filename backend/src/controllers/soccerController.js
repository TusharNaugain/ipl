const axios = require("axios");

// ── Offline Mock Fallback — prevents crash when Sportradar API is down/expired ──
function generateMockSoccerMatches() {
  const base = Date.now();
  const mk = (id, t1, t2, comp, status, desc, b1, l1, b2, l2, bx) => ({
    id, t1, t2, competition: comp, status,
    time: new Date(base).toISOString(),
    matchDesc: desc,
    b1, l1, b2, l2, bx,
  });

  return [
    mk("s1",  "Manchester City",    "Arsenal",           "Premier League",    "LIVE",     "🔴 LIVE – 67' | MCI 1-1 ARS", "1.65", "1.70", "4.80", "5.00", "3.90"),
    mk("s2",  "Real Madrid",        "FC Barcelona",      "La Liga",           "LIVE",     "🔴 LIVE – 45' | RMA 0-0 BAR", "2.20", "2.30", "3.40", "3.60", "3.10"),
    mk("s3",  "Bayern Munich",      "Borussia Dortmund", "Bundesliga",        "LIVE",     "🔴 LIVE – 32' | BAY 2-0 BVB", "1.50", "1.55", "5.50", "5.80", "4.20"),
    mk("s4",  "PSG",                "Marseille",         "Ligue 1",           "UPCOMING", "Match starting soon",           "1.45", "1.50", "6.00", "6.30", "4.50"),
    mk("s5",  "Inter Milan",        "AC Milan",          "Serie A",           "UPCOMING", "Match starting soon",           "1.90", "1.95", "4.00", "4.20", "3.50"),
    mk("s6",  "Liverpool",          "Chelsea",           "Premier League",    "UPCOMING", "Match starting soon",           "1.80", "1.85", "4.20", "4.40", "3.60"),
    mk("s7",  "Atletico Madrid",    "Valencia",          "La Liga",           "UPCOMING", "Match starting soon",           "1.55", "1.60", "5.20", "5.50", "4.00"),
    mk("s8",  "Juventus",           "Napoli",            "Serie A",           "UPCOMING", "Match starting soon",           "2.00", "2.10", "3.80", "4.00", "3.30"),
    mk("s9",  "Ajax",               "PSV Eindhoven",     "Eredivisie",        "LIVE",     "🔴 LIVE – 78' | AJX 2-1 PSV", "1.75", "1.80", "4.50", "4.70", "3.70"),
    mk("s10", "Celtic",             "Rangers",           "Scottish Prem.",    "UPCOMING", "Match starting soon",           "2.10", "2.20", "3.60", "3.80", "3.20"),
    mk("s11", "Benfica",            "Porto",             "Primeira Liga",     "UPCOMING", "Match starting soon",           "2.00", "2.10", "3.75", "3.90", "3.40"),
    mk("s12", "Boca Juniors",       "River Plate",       "Copa Libertadores", "LIVE",     "🔴 LIVE – 55' | BOC 1-1 RIV", "2.30", "2.40", "3.20", "3.40", "3.00"),
  ];
}

/**
 * GET /api/soccer/live
 * Attempts to fetch from Sportradar Trial API.
 * Falls back to rich offline data on any failure (expired key, quota, network).
 */
exports.getLiveScores = async (req, res) => {
  const apiKey = process.env.SPORTRADAR_SOCCER_KEY || "S4oQT1tJWqGUEQvDodKvrNqkrYwOj8hhPtcY13xe";

  try {
    // axios handles gzip decompression + JSON parsing automatically
    const response = await axios.get(
      `https://api.sportradar.com/soccer/trial/v4/en/schedules/live/schedules.json?api_key=${apiKey}`,
      { timeout: 8000 }
    );

    const raw = response.data;

    // Map Sportradar schema → our UI schema
    const schedules = raw?.schedules || [];
    if (!schedules.length) {
      return res.status(200).json({ success: true, data: generateMockSoccerMatches(), cached: "offline_demo_mode" });
    }

    const mapped = schedules.map((s) => {
      const sport_event = s.sport_event || {};
      const competitors = sport_event.competitors || [];
      const t1 = competitors.find((c) => c.qualifier === "home")?.name || "Home Team";
      const t2 = competitors.find((c) => c.qualifier === "away")?.name || "Away Team";
      const status = s.sport_event_status?.status === "live" ? "LIVE" : "UPCOMING";

      return {
        id: sport_event.id || Math.random().toString(36).slice(2),
        t1, t2,
        competition: sport_event?.tournament?.name || "Football",
        time: sport_event.scheduled || new Date().toISOString(),
        status,
        matchDesc: status === "LIVE" ? `🔴 LIVE – ${s.sport_event_status?.match_time || ""}' | ${t1} ${s.sport_event_status?.home_score || 0}-${s.sport_event_status?.away_score || 0} ${t2}` : "Match starting soon",
        b1: "1.85", l1: "1.90", b2: "2.10", l2: "2.15", bx: "3.20",
      };
    });

    return res.status(200).json({ success: true, data: mapped });

  } catch (err) {
    // Any API failure (401, 403, 404, 429, timeout, network down) → serve mock
    const status = err?.response?.status;
    if (status) {
      console.warn(`Soccer API returned HTTP ${status} — serving offline mock data`);
    } else {
      console.warn("Soccer API unreachable — serving offline mock data:", err.message);
    }

    return res.status(200).json({
      success: true,
      data: generateMockSoccerMatches(),
      cached: "offline_demo_mode",
    });
  }
};
