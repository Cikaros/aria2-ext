-- Your SQL goes here
CREATE TABLE IF NOT EXISTS `files` (
`id` integer NOT NULL PRIMARY KEY AUTOINCREMENT, -- 主键
`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 创建时间
`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 更新时间
`reference` integer NOT NULL DEFAULT 0, -- 关联订阅
`guid` text NOT NULL, -- 唯一ID
`is_perma_link` TINYINT NOT NULL DEFAULT false, -- 是否为永久连接
`link` text NOT NULL, -- 连接地址
`title` text NOT NULL, -- 显示标题
`description` text NOT NULL DEFAULT "", -- 描述信息
`torrent_link` text, -- 种子连接地址
`torrent_content_length` integer, -- 种子内容长度
`torrent_pub_date` text, -- 种子发布时间
`enclosure_type` text, -- 附件类型
`enclosure_length` integer, -- 附件长度
`enclosure_url` text, -- 附件地址
`aria_id` text NOT NULL -- Aria服务关联任务ID
);