const express = require('express');
const { getAdminSiteContent, updateSiteContent } = require('../controllers/siteContentController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', getAdminSiteContent);
router.put('/', updateSiteContent);

module.exports = router;
