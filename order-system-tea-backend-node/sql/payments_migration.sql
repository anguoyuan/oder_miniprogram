-- PayNow payments table migration
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT '关联订单ID',
  `payment_no` varchar(50) NOT NULL UNIQUE COMMENT '支付流水号',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额（SGD）',
  `method` varchar(20) NOT NULL DEFAULT 'paynow' COMMENT '支付方式',
  `status` enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '支付状态',
  `qr_string` text COMMENT 'PayNow QR字符串',
  `reference` varchar(100) COMMENT '账单参考号',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';
