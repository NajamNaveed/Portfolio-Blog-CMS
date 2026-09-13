const express = require('express');
const { submitMessage } = require('../controllers/messageController');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', contactLimiter, submitMessage);

module.exports = router;
