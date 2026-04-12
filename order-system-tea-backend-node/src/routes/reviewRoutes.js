const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { auth, adminAuth } = require('../middleware/auth');

// 用户端接口
router.post('/submit', auth, ReviewController.submit);
router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/user', auth, ReviewController.getUserReviews);
router.get('/order/:orderId/hasReviewed', ReviewController.hasReviewed);
router.get('/order/:orderId', ReviewController.getOrderReview);

// 管理端接口
router.get('/all', adminAuth, ReviewController.getAllReviews);
router.put('/reply', adminAuth, ReviewController.reply);
router.put('/status', adminAuth, ReviewController.updateStatus);

module.exports = router;

