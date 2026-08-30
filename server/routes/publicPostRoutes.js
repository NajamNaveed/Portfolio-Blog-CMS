const express = require('express');
const { getPublicPosts, getPublicPostBySlug } = require('../controllers/postController');

const router = express.Router();

router.get('/', getPublicPosts);
router.get('/:slug', getPublicPostBySlug);

module.exports = router;