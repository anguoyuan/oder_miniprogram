const BannerModel = require('../models/bannerModel');
const { success, error } = require('../utils/response');

class BannerController {
  /**
   * 获取轮播图列表（前端，只显示启用的）
   */
  static async getList(req, res) {
    try {
      const banners = await BannerModel.getAll();
      res.json(success(banners));
    } catch (err) {
      console.error('获取轮播图列表失败:', err);
      res.json(error(err.message || '获取轮播图列表失败'));
    }
  }
  
  /**
   * 获取所有轮播图（管理端，包括禁用的）
   */
  static async getAdminList(req, res) {
    try {
      const banners = await BannerModel.getList();
      res.json(success(banners));
    } catch (err) {
      console.error('获取轮播图列表失败:', err);
      res.json(error(err.message || '获取轮播图列表失败'));
    }
  }
  
  /**
   * 添加轮播图（管理端）
   */
  static async add(req, res) {
    try {
      const banner = req.body;
      await BannerModel.create(banner);
      res.json(success(null, '添加成功'));
    } catch (err) {
      console.error('添加轮播图失败:', err);
      res.json(error(err.message || '添加轮播图失败'));
    }
  }
  
  /**
   * 更新轮播图（管理端）
   */
  static async update(req, res) {
    try {
      const { id, ...banner } = req.body;
      await BannerModel.update(id, banner);
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新轮播图失败:', err);
      res.json(error(err.message || '更新轮播图失败'));
    }
  }
  
  /**
   * 删除轮播图（管理端）
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await BannerModel.delete(id);
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('删除轮播图失败:', err);
      res.json(error(err.message || '删除轮播图失败'));
    }
  }
  
  /**
   * 切换轮播图状态（管理端）
   */
  static async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const banner = await BannerModel.findById(id);
      
      if (!banner) {
        return res.json(error('轮播图不存在'));
      }
      
      const newStatus = banner.status === 1 ? 0 : 1;
      await BannerModel.update(id, { status: newStatus });
      
      res.json(success(null, '操作成功'));
    } catch (err) {
      console.error('切换轮播图状态失败:', err);
      res.json(error(err.message || '切换轮播图状态失败'));
    }
  }
}

module.exports = BannerController;

