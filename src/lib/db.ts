import {Database, Statement} from "bun:sqlite";
import C from "../config";
import type {Subscription, AddSubscription} from "./entry";
import type {File, AddFile} from "./entry";


class Db {
    private database: Database;

    constructor() {
        this.database = new Database(C.DB_URI, {create: true});
    }

    async init() {
        //开启缓存模式
        this.database.exec("PRAGMA journal_mode = WAL;");
        //加载初始化文件
        const init = Bun.file("./init.sql");
        if (await init.exists()) {
            const initSql = await init.text();
            console.info("已读取到init SQL")
            this.database.exec(initSql);
        }
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
