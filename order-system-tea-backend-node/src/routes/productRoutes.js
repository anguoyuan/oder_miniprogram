const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { adminAuth } = require('../middleware/auth');

// 用户端接口
router.get('/list/:categoryId', ProductController.getProductsByCategory);
router.get('/detail/:id', ProductController.getProductDetail);
router.get('/search', ProductController.searchProducts);
router.get('/hot', ProductController.getHotProducts);

// 管理端接口
router.get('/page', adminAuth, ProductController.getProductPage);
router.post('/add', adminAuth, ProductController.addProduct);
router.put('/update', adminAuth, ProductController.updateProduct);
router.delete('/delete/:id', adminAuth, ProductController.deleteProduct);

module.exports = router;

