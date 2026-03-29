const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const { playGame, getBalance } = require("../controllers/gameController");

router.post("/play",    auth, playGame);
router.get("/balance",  auth, getBalance);

module.exports = router;
