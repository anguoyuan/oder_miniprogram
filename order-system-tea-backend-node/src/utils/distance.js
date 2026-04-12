/**
 * 计算两个经纬度之间的距离（单位：公里）
 * 使用Haversine公式
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * 将角度转换为弧度
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * 检查地址是否在配送范围内
 */
const isInDeliveryRange = (latitude, longitude, config) => {
  const distance = calculateDistance(
    config.shop.latitude,
    config.shop.longitude,
    latitude,
    longitude
  );
  
  return distance <= config.shop.deliveryRange;
};

module.exports = { calculateDistance, isInDeliveryRange };

