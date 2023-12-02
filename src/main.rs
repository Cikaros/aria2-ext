mod db;
pub mod entries;
pub mod plugin;
pub mod schema;
//mod banner;
mod engine;

use engine::Manager;
use std::thread;
use tokio::runtime::Runtime;



fn main() {
    // 初始化日志系统
    env_logger::init();
    // Banner
    //    banner::exec();
    // 加载并初始化plugin

    let task = thread::spawn(|| {
        // 创建一个新的 Tokio 运行时
        let rt = Runtime::new().unwrap();
        // 加载并初始化plugin
        Manager::get_engine().scan_env_path();
        // 在 Tokio 运行时中执行异步任务
        rt.block_on(Manager::get_engine().run());
    });

    let rt = Runtime::new().unwrap();
    rt.block_on(Manager::get_engine().stop());

    let _ = task.join();

}
