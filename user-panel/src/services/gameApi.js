/**
 * gameApi.js — Shared wallet API service for all casino games
 * Calls POST /api/games/play to settle bets against real backend balance
 */
const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

/**
 * Settle a game round against the backend.
 * @param {string} gameId  - game identifier e.g. "teenPatti", "andarBahar"
 * @param {number} stake   - coins wagered
 * @param {boolean} won    - did the player win?
 * @param {number} winAmount - gross payout (including stake) if won, 0 if lost
 * @returns {{ success, balance, profit, won, error? }}
 */
export async function settleGame(gameId, stake, won, winAmount) {
  try {
    const res = await fetch(`${BASE}/games/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ gameId, stake, won, winAmount }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Server error" };

    // Update localStorage user cache
    const user = getStoredUser();
    user.coins = data.balance;
    localStorage.setItem("user", JSON.stringify(user));

    return { ...data, success: true };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
}

export async function fetchBalance() {
  try {
    const res = await fetch(`${BASE}/games/balance`, {
      headers: { "Authorization": `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (data.balance !== undefined) {
      const user = getStoredUser();
      user.coins = data.balance;
      localStorage.setItem("user", JSON.stringify(user));
    }
    return data.balance ?? 0;
  } catch { return 0; }
}
