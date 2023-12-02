use crate::schema::{files, subscriptions};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

// 用于查询
#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = subscriptions)]
pub struct Subscription {
    pub id: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub title: String,
    pub link: String,
    pub description: String,
    pub plugin_by: String,
    pub limit: String,
    pub path: String,
    pub enable: bool,
}

impl Subscription {
    pub fn find_all(
        conn: &mut SqliteConnection,
    ) -> Result<Vec<Subscription>, diesel::result::Error> {
        subscriptions::table
            .filter(subscriptions::columns::enable.eq(true))
            .load(conn)
    }
}

// 用于查询
#[derive(Insertable, Queryable, Selectable, PartialEq, Clone, Debug)]
#[diesel(table_name = files)]
pub struct File {
    pub id: Option<i32>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub reference: i32,
    pub guid: String,
    pub is_perma_link: bool,
    pub link: String,
    pub title: String,
    pub description: String,
    pub torrent_link: Option<String>,
    pub torrent_content_length: Option<i32>,
    pub torrent_pub_date: Option<String>,
    pub enclosure_type: Option<String>,
    pub enclosure_length: Option<i32>,
    pub enclosure_url: Option<String>,
    pub aria_id: String,
}

impl File {
    pub fn find_by_subscription(
        conn: &mut SqliteConnection,
        sub: &Subscription,
    ) -> Result<Vec<File>, diesel::result::Error> {
        files::table
            .filter(files::columns::reference.eq(sub.id))
            .load(conn)
    }

    pub fn save(conn: &mut SqliteConnection, file: &File) -> Result<usize, diesel::result::Error> {
        diesel::insert_into(files::table).values(file).execute(conn)
    }
}
