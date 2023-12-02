use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Rss {
    #[serde(rename = "channel")]
    pub channel: Channel,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Channel {
    #[serde(rename = "title")]
    pub title: String,
    #[serde(rename = "link")]
    pub link: String,
    #[serde(rename = "description")]
    pub description: String,
    #[serde(rename = "item")]
    pub item: Vec<Item>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    #[serde(rename = "guid")]
    pub guid: Guid,
    #[serde(rename = "link")]
    pub link: String,
    #[serde(rename = "title")]
    pub title: String,
    #[serde(rename = "description")]
    pub description: String,
    #[serde(rename = "torrent")]
    pub torrent: Torrent,
    #[serde(rename = "enclosure")]
    pub enclosure: Enclosure,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Guid {
    #[serde(rename = "$value")]
    pub guid: String,
    #[serde(rename = "isPermaLink")]
    pub is_perma_link: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Torrent {
    #[serde(rename = "link")]
    pub link: String,
    #[serde(rename = "contentLength")]
    pub content_length: i32,
    #[serde(rename = "pubDate")]
    pub pub_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Enclosure {
    #[serde(rename = "type")]
    pub _type: String,
    #[serde(rename = "length")]
    pub length: i32,
    #[serde(rename = "url")]
    pub url: String,
}
