const express = require('express');
const { askAboutWork } = require('../controllers/askController');
const { askLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', askLimiter, askAboutWork);

module.exports = router;
