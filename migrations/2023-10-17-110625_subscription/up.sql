-- Your SQL goes here
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 主键
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 创建时间
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 更新时间
  `title` text NOT NULL , -- 标题
  `link` text NOT NULL , -- 连接地址
  `description` text NOT NULL  DEFAULT "", -- 描述
  `plugin_by` text NOT NULL  DEFAULT "", -- 关联处理插件
  `limit` text NOT NULL  DEFAULT "", -- 限制参数
  `cron` text NOT NULL  DEFAULT "0 0/1 * * *", -- 定时扫描
  `path` text NOT NULL  DEFAULT "/downloads", -- 下载路径
  `enable` TINYINT NOT NULL DEFAULT true -- 是否启用
);
