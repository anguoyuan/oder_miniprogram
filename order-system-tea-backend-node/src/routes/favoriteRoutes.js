const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

router.post('/add', auth, FavoriteController.add);
router.delete('/remove', auth, FavoriteController.remove);
router.get('/check/:productId', auth, FavoriteController.check);
router.get('/list', auth, FavoriteController.getList);

module.exports = router;

