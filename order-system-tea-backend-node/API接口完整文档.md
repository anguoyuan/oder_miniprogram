# API接口完整文档

## 基础信息

- **Base URL**: `http://localhost:8080/api`
- **前端代理**: 前端运行在3000端口，通过Vite代理转发到8080
- **WebSocket**: `ws://localhost:8080/api/ws/order`

## 认证说明

### 用户认证
```
Authorization: Bearer <user_token>
```

### 管理员认证
```
Authorization: Bearer <admin_token>
```

---

## 1. 用户管理 `/user`

### 微信登录
```
POST /api/user/wx-login
Body: { code, nickname, avatar }
Response: { token, user }
```

### 获取用户信息
```
GET /api/user/info
Auth: 用户
Response: User对象
```

### 更新用户信息
```
PUT /api/user/update
Auth: 用户
Body: { nickname, avatar, phone }
```

### 获取用户列表（管理端）
```
GET /api/user/list?keyword=&page=1&pageSize=10
Auth: 管理员
Response: { records: [], total: 0 }
```

### 更新用户状态（管理端）
```
PUT /api/user/update-status
Auth: 管理员
Body: { id, status }
```

### 获取用户统计（管理端）
```
GET /api/user/stats/:userId
Auth: 管理员
Response: { totalOrders, totalAmount, favoriteCount, likeCount }
```

---

## 2. 商品管理 `/product`

### 根据分类获取商品
```
GET /api/product/list/:categoryId
Response: Product[]
```

### 获取商品详情
```
GET /api/product/detail/:id
Response: Product对象
```

### 搜索商品
```
GET /api/product/search?keyword=&page=1&pageSize=10
Response: { records: [], total: 0 }
```

### 获取热门商品
```
GET /api/product/hot?limit=10
Response: Product[]
```

### 获取商品分页（管理端）
```
GET /api/product/page?page=1&pageSize=10
Auth: 管理员
Response: { records: [], total: 0 }
```

### 添加商品（管理端）
```
POST /api/product/add
Auth: 管理员
Body: Product对象
```

### 更新商品（管理端）
```
PUT /api/product/update
Auth: 管理员
Body: Product对象
```

### 删除商品（管理端）
```
DELETE /api/product/delete/:id
Auth: 管理员
```

---

## 3. 订单管理 `/order`

### 创建订单
```
POST /api/order/create
Auth: 用户
Body: { items, orderType, remark, address, phone, totalPrice }
Response: Order对象
```

### 获取订单详情
```
GET /api/order/detail/:orderId
Auth: 用户
Response: Order对象（含items）
```

### 获取用户订单列表
```
GET /api/order/user-orders?status=&page=1&pageSize=10
Auth: 用户
Response: { records: [], total: 0 }
```

### 取消订单
```
PUT /api/order/cancel/:orderId
Auth: 用户
```

### 获取所有订单（管理端）
```
GET /api/order/all?status=&page=1&pageSize=10
Auth: 管理员
Response: { records: [], total: 0 }
```

### 更新订单状态（管理端）
```
PUT /api/order/update-status
Auth: 管理员
Body: { orderId, status }
```

### 获取订单统计（管理端）
```
GET /api/order/stats
Auth: 管理员
Response: {
  today: { orderCount, totalAmount },
  total: { orderCount, totalAmount },
  status: { pending, preparing, ready, todayCompleted, todayRevenue }
}
```

---

## 4. 分类管理 `/category`

### 获取所有分类
```
GET /api/category/all
Response: Category[]
```

### 获取分类详情
```
GET /api/category/:id
Response: Category对象
```

### 获取分类列表（管理端）
```
GET /api/category/list
Auth: 管理员
Response: Category[]
```

### 添加分类（管理端）
```
POST /api/category/add
Auth: 管理员
Body: Category对象
```

### 更新分类（管理端）
```
PUT /api/category/update
Auth: 管理员
Body: Category对象
```

### 删除分类（管理端）
```
DELETE /api/category/delete/:id
Auth: 管理员
```

