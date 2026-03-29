/**
 * 🎮 MISSIO CLIENT-SIDE GAME ENGINE
 * All game logic runs in the browser. No backend needed.
 * Coins + transactions stored in localStorage.
 */

// ─── Persistence Helpers ──────────────────────────────────────────────────────
const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");
const saveUser = (u) => localStorage.setItem("user", JSON.stringify(u));
const getTxns = () => JSON.parse(localStorage.getItem("txns") || "[]");

const addTxn = (type, amount, description) => {
  const txns = getTxns();
  txns.unshift({ _id: Date.now() + Math.random(), type, amount, description, createdAt: new Date().toISOString() });
  localStorage.setItem("txns", JSON.stringify(txns.slice(0, 200))); // keep last 200
};

/** Deduct coins, throw if insufficient. Returns new balance. */
const bet = (amount) => {
  const user = getUser();
  if (!user.coins || user.coins < amount) throw new Error("Not enough coins! 🪙");
  user.coins -= amount;
  saveUser(user);
  return user.coins;
};

/** Add coins back after winning. Returns new balance. */
const win = (amount, game) => {
  const user = getUser();
  user.coins = (user.coins || 0) + amount;
  saveUser(user);
  addTxn("WIN", amount, `${game} win!`);
  return user.coins;
};

const recordLoss = (amount, game) => {
  addTxn("LOSS", amount, `${game} — better luck next time`);
  return getUser().coins;
};

