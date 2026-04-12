const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// 确保上传目录存在
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = moment().format('YYYY/MM/DD');
    const uploadPath = path.join(config.upload.dir, date);
    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuidv4().replace(/-/g, '') + ext;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'));
  }
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;