---

## 5. 购物车管理 `/cart`

### 获取购物车
```
GET /api/cart/list
Auth: 用户
Response: Cart[]
```

### 添加到购物车
```
POST /api/cart/add
Auth: 用户
Body: { productId, quantity, specs }
```

### 更新购物车数量
```
PUT /api/cart/update
Auth: 用户
Body: { cartId, quantity }
```

### 删除购物车项
```
DELETE /api/cart/delete/:cartId
Auth: 用户
```

### 清空购物车
```
DELETE /api/cart/clear
Auth: 用户
```

### 批量删除
```
POST /api/cart/delete-batch
Auth: 用户
Body: { cartIds: [] }
```

---

## 6. 轮播图管理 `/banner`

### 获取轮播图列表（前端）
```
GET /api/banner/list
Response: Banner[]
```

### 获取所有轮播图（管理端）
```
GET /api/banner/admin/list
Auth: 管理员
Response: Banner[]
```

### 添加轮播图（管理端）
```
POST /api/banner/admin/add
Auth: 管理员
Body: Banner对象
```

### 更新轮播图（管理端）
```
PUT /api/banner/admin/update
Auth: 管理员
Body: Banner对象
```

### 删除轮播图（管理端）
```
DELETE /api/banner/admin/delete/:id
Auth: 管理员
```

### 切换轮播图状态（管理端）
```
PUT /api/banner/admin/toggleStatus/:id
Auth: 管理员
```

---

## 7. 管理员管理 `/admin`

### 管理员登录
```
POST /api/admin/login
Body: { username, password }
Response: { token, admin }
```

### 获取管理员信息
```
GET /api/admin/info
Auth: 管理员
Response: Admin对象
```

### 获取管理员列表
```
GET /api/admin/list
Auth: 管理员
Response: Admin[]
```

---

## 8. 文件上传 `/file`

### 上传单个文件
```
POST /api/file/upload
Content-Type: multipart/form-data
Body: file
Response: { url, fullUrl }
```

---

## 9. 评价管理 `/review`

### 提交评价
```
POST /api/review/submit
Auth: 用户
Body: { orderId, productId, rating, content, images }
```

### 获取商品评价列表
```
GET /api/review/product/:productId?page=1&pageSize=10
Response: { records: [], total: 0 }
```

### 获取用户评价列表
```
GET /api/review/user?page=1&pageSize=10
Auth: 用户
Response: { records: [], total: 0 }
```

### 获取所有评价（管理端）
```
GET /api/review/all?status=&rating=&page=1&pageSize=10
Auth: 管理员
Response: { records: [], total: 0 }
```

### 回复评价（管理端）
```
PUT /api/review/reply
Auth: 管理员
Body: { reviewId, reply }
```

### 更新评价状态（管理端）
```
PUT /api/review/status
Auth: 管理员
Body: { reviewId, status }
```

### 检查订单是否已评价
```
GET /api/review/order/:orderId/hasReviewed
Response: boolean
```

### 获取订单评价详情
```
GET /api/review/order/:orderId
Response: Review对象
```

---

## 10. 地址管理 `/address`

### 获取地址列表
```
GET /api/address/list
Auth: 用户
Response: Address[]
```

### 添加地址
```
POST /api/address/add
Auth: 用户
Body: Address对象
```

### 更新地址
```
PUT /api/address/update
Auth: 用户
Body: Address对象
```

### 删除地址
```
DELETE /api/address/delete/:id
Auth: 用户
```

### 设置默认地址
```
PUT /api/address/setDefault/:id
Auth: 用户
```

### 验证配送范围
```
POST /api/address/checkDeliveryRange
Body: { latitude, longitude }
Response: { inRange, distance, distanceText, maxDistance }
```

---

## 11. 收藏管理 `/favorite`

### 添加收藏
```
POST /api/favorite/add
Auth: 用户
Body: { productId }
```

### 取消收藏
```
DELETE /api/favorite/remove?productId=1
Auth: 用户
```

