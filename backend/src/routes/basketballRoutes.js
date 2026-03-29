const express = require('express');
const router = express.Router();
const basketballController = require('../controllers/basketballController');

router.get('/live', basketballController.getLiveBasketballMatches);

module.exports = router;
