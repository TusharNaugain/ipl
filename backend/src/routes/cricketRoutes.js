const express = require("express");
const router = express.Router();
const { getLiveScores } = require("../controllers/cricketController");

router.get("/live", getLiveScores);

module.exports = router;
