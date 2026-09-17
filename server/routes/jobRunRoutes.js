const express = require('express');
const { runNow } = require('../controllers/jobController');
const { verifyCronSecret } = require('../middleware/verifyCronSecret');
const { cronRunLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/run', cronRunLimiter, verifyCronSecret, runNow);

module.exports = router;
