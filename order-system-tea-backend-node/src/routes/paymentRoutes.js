const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

// User endpoints
router.post('/create', auth, PaymentController.createPayment);
router.get('/status/:paymentId', auth, PaymentController.getPaymentStatus);

// Admin endpoints
router.put('/confirm/:paymentId', adminAuth, PaymentController.confirmPayment);
router.get('/pending', adminAuth, PaymentController.getPendingPayments);

module.exports = router;
