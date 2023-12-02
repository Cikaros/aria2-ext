use super::entries::File;
use super::entries::Subscription;
use aria2_ws::TaskOptions;
use std::any::Any;
use std::error::Error;

pub trait Plugin: Any + Send + Sync {
    /// 获取扩展名称
    fn name(&self) -> &'static str;

    /// 当拓展被加载时触发该事件
    fn on_extend_load(&self) {}

    /// 根据订阅获取可下载的文件对象
    fn process_subscription(&self, sub: &Subscription) -> Result<Vec<File>, Box<dyn Error>>;

    /// 根据文件对象获取下载连接
    fn get_uri(
        &self,
        sub: &Subscription,
        file: &File,
    ) -> Option<(Vec<String>, Option<TaskOptions>, Option<u32>)>;

    fn get_torrent(
        &self,
        sub: &Subscription,
        file: &File,
    ) -> Option<(
        Vec<u8>,
        Option<Vec<String>>,
        Option<TaskOptions>,
        Option<u32>,
    )>;

    fn get_metalink(
        &self,
        sub: &Subscription,
        file: &File,
    ) -> Option<(Box<[u8]>, Option<TaskOptions>, Option<u32>)>;
}

#[macro_export]
macro_rules! declare_plugin {
    ($plugin_type:ty, $constructor:path) => {
        #[no_mangle]
        #[allow(improper_ctypes_definitions)]
        pub extern "C" fn _plugin_create() -> Box<dyn Plugin + 'static> {
            // make sure the constructor is the correct type.
            let constructor: fn() -> $plugin_type = $constructor;

            let object = constructor();

            Box::new(object)
        }
    };
}
