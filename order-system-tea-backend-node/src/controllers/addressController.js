const AddressModel = require('../models/addressModel');
const { calculateDistance } = require('../utils/distance');
const config = require('../config/config');
const { success, error } = require('../utils/response');

class AddressController {
  /**
   * 获取地址列表
   */
  static async getList(req, res) {
    try {
      const userId = req.userId;
      const list = await AddressModel.getUserAddressList(userId);
      res.json(success(list));
    } catch (err) {
      console.error('获取地址列表失败:', err);
      res.json(error(err.message || '获取地址列表失败'));
    }
  }
  
  /**
   * 添加地址
   */
  static async add(req, res) {
    try {
      const userId = req.userId;
      const address = req.body;
      
      // 验证配送范围
      if (address.latitude && address.longitude) {
        const distance = calculateDistance(
          config.shop.latitude,
          config.shop.longitude,
          address.latitude,
          address.longitude
        );
        
        if (distance > config.shop.deliveryRange) {
          return res.json(error(
            `该地址超出配送范围（${config.shop.deliveryRange}公里），当前距离${distance.toFixed(2)}公里`
          ));
        }
      }
      
      await AddressModel.create(address, userId);
      res.json(success(null, '添加成功'));
    } catch (err) {
      console.error('添加地址失败:', err);
      res.json(error(err.message || '添加地址失败'));
    }
  }
  
  /**
   * 更新地址
   */
  static async update(req, res) {
    try {
      const userId = req.userId;
      const address = req.body;
      
      // 验证配送范围
      if (address.latitude && address.longitude) {
        const distance = calculateDistance(
          config.shop.latitude,
          config.shop.longitude,
          address.latitude,
          address.longitude
        );
        
        if (distance > config.shop.deliveryRange) {
          return res.json(error(
            `该地址超出配送范围（${config.shop.deliveryRange}公里），当前距离${distance.toFixed(2)}公里`
          ));
        }
      }
      
      await AddressModel.update(address, userId);
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新地址失败:', err);
      res.json(error(err.message || '更新地址失败'));
    }
  }
  
  /**
   * 删除地址
   */
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      await AddressModel.delete(id, userId);
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('删除地址失败:', err);
      res.json(error(err.message || '删除地址失败'));
    }
  }
  
  /**
   * 设置默认地址
   */
  static async setDefault(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      await AddressModel.setDefault(id, userId);
      res.json(success(null, '设置成功'));
    } catch (err) {
      console.error('设置默认地址失败:', err);
      res.json(error(err.message || '设置默认地址失败'));
    }
  }
  
  /**
   * 验证地址是否在配送范围内
   */
  static async checkDeliveryRange(req, res) {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        return res.json(error('经纬度不能为空'));
      }
      
      const distance = calculateDistance(
        config.shop.latitude,
        config.shop.longitude,
        latitude,
        longitude
      );
      
      const inRange = distance <= config.shop.deliveryRange;
      
      res.json(success({
        inRange,
        distance: distance.toFixed(2),
        distanceText: distance < 1 
          ? `${(distance * 1000).toFixed(0)}米` 
          : `${distance.toFixed(2)}公里`,
        maxDistance: config.shop.deliveryRange
      }));
    } catch (err) {
      console.error('验证配送范围失败:', err);
      res.json(error(err.message || '验证配送范围失败'));
    }
  }
}

module.exports = AddressController;

