const express = require('express');
const {
  getAdminPosts,
  getAdminPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} = require('../controllers/postController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Applied once, at the router level — every route below is
// unreachable without a valid JWT and an admin role.
router.use(protect, requireAdmin);

router.get('/', getAdminPosts);
router.get('/:id', getAdminPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/publish', publishPost);
router.patch('/:id/unpublish', unpublishPost);

module.exports = router;