### 检查是否已收藏
```
GET /api/favorite/check/:productId
Auth: 用户
Response: boolean
```

### 获取收藏列表
```
GET /api/favorite/list
Auth: 用户
Response: Favorite[]（含商品信息）
```

---

## 12. 点赞管理 `/like`

### 点赞商品
```
POST /api/like/add
Auth: 用户
Body: { productId }
```

### 取消点赞
```
DELETE /api/like/remove?productId=1
Auth: 用户
```

### 检查是否已点赞
```
GET /api/like/check/:productId
Auth: 用户
Response: boolean
```

### 获取点赞列表
```
GET /api/like/list
Auth: 用户
Response: ProductLike[]（含商品信息）
```

---

## 13. Dashboard统计 `/dashboard`

### 获取Dashboard统计数据
```
GET /api/dashboard/stats
Auth: 管理员
Response: {
  pendingOrders: 2,      // 待处理订单数
  preparingOrders: 3,    // 制作中订单数
  completedOrders: 5,    // 今日完成订单数
  todayRevenue: 256.50   // 今日营业额
}
```

---

## WebSocket

### 连接地址
```
ws://localhost:8080/api/ws/order
```

### 消息格式

#### 服务器推送 - 新订单
```json
{
  "type": "new_order",
  "data": {
    "id": 1,
    "orderNo": "202512100001",
    "totalPrice": 99.00,
    ...
  }
}
```

#### 服务器推送 - 订单状态更新
```json
{
  "type": "order_status_update",
  "data": {
    "orderId": 1,
    "status": "preparing"
  }
}
```

#### 连接成功
```json
{
  "type": "connected",
  "message": "连接成功"
}
```

---

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 失败响应
```json
{
  "code": 500,
  "message": "错误信息",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [...],
    "total": 100
  }
}
```

---

## 字段命名规则

所有接口返回的字段都使用 **驼峰命名** (camelCase)：

- `userId` 用户ID
- `productId` 商品ID
- `orderId` 订单ID
- `orderNo` 订单号
- `totalPrice` 总价
- `createTime` 创建时间
- `updateTime` 更新时间
- `isDefault` 是否默认
- ...

---

## 常见问题

### Q: WebSocket连接失败？
A: 确保：
1. 后端已启动在8080端口
2. 前端连接地址正确：`ws://localhost:8080/api/ws/order`
3. 已安装ws依赖：`npm install ws`

### Q: 今日统计数据不准确？
A: 使用专门的统计接口：
```javascript
GET /api/dashboard/stats  // 准确的今日数据
```

### Q: 字段名称不匹配？
A: 后端已自动转换为驼峰命名，确保前端使用驼峰格式访问。

---

## 测试示例

### 测试管理员登录
```bash
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 测试获取统计数据
```bash
curl http://localhost:8080/api/dashboard/stats \
  -H "Authorization: Bearer <admin_token>"
```

### 测试WebSocket连接
```javascript
const ws = new WebSocket('ws://localhost:8080/api/ws/order');
ws.onopen = () => console.log('连接成功');
ws.onmessage = (e) => console.log('收到消息:', e.data);
```

---

## 完整接口列表（共61个接口）

| 模块 | 接口数 |
|------|--------|
| 用户管理 | 6 |
| 商品管理 | 8 |
| 订单管理 | 7 |
| 分类管理 | 6 |
| 购物车 | 6 |
| 轮播图 | 6 |
| 管理员 | 3 |
| 文件上传 | 1 |
| 评价管理 | 8 |
| 地址管理 | 6 |
| 收藏管理 | 4 |
| 点赞管理 | 4 |
| Dashboard统计 | 1 |
| **总计** | **61** |

---

## 更新记录

- 2025-12-10: 创建完整的Node.js后端
- 2025-12-10: 添加所有控制器和路由
- 2025-12-10: 集成原生WebSocket支持
- 2025-12-10: 统一字段命名为驼峰格式
- 2025-12-10: 修复订单统计数据不准确问题

