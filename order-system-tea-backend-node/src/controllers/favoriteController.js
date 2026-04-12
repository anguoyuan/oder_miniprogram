const FavoriteModel = require('../models/favoriteModel');
const { success, error } = require('../utils/response');

class FavoriteController {
  /**
   * 添加收藏
   */
  static async add(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.body;
      
      if (!productId) {
        return res.json(error('商品ID不能为空'));
      }
      
      await FavoriteModel.add(userId, productId);
      res.json(success(null, '收藏成功'));
    } catch (err) {
      console.error('添加收藏失败:', err);
      res.json(error(err.message || '添加收藏失败'));
    }
  }
  
  /**
   * 取消收藏
   */
  static async remove(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.query;
      
      if (!productId) {
        return res.json(error('商品ID不能为空'));
      }
      
      await FavoriteModel.remove(userId, productId);
      res.json(success(null, '取消收藏成功'));
    } catch (err) {
      console.error('取消收藏失败:', err);
      res.json(error(err.message || '取消收藏失败'));
    }
  }
  
  /**
   * 检查是否已收藏
   */
  static async check(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.params;
      
      const isFavorite = await FavoriteModel.isFavorite(userId, productId);
      res.json(success(isFavorite));
    } catch (err) {
      console.error('检查收藏状态失败:', err);
      res.json(error(err.message || '检查收藏状态失败'));
    }
  }
  
  /**
   * 获取用户收藏列表
   */
  static async getList(req, res) {
    try {
      const userId = req.userId;
      
      const favorites = await FavoriteModel.getUserFavoritesWithProduct(userId);
      res.json(success(favorites));
    } catch (err) {
      console.error('获取收藏列表失败:', err);
      res.json(error(err.message || '获取收藏列表失败'));
    }
  }
}

module.exports = FavoriteController;

