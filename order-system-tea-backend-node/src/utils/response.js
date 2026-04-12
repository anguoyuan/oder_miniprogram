/**
 * 统一响应格式
 */
const { convertKeysToCamel } = require('./converter');

/**
 * 成功响应
 */
const success = (data = null, message = '操作成功') => {
  return {
    code: 200,
    message,
    data: convertKeysToCamel(data)
  };
};

/**
 * 失败响应
 */
const error = (message = '操作失败', code = 500) => {
  return {
    code,
    message,
    data: null
  };
};

/**
 * 分页响应
 */
const page = (records, total, message = '查询成功') => {
  return {
    code: 200,
    message,
    data: {
      records: convertKeysToCamel(records),
      total
    }
  };
};

module.exports = { success, error, page };

