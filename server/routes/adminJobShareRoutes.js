const express = require('express');
const { createShareLink, listShareLinks, deleteShareLink } = require('../controllers/jobShareController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.post('/', createShareLink);
router.get('/', listShareLinks);
router.delete('/:id', deleteShareLink);

module.exports = router;
