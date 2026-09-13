const express = require('express');
const { getPublicSiteContent } = require('../controllers/siteContentController');

const router = express.Router();

router.get('/', getPublicSiteContent);

module.exports = router;
