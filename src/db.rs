use super::entries::File;
use super::entries::Subscription;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use log::debug;
use std::env;

pub struct Db {
    conn: SqliteConnection,
}

impl Db {
    pub fn new() -> Self {
        // 从数据库中拿到环境变量
        let database_url = env::var("ARIA2_DB").unwrap_or(String::from("./config/aria2-ext.db"));
        debug!("ARIA2_DB: {}", database_url);
        // 建连SQLITE连接
        Db {
            conn: SqliteConnection::establish(&database_url)
                .expect(&format!("Error connecting to {}", database_url)),
        }
    }

    // 获取订阅信息
    pub fn get_subscriptions(&mut self) -> Vec<Subscription> {
        if let Ok(res) = Subscription::find_all(&mut self.conn) {
            res
        } else {
            vec![]
        }
    }

    pub fn find_files_by_subscription(&mut self, sub: &Subscription) -> Vec<File> {
        if let Ok(res) = File::find_by_subscription(&mut self.conn, sub) {
            res
        } else {
            vec![]
        }
    }

    pub fn save_file(&mut self, file: &File) -> bool {
        if let Ok(res) = File::save(&mut self.conn, file) {
            res == 1
        } else {
            false
        }
    }
}
