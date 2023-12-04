use super::db::Db;
use super::entries::File;
use crate::plugin::Plugin;
use aria2_ws::Client;
use cron::Schedule;
use libloading::Library;
use libloading::Symbol;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::Path;
use std::time::Duration;
//use chrono::NaiveDateTime;
use chrono::Utc;
//use diesel::prelude::*;
//use diesel::sqlite::SqliteConnection;
use std::str::FromStr;
use std::sync::Once;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use std::thread;
use tokio::signal;

use log::debug;
use log::info;
use log::warn;

#[derive(Default)]
pub struct Manager {
    plugins: HashMap<&'static str, Library>,
    enable: Arc<AtomicBool>,
}

unsafe impl Sync for Manager {}
unsafe impl Send for Manager {}

static mut ENGINE: Option<Manager> = None;
static INIT_ENGINE: Once = Once::new();

#[cfg(target_os = "linux")]
const PLUGIN_EXT: &'static str = "so";
#[cfg(target_os = "windows")]
const PLUGIN_EXT: &'static str = "dll";
#[cfg(target_os = "macos")]
const PLUGIN_EXT: &'static str = "dylib";

#[cfg(target_os = "linux")]
const ARIA2_PLUGIN_PATH: &'static str = "./plugins";
#[cfg(target_os = "windows")]
const ARIA2_PLUGIN_PATH: &'static str = ".\\plugins";
#[cfg(target_os = "macos")]
const ARIA2_PLUGIN_PATH: &'static str = "./plugins";

// 建立Aria2服务连接
async fn get_aria2_service() -> Client {
    // 从数据库中拿到环境变量
    let protocol = env::var("ARIA2_PROTOCOL").unwrap_or(String::from("ws"));
    let host = env::var("ARIA2_HOST").unwrap_or(String::from("localhost"));
    let port = env::var("ARIA2_PORT").unwrap_or(String::from("6800"));
    let aria2_url = format!("{}://{}:{}/jsonrpc", protocol, host, port);
    let secret = env::var("ARIA2_SECRET").unwrap_or(String::from("P3TERX"));
    debug!("ARIA2_PROTOCOL: {}", protocol);
    debug!("ARIA2_HOST: {}", host);
    debug!("ARIA2_PORT: {}", port);
    debug!("ARIA2_SECRET: {}", secret);
    Client::connect(&aria2_url, Some(&secret)).await.unwrap()
}

impl Manager {
    pub fn get_engine() -> &'static mut Manager {
        INIT_ENGINE.call_once(|| {
            let engine = Manager::default();
            unsafe {
                ENGINE = Some(engine);
            }
        });

