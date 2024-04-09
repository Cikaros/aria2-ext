import {Database, Statement} from "bun:sqlite";
import C from "../config";
import type {Subscription, AddSubscription} from "./entry";
import type {File, AddFile} from "./entry";

const TABLE_FILES = `
    CREATE TABLE IF NOT EXISTS \`files\`
    (
        \`id\`
        integer
        NOT
        NULL
        PRIMARY
        KEY
        AUTOINCREMENT,     -- 主键
        \`created_at\`
        datetime
        NOT
        NULL
        DEFAULT
        CURRENT_TIMESTAMP, -- 创建时间
        \`updated_at\`
        datetime
        NOT
        NULL
        DEFAULT
        CURRENT_TIMESTAMP, -- 更新时间
        \`reference\`
        integer
        NOT
        NULL
        DEFAULT
        0,                 -- 关联订阅
        \`guid\`
        text
        NOT
        NULL,              -- 唯一ID
        \`is_perma_link\`
        TINYINT
        NOT
        NULL
        DEFAULT
        false,             -- 是否为永久连接
        \`link\`
        text
        NOT
        NULL,              -- 连接地址
        \`title\`
        text
        NOT
        NULL,              -- 显示标题
        \`description\`
        text
        NOT
        NULL
        DEFAULT
        '',                -- 描述信息
        \`torrent_link\`
        text,              -- 种子连接地址
        \`torrent_content_length\`
        integer,           -- 种子内容长度
        \`torrent_pub_date\`
        text,              -- 种子发布时间
        \`enclosure_type\`
        text,              -- 附件类型
        \`enclosure_length\`
        integer,           -- 附件长度
        \`enclosure_url\`
        text,              -- 附件地址
        \`aria_id\`
        text
        NOT
        NULL               -- Aria服务关联任务ID
    );`;

const TABLE_SUBSCRIPTIONS = `
    CREATE TABLE IF NOT EXISTS \`subscriptions\`
    (
        \`id\`
        integer
        NOT
        NULL
        PRIMARY
        KEY
        AUTOINCREMENT,     -- 主键
        \`created_at\`
        datetime
        NOT
        NULL
        DEFAULT
        CURRENT_TIMESTAMP, -- 创建时间
        \`updated_at\`
        datetime
        NOT
        NULL
        DEFAULT
        CURRENT_TIMESTAMP, -- 更新时间
        \`title\`
        text
        NOT
        NULL,              -- 标题
        \`link\`
        text
        NOT
        NULL,              -- 连接地址
        \`description\`
        text
        NOT
        NULL
        DEFAULT
        '',                -- 描述
        \`plugin_by\`
        text
        NOT
        NULL
        DEFAULT
        'default-plugin',  -- 关联处理插件
        \`limit\`
        text
        NOT
        NULL
        DEFAULT
        '',                -- 限制参数
        \`path\`
        text
        NOT
        NULL
        DEFAULT
        '/downloads',      -- 下载路径
        \`enable\`
        TINYINT
        NOT
        NULL
        DEFAULT
        true               -- 是否启用
    );`;

class Db {
    private database: Database;

    constructor() {
        this.database = new Database(C.DB_URI, {create: true});
    }

    async init() {
        //开启缓存模式
        //this.database.exec("PRAGMA journal_mode = WAL;");
        this.database.exec(TABLE_SUBSCRIPTIONS);
        this.database.exec(TABLE_FILES);
    }

    getSubscriptions(): Subscription[] {
        const sql = `
            SELECT id,
                   created_at,
                   updated_at,
                   title,
                   link,
                   description,
                   plugin_by,
                   "limit",
                   path,
                   enable
            FROM subscriptions
            WHERE enable = true`;
        return this.database.query<Subscription, any>(sql).all();
    }

    getSubscription(id: number): Subscription | null {
        const sql = `
            SELECT id,
                   created_at,
                   updated_at,
                   title,
                   link,
                   description,
                   plugin_by,
                   "limit",
                   path,
                   enable
            FROM subscriptions
            WHERE enable = true
              AND id = ?`;
        return this.database.query<Subscription, any>(sql).get(id);
    }

    addSubscriptions(subscriptions: AddSubscription[]) {
        const sql = `
            INSERT INTO subscriptions (title, link, description, path)
            VALUES (?, ?, ?, ?)`;
        const insert: Statement<Subscription> = this.database.prepare(sql);
        const inserts = this.database.transaction(subs => {
            // @ts-ignore
            for (const sub: AddSubscription of subs) insert.run(sub.title, sub.link, sub.description, sub.path);
            return subscriptions.length;
        });
        return inserts(subscriptions);
    }

    updateSubscriptions(subscriptions: Subscription[]) {
        const sql = `
            UPDATE subscriptions
            SET title       = ?,
                link        = ?,
                description = ?,
                path        = ?, \`limit\` = ?
            WHERE id = ?`;
        const update: Statement<Subscription> = this.database.prepare(sql);
        const updates = this.database.transaction(subs => {
            // @ts-ignore
            for (const sub: Subscription of subs) update.run(sub.title, sub.link, sub.description, sub.path, sub.limit, sub.id);
            return subscriptions.length;
        });
        return updates(subscriptions);
    }

    existsSubscription(url: string) {
        const sql = `
            SELECT 1
            FROM subscriptions
            WHERE link = ?
              AND enable = true`;
        return this.database.prepare(sql).all(url).length > 0;
    }

    getFiles(subscription: Subscription): File[] {
        const sql = `
            SELECT id,
                   created_at,
                   updated_at,
                   reference,
                   guid,
                   is_perma_link,
                   link,
                   title,
                   description,
                   torrent_link,
                   torrent_content_length,
                   torrent_pub_date,
                   enclosure_type,
                   enclosure_length,
                   enclosure_url,
                   aria_id
            FROM files
            WHERE reference = ?`;
        return this.database.query<File, any>(sql).all(subscription.id);
    }

    countFiles(subscription: Subscription): number {
        const sql = `
            SELECT id
            FROM files
            WHERE reference = ?`;
        return this.database.query<File, any>(sql).all(subscription.id).length;
    }

    addFiles(addFiles: AddFile[]) {
        const sql = `
            INSERT INTO files (reference, guid, link, title, torrent_link, torrent_content_length, torrent_pub_date,
                               enclosure_type, enclosure_length, enclosure_url, aria_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const insert: Statement<AddFile> = this.database.prepare(sql);
        const inserts = this.database.transaction(files => {
            // @ts-ignore
            for (const file: AddFile of files) insert.run(file.reference, file.guid, file.link, file.title, file.torrent_link,
                file.torrent_content_length, file.torrent_pub_date,
                file.enclosure_type, file.enclosure_length, file.enclosure_url, file.aria_id);
            return addFiles.length;
        });
        return inserts(addFiles);
    }

    close() {
        this.database.close();
    }

}

const db = new Db();

await db.init();
export default db;
