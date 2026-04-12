const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { adminAuth } = require('../middleware/auth');

// 用户端接口
router.get('/all', CategoryController.getAll);
router.get('/list', CategoryController.getAll); // 小程序兼容接口
router.get('/:id', CategoryController.getById);

// 管理端接口
router.get('/admin/list', adminAuth, CategoryController.getList);
router.post('/add', adminAuth, CategoryController.add);
router.put('/update', adminAuth, CategoryController.update);
router.delete('/delete/:id', adminAuth, CategoryController.delete);

module.exports = router;

