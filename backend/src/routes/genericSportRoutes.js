const express = require('express');
const router = express.Router();
const genericSportController = require('../controllers/genericSportController');

router.get('/:sportKey/live', genericSportController.getLiveMatches);

module.exports = router;
