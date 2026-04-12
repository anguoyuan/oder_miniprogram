const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.get('/list', auth, CartController.getCart);
router.post('/add', auth, CartController.add);
router.put('/update', auth, CartController.updateQuantity);
router.delete('/delete/:cartId', auth, CartController.delete);
router.delete('/clear', auth, CartController.clear);
router.post('/delete-batch', auth, CartController.deleteBatch);

module.exports = router;

