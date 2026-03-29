const express = require('express');
const router = express.Router();
const tennisController = require('../controllers/tennisController');

router.get('/live', tennisController.getLiveTennisMatches);

module.exports = router;
