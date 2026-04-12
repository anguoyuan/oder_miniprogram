const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const url = require('url');
require('dotenv').config();

const { testConnection } = require('./config/database');
const config = require('./config/config');
const routes = require('./routes');

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 创建Socket.IO实例（用于新架构）
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 创建原生WebSocket服务器（用于兼容旧前端）
const wss = new WebSocket.Server({ noServer: true });

// 存储WebSocket连接
const wsClients = new Set();

// 全局变量，用于在控制器中访问
app.locals.io = io;
app.locals.wss = wss;
app.locals.wsClients = wsClients;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 静态文件服务
app.use('/api/upload', express.static(uploadDir));

// API路由
app.use('/api', routes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务运行正常',
    data: {
      service: 'light-food-order-system',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('Socket.IO客户端连接:', socket.id);
  
  // 加入管理员房间（用于接收新订单通知）
  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log('管理员加入房间:', socket.id);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('Socket.IO客户端断开:', socket.id);
  });
});

// 原生WebSocket连接处理（用于兼容旧前端）
wss.on('connection', (ws, request) => {
  console.log('原生WebSocket客户端连接');
  wsClients.add(ws);
  
  // 发送连接成功消息
  ws.send(JSON.stringify({
    type: 'connected',
    message: '连接成功'
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('收到WebSocket消息:', data);
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('原生WebSocket客户端断开');
    wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
    wsClients.delete(ws);
  });
});

// 处理WebSocket升级
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  
  // 原生WebSocket路由：/api/ws/order
  if (pathname === '/api/ws/order') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// 启动服务器
const PORT = config.port;

async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 启动服务器
    server.listen(PORT, () => {
      console.log('============================================');
      console.log('  轻食订单系统后端 (Node.js版本)');
      console.log('============================================');
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`🔧 环境: ${config.env}`);
      console.log(`📡 WebSocket: 已启用`);
      console.log('============================================');
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 启动
startServer();

module.exports = { app, server, io };