const recordBet = (amount, game) => {
  addTxn("BET", amount, `${game} bet placed`);
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const rnd = () => Math.random();

// ═════════════════════════════════════════════════════════════════════════════
// GAME 1: COLOR PREDICTION
// ═════════════════════════════════════════════════════════════════════════════
export function playColor(pick, amount) {
  amount = parseInt(amount);
  const roll = rnd();
  const result = roll < 0.05 ? "violet" : roll < 0.50 ? "green" : "red";
  const multiplier = pick === "violet" ? 4.5 : 1.9;
  const won = result === pick;
  bet(amount); recordBet(amount, "Color");
  const payout = won ? Math.floor(amount * multiplier) : 0;
  const coins = won ? win(payout, "Color") : recordLoss(amount, "Color");
  return { game: "color", won, pick, result, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 2: DICE ROLL
// ═════════════════════════════════════════════════════════════════════════════
export function playDice(pick, amount) {
  amount = parseInt(amount); pick = parseInt(pick);
  const result = Math.floor(rnd() * 6) + 1;
  const won = result === pick;
  bet(amount); recordBet(amount, "Dice");
  const payout = won ? Math.floor(amount * 5.5) : 0;
  const coins = won ? win(payout, "Dice") : recordLoss(amount, "Dice");
  return { game: "dice", won, pick, result, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 3: SPIN WHEEL
// ═════════════════════════════════════════════════════════════════════════════
const SPIN_SEGMENTS = [
  { label: "0x",  multiplier: 0,  probability: 0.30 },
  { label: "1x",  multiplier: 1,  probability: 0.20 },
  { label: "2x",  multiplier: 2,  probability: 0.25 },
  { label: "3x",  multiplier: 3,  probability: 0.15 },
  { label: "5x",  multiplier: 5,  probability: 0.08 },
  { label: "10x", multiplier: 10, probability: 0.02 },
];
export function playSpin(amount) {
  amount = parseInt(amount);
  let r = rnd(), cum = 0, segment = SPIN_SEGMENTS[0];
  for (const s of SPIN_SEGMENTS) { cum += s.probability; if (r <= cum) { segment = s; break; } }
  const payout = Math.floor(amount * segment.multiplier);
  const won = segment.multiplier > 1;
  bet(amount); recordBet(amount, "Spin");
  const coins = payout > 0 ? win(payout, "Spin") : recordLoss(amount, "Spin");
  return { game: "spin", won, segment: segment.label, multiplier: segment.multiplier, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 4: COIN FLIP
// ═════════════════════════════════════════════════════════════════════════════
export function playCoinFlip(pick, amount) {
  amount = parseInt(amount);
  const result = rnd() < 0.5 ? "heads" : "tails";
  const won = result === pick;
  bet(amount); recordBet(amount, "Coin Flip");
  const payout = won ? Math.floor(amount * 1.9) : 0;
  const coins = won ? win(payout, "Coin Flip") : recordLoss(amount, "Coin Flip");
  return { game: "coinFlip", won, pick, result, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 5: HI-LO
// ═════════════════════════════════════════════════════════════════════════════
const CARDS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
export function playHiLo(pick, amount) {
  amount = parseInt(amount);
  const base = Math.floor(rnd() * 13) + 1;
  const next = Math.floor(rnd() * 13) + 1;
  const won = (pick === "hi" && next > base) || (pick === "lo" && next < base);
  bet(amount); recordBet(amount, "Hi-Lo");
  const payout = won ? Math.floor(amount * 1.8) : 0;
  const coins = won ? win(payout, "Hi-Lo") : recordLoss(amount, "Hi-Lo");
  return { game: "hiLo", won, pick, base, next, baseCard: CARDS[base-1], nextCard: CARDS[next-1], payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 6: CRASH
// ═════════════════════════════════════════════════════════════════════════════
export function playCrash(cashOutAt, amount) {
  amount = parseInt(amount); cashOutAt = parseFloat(cashOutAt);
  const crashPoint = parseFloat(Math.max(1.0, 0.97 / (1 - rnd())).toFixed(2));
  const won = cashOutAt <= crashPoint;
  bet(amount); recordBet(amount, "Crash");
  const payout = won ? Math.floor(amount * cashOutAt) : 0;
  const coins = won ? win(payout, "Crash") : recordLoss(amount, "Crash");
  return { game: "crash", won, cashOutAt, crashPoint, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 7: MINES
// ═════════════════════════════════════════════════════════════════════════════
export function playMines(picks, mineCount, amount) {
  amount = parseInt(amount); picks = parseInt(picks); mineCount = parseInt(mineCount);
  const total = 25, safe = total - mineCount;
  let prob = 1;
  for (let i = 0; i < picks; i++) prob *= (safe - i) / (total - i);
  const won = rnd() < prob;
  const multiplier = parseFloat((0.97 / prob).toFixed(2));
  bet(amount); recordBet(amount, "Mines");
  const payout = won ? Math.floor(amount * multiplier) : 0;
  const coins = won ? win(payout, "Mines") : recordLoss(amount, "Mines");
  return { game: "mines", won, picks, mineCount, multiplier, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 8: PLINKO
// ═════════════════════════════════════════════════════════════════════════════
const PLINKO_SLOTS = [0.2, 0.5, 1, 1.5, 2, 3, 5, 10, 5, 3, 2, 1.5, 1, 0.5, 0.2];
export function playPlinko(amount) {
  amount = parseInt(amount);
  let pos = 7;
  for (let i = 0; i < 12; i++) pos += rnd() < 0.5 ? -1 : 1;
  const slot = Math.max(0, Math.min(14, pos));
  const multiplier = PLINKO_SLOTS[slot];
  const payout = Math.floor(amount * multiplier);
  const won = multiplier > 1;
  bet(amount); recordBet(amount, "Plinko");
  const coins = payout > 0 ? win(payout, "Plinko") : recordLoss(amount, "Plinko");
  return { game: "plinko", slot, multiplier, payout, won, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 9: ROULETTE
// ═════════════════════════════════════════════════════════════════════════════
const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
export function playRoulette(betType, betValue, amount) {
  amount = parseInt(amount);
  const result = Math.floor(rnd() * 37);
  const resultColor = result === 0 ? "green" : RED_NUMS.includes(result) ? "red" : "black";
  let won = false, multiplier = 0;
  switch (betType) {
    case "number":  won = parseInt(betValue) === result; multiplier = 35; break;
    case "color":   won = betValue === resultColor; multiplier = 1.9; break;
    case "oddeven": won = result > 0 && ((betValue === "odd" && result % 2 === 1) || (betValue === "even" && result % 2 === 0)); multiplier = 1.9; break;
    case "half":    won = result > 0 && ((betValue === "1-18" && result <= 18) || (betValue === "19-36" && result > 18)); multiplier = 1.9; break;
    case "dozen":   const d = parseInt(betValue); won = result > 0 && result > (d-1)*12 && result <= d*12; multiplier = 2.8; break;
  }
  bet(amount); recordBet(amount, "Roulette");
  const payout = won ? Math.floor(amount * multiplier) : 0;
  const coins = won ? win(payout, "Roulette") : recordLoss(amount, "Roulette");
  return { game: "roulette", won, result, resultColor, betType, betValue, multiplier: won ? multiplier : 0, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 10: NUMBER PREDICTION
// ═════════════════════════════════════════════════════════════════════════════
export function playNumber(rangeMin, rangeMax, amount) {
  amount = parseInt(amount);
  const min = Math.max(1, parseInt(rangeMin)), max = Math.min(100, parseInt(rangeMax));
  const coverage = (max - min + 1) / 100;
  const multiplier = parseFloat((0.97 / coverage).toFixed(2));
  const result = Math.floor(rnd() * 100) + 1;
  const won = result >= min && result <= max;
  bet(amount); recordBet(amount, "Number");
  const payout = won ? Math.floor(amount * multiplier) : 0;
  const coins = won ? win(payout, "Number") : recordLoss(amount, "Number");
  return { game: "number", won, rangeMin: min, rangeMax: max, result, multiplier, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 11: LIMBO
// ═════════════════════════════════════════════════════════════════════════════
export function playLimbo(target, amount) {
  amount = parseInt(amount); target = parseFloat(target);
  const result = parseFloat((0.97 / (1 - rnd())).toFixed(2));
  const won = result >= target;
  bet(amount); recordBet(amount, "Limbo");
  const payout = won ? Math.floor(amount * target) : 0;
  const coins = won ? win(payout, "Limbo") : recordLoss(amount, "Limbo");
  return { game: "limbo", won, target, result, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 12: DRAGON TOWER
// ═════════════════════════════════════════════════════════════════════════════
export function playTower(floors, difficulty, amount) {
  amount = parseInt(amount);
  const safeP = { easy: 0.75, medium: 0.5, hard: 0.33 }[difficulty] || 0.5;
  let survived = true;
  const floorResults = [];
  for (let i = 0; i < floors; i++) {
    const safe = rnd() < safeP;
    floorResults.push(safe);
    if (!safe) { survived = false; break; }
  }
  const multiplier = survived ? parseFloat((0.97 / Math.pow(safeP, floors)).toFixed(2)) : 0;
  bet(amount); recordBet(amount, "Tower");
  const payout = survived ? Math.floor(amount * multiplier) : 0;
  const coins = survived ? win(payout, "Tower") : recordLoss(amount, "Tower");
  return { game: "tower", won: survived, floors: floorResults, multiplier, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 13: ANDAR BAHAR
// ═════════════════════════════════════════════════════════════════════════════
export function playAndarBahar(pick, amount) {
  amount = parseInt(amount);
  const result = rnd() < 0.5 ? "andar" : "bahar";
  const won = result === pick;
  bet(amount); recordBet(amount, "Andar Bahar");
  const payout = won ? Math.floor(amount * 1.9) : 0;
  const coins = won ? win(payout, "Andar Bahar") : recordLoss(amount, "Andar Bahar");
  return { game: "andarBahar", won, pick, result, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// GAME 14: TEEN PATTI (Big/Small)
// ═════════════════════════════════════════════════════════════════════════════
export function playTeenPatti(pick, amount) {
  amount = parseInt(amount);
  // Three cards, sum 3-30 (3 cards 1-10)
  const cards = [Math.ceil(rnd()*10), Math.ceil(rnd()*10), Math.ceil(rnd()*10)];
  const sum = cards.reduce((a,b) => a+b, 0);
  const result = sum >= 16 ? "big" : "small";
  const won = result === pick;
  bet(amount); recordBet(amount, "Teen Patti");
  const payout = won ? Math.floor(amount * 1.9) : 0;
  const coins = won ? win(payout, "Teen Patti") : recordLoss(amount, "Teen Patti");
  return { game: "teenPatti", won, pick, result, cards, sum, payout, coins };
}

// ═════════════════════════════════════════════════════════════════════════════
// WALLET: Get transactions & balance
// ═════════════════════════════════════════════════════════════════════════════
export function getTransactions() { return getTxns(); }
export function getBalance() { return getUser().coins || 0; }
export function getWalletUser() { return getUser(); }
