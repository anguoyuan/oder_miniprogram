const ProductLikeModel = require('../models/productLikeModel');
const { success, error } = require('../utils/response');

class ProductLikeController {
  /**
   * 点赞商品
   */
  static async add(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.body;
      
      if (!productId) {
        return res.json(error('商品ID不能为空'));
      }
      
      await ProductLikeModel.like(userId, productId);
      res.json(success(null, '点赞成功'));
    } catch (err) {
      console.error('点赞商品失败:', err);
      res.json(error(err.message || '点赞商品失败'));
    }
  }
  
  /**
   * 取消点赞
   */
  static async remove(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.query;
      
      if (!productId) {
        return res.json(error('商品ID不能为空'));
      }
      
      await ProductLikeModel.unlike(userId, productId);
      res.json(success(null, '取消点赞成功'));
    } catch (err) {
      console.error('取消点赞失败:', err);
      res.json(error(err.message || '取消点赞失败'));
    }
  }
  
  /**
   * 检查是否已点赞
   */
  static async check(req, res) {
    try {
      const userId = req.userId;
      const { productId } = req.params;
      
      const isLiked = await ProductLikeModel.isLiked(userId, productId);
      res.json(success(isLiked));
    } catch (err) {
      console.error('检查点赞状态失败:', err);
      res.json(error(err.message || '检查点赞状态失败'));
    }
  }
  
  /**
   * 获取用户点赞列表
   */
  static async getList(req, res) {
    try {
      const userId = req.userId;
      
      const likes = await ProductLikeModel.getUserLikesWithProduct(userId);
      res.json(success(likes));
    } catch (err) {
      console.error('获取点赞列表失败:', err);
      res.json(error(err.message || '获取点赞列表失败'));
    }
  }
}

module.exports = ProductLikeController;

