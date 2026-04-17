const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '975683142skn',
  database: process.env.DB_NAME || 'tea_order_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00',
  dateStrings: true
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    await runMigrations();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

// Auto-create new tables added after initial schema
async function runMigrations() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
        \`order_id\` bigint(20) NOT NULL,
        \`payment_no\` varchar(50) NOT NULL UNIQUE,
        \`amount\` decimal(10,2) NOT NULL,
        \`method\` varchar(20) NOT NULL DEFAULT 'paynow',
        \`status\` enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
        \`qr_string\` text,
        \`reference\` varchar(100),
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_order_id\` (\`order_id\`),
        KEY \`idx_status\` (\`status\`),
        CONSTRAINT \`fk_payments_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表'
    `);
    console.log('✅ 数据库迁移完成');
  } catch (error) {
    console.error('⚠️ 数据库迁移警告:', error.message);
  }
}

module.exports = { pool, testConnection };