        unsafe { ENGINE.as_mut().unwrap() }
    }

    pub fn scan_env_path(&mut self) {
        let plugin_path = env::var("ARIA2_PLUGIN_PATH").unwrap_or(String::from(ARIA2_PLUGIN_PATH));
        let entries = fs::read_dir(plugin_path).expect("Failed to read directory!");

        for entry in entries {
            if let Ok(entry) = entry {
                let file_path = entry.path();
                debug!("scan file path {:?}", file_path);
                if let Some(extension) = file_path.extension() {
                    if extension == PLUGIN_EXT {
                        if let Ok(p) = fs::canonicalize(file_path.as_path()) {
                            self.load_plugin_by_filename(&p);
                        } else {
                            self.load_plugin_by_filename(&file_path);
                        }
                    }
                }
            }
        }
    }

    /// 加载指定的扩展
    #[allow(unused)]
    pub fn load_plugin_by_filename(&mut self, filename: &Path) {
        // 加载动态库
        let lib = unsafe { Library::new(filename) };

        if let Ok(lib) = lib {
            let extend = Manager::get_plugin(&lib);

            self.plugins.insert(extend.name(), lib);

            info!("The plugin [{}] is loaded successfully!", extend.name());

            extend.on_extend_load();
        } else {
            warn!("The plugin failed to load.")
        }
    }

    fn get_plugin(lib: &Library) -> Box<dyn Plugin> {
        // 构造函数（拓展接口函数）签名
        #[allow(improper_ctypes_definitions)]
        type ExtendCreator = unsafe extern "C" fn() -> *mut dyn Plugin;
        // 取得函数符号
        let constructor: Symbol<ExtendCreator> = unsafe { lib.get(b"_plugin_create").unwrap() };

        // 调用该函数，取得 Plugin Trait 实例的原始指针
        let extend = unsafe { Box::from_raw(constructor()) };

        extend
    }

    #[allow(unused)]
    pub fn get_plugin_by_name(&self, name: &str) -> Option<Box<dyn Plugin>> {
        match self.plugins.get(name) {
            Some(lib) => Some(Manager::get_plugin(lib)),
            None => None,
        }
    }

    pub async fn run(&mut self) {
        self.enable.store(true, Ordering::Relaxed);
        // 数据库与Aria2服务初始化
        let mut db = Db::new();
        let client = get_aria2_service().await;
        // 创建一个 cron 表达式的 Schedule
        let aria2_cron = env::var("ARIA2_CRON").unwrap_or(String::from("0 0 0/1 * * *"));
        let schedule = Schedule::from_str(&aria2_cron);
        if let Ok(s) = schedule {
            let running = self.enable.clone();
            while running.load(Ordering::Relaxed) {
                // 获取下一个要执行的时间点
                let next = s.upcoming(Utc).next().unwrap();
                // 计算下一个时间点与当前时间的时间间隔
                let delay = next.signed_duration_since(chrono::Local::now());
                // 等待时间间隔
                let delay_duration = Duration::from(delay.to_std().unwrap());
                debug!("task running!");
                // 加载订阅任务
                let subscriptions = db.get_subscriptions();

                for sub in &subscriptions {
                    info!(
                        "【{}】<{}> : {}",
                        sub.title, sub.link, sub.path
                    );
                    if let Some(plugin) = self.get_plugin_by_name(&sub.plugin_by) {
                        let result: Result<Vec<File>, _> = plugin.process_subscription(&sub);
                        if result.is_ok() {
                            let files = result.ok().unwrap_or(Vec::new());
                            let has_files = db.find_files_by_subscription(&sub);
                            let diff: Vec<File> = files
                                .iter()
                                .filter(|item1| {
                                    !has_files.iter().any(|item2| item1.guid == item2.guid)
                                })
                                .cloned()
                                .collect();
                            debug!("diff files: {:?}", &diff);
                            for file in diff {
                                let mut result: Option<String> = None;
                                if let Some((uris, options, position)) = plugin.get_uri(&sub, &file)
                                {
                                    if let Ok(r) =
                                        client.add_uri(uris, options, position, None).await
                                    {
                                        debug!("download uris result {:?}", r);
                                        result = Some(r);
                                    };
                                } else if let Some((torrent, uris, options, position)) =
                                    plugin.get_torrent(&sub, &file)
                                {
                                    if let Ok(r) = client
                                        .add_torrent(torrent, uris, options, position, None)
                                        .await
                                    {
                                        debug!("download torrent result {:?}", r);
                                        result = Some(r);
                                    }
                                } else if let Some((metalink, options, position)) =
                                    plugin.get_metalink(&sub, &file)
                                {
                                    if let Ok(r) =
                                        client.add_metalink(metalink, options, position, None).await
                                    {
                                        debug!("download metalink result {:?}", r);
                                        result = Some(r);
                                    }
                                }
                                if let Some(guid) = result {
                                    let mut file = file;
                                    file.aria_id = guid;
                                    db.save_file(&file);
                                }
                            }
                        } else {
                            warn!("{:?}", result.err().unwrap());
                        }
                    } else {
                        warn!(
                            "There is a problem with the 'plugin_by' of this subscription!:{:?}",
                            &sub.plugin_by
                        );
                    }
                }
                let _ = client.save_session();
                debug!("task waitting...{:?}", delay_duration);
                thread::sleep(delay_duration);
            }
        } else {
            warn!(
                "There is a problem with the 'Cron' of this subscription!:{:?}",
                aria2_cron
            );
        }
    }

    pub async fn stop(&mut self) {
        debug!("Waiting for the termination signal...");
        let _ = signal::ctrl_c().await;
        self.enable.store(false, Ordering::Relaxed);
        info!("Received termination signal. Exiting...");
    }
}
