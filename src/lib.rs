pub mod entries;
pub mod plugin;
pub mod rss;
pub mod schema;

use aria2_ws::TaskOptions;
use chrono::Local;
use entries::File;
use entries::Subscription;
use plugin::Plugin;
use reqwest::blocking::Client;
use reqwest::Proxy;
use rss::*;
use std::env;
use std::error::Error;
use regex::Regex;

#[derive(Default, Debug)]
pub struct DefaultPlugin;

declare_plugin!(DefaultPlugin, DefaultPlugin::default);

fn get_task_options(sub: &Subscription) -> Option<TaskOptions> {
    Some(TaskOptions {
        split: Some(2),
        header: Some(vec!["Referer: https://mikanani.me/RSS/Bangumi".to_string()]),
        // all_proxy: Some("http://127.0.0.1:10809".to_string()),
        // Add extra options which are not included in TaskOptions.
        // extra_options: json!({"max-download-limit": "200K"})
        //    .as_object()
        //    .unwrap()
        //    .clone(),
        dir: Some(sub.path.clone()),
        ..Default::default()
    })
}

#[allow(unused)]
pub fn get_client() -> Client {
    if let Ok(proxy) = env::var("ARIA2_PROXY") {
        if let Ok(proxy) = Proxy::all(proxy) {
            return Client::builder().proxy(proxy).build().unwrap();
        }
    }
    Client::builder().build().unwrap()
}

impl Plugin for DefaultPlugin {
    fn name(&self) -> &'static str {
        "default-plugin"
    }

    /// 根据订阅获取可下载的文件对象
    fn process_subscription(&self, sub: &Subscription) -> Result<Vec<File>, Box<dyn Error>> {
        let local_time = Local::now();

        let response = get_client().get(sub.link.to_string()).send()?;

        let body = response.text()?;

        let rss: Rss = serde_xml_rs::from_str(&body)?;

        let regex = Regex::new(&sub.limit)?;

        let files = rss
            .channel
            .item
            .into_iter()
            .filter(|item| regex.is_match(&item.guid.guid))
            .map(|item| File {
                id: None,
                reference: sub.id,
                created_at: local_time.naive_local(),
                updated_at: local_time.naive_local(),
                guid: item.guid.guid,
                is_perma_link: item.guid.is_perma_link,
                link: item.link,
                title: item.title,
                description: item.description,
                torrent_link: Some(item.torrent.link),
                torrent_content_length: Some(item.torrent.content_length as i32),
                torrent_pub_date: Some(item.torrent.pub_date),
                enclosure_type: Some(item.enclosure._type),
                enclosure_length: Some(item.enclosure.length as i32),
                enclosure_url: Some(item.enclosure.url),
                aria_id: "".to_string(),
            })
            .collect();

        Ok(files)
    }

    /// 根据文件对象获取下载连接
    fn get_uri(
        &self,
        sub: &Subscription,
        file: &File,
    ) -> Option<(Vec<String>, Option<TaskOptions>, Option<u32>)> {
        if file.enclosure_url.is_some()
            && file.enclosure_type.is_some()
            && file.enclosure_length.is_some()
        {
            None
        } else {
            let uris = vec![file.link.to_string()];
            let options = get_task_options(sub);
            Some((uris, options, None))
        }
    }

    fn get_torrent(
        &self,
        sub: &Subscription,
        file: &File,
    ) -> Option<(
        Vec<u8>,
        Option<Vec<String>>,
        Option<TaskOptions>,
        Option<u32>,
    )> {
        if let Some(enclosure_url) = &file.enclosure_url {
            if let Ok(response) = get_client().get(enclosure_url).send() {
                if let Ok(bytes) = response.bytes() {
                    let bytes = bytes.to_vec();
                    let options = get_task_options(sub);
                    return Some((bytes, None, options, None));
                }
            }
        }
        None
    }

    fn get_metalink(
        &self,
        _sub: &Subscription,
        _file: &File,
    ) -> Option<(Box<[u8]>, Option<TaskOptions>, Option<u32>)> {
        None
    }
}
