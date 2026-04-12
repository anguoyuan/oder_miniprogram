/**
 * 数据格式转换工具
 * 将数据库的 snake_case 字段转换为前端的 camelCase 格式
 */

/**
 * 将snake_case转换为camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * 转换对象的键名从snake_case到camelCase
 */
const convertKeysToCamel = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamel(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        newObj[camelKey] = convertKeysToCamel(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
};

/**
 * 转换单个记录
 */
const convertRecord = (record) => {
  return convertKeysToCamel(record);
};

/**
 * 转换记录列表
 */
const convertRecords = (records) => {
  if (!Array.isArray(records)) {
    return records;
  }
  return records.map(record => convertKeysToCamel(record));
};

/**
 * 转换分页结果
 */
const convertPageResult = (result) => {
  return {
    records: convertRecords(result.records),
    total: result.total
  };
};

module.exports = {
  snakeToCamel,
  convertKeysToCamel,
  convertRecord,
  convertRecords,
  convertPageResult
};

