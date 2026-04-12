const express = require('express');
const router = express.Router();
const ProductLikeController = require('../controllers/productLikeController');
const { auth } = require('../middleware/auth');

router.post('/add', auth, ProductLikeController.add);
router.delete('/remove', auth, ProductLikeController.remove);
router.get('/check/:productId', auth, ProductLikeController.check);
router.get('/list', auth, ProductLikeController.getList);

module.exports = router;

