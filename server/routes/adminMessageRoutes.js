const express = require('express');
const {
  getAdminMessages,
  getAdminMessageById,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/messageController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', getAdminMessages);
router.get('/:id', getAdminMessageById);
router.patch('/:id/status', updateMessageStatus);
router.delete('/:id', deleteMessage);

module.exports = router;
