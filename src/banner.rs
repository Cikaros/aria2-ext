static BUILD_GIT: &'static str = env!("BUILD_GIT");
static BUILD_AUTHOR: &'static str = env!("BUILD_AUTHOR");
static BUILD_BLOG: &'static str = env!("BUILD_BLOG");
static BUILD_VERSION: &'static str = env!("BUILD_VERSION");
static BUILD_TIME: &'static str = env!("BUILD_TIME");

static BUILD_GIT: &'static str = "https://gitee.com/Cikaros/aria2-ext";
static BUILD_AUTHOR: &'static str = "Cikaros";
static BUILD_BLOG: &'static str = "https://cikaros.gitee.io";
static BUILD_VERSION: &'static str = "v0.3.0";
static BUILD_TIME: &'static str = "yyyy-MM-dd HH:mm:ss";

pub fn exec() {
    print!(
        r#"
----------------------------------------------------------------

 █████╗ ██████╗ ██╗ █████╗ ██████╗     ███████╗██╗  ██╗████████╗
██╔══██╗██╔══██╗██║██╔══██╗╚════██╗    ██╔════╝╚██╗██╔╝╚══██╔══╝
███████║██████╔╝██║███████║ █████╔╝    █████╗   ╚███╔╝    ██║   
██╔══██║██╔══██╗██║██╔══██║██╔═══╝     ██╔══╝   ██╔██╗    ██║   
██║  ██║██║  ██║██║██║  ██║███████╗    ███████╗██╔╝ ██╗   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝   ╚═╝

{}

Copyright (c) {} 2023-2024 <{}>

Version: {} | Build Time: {}
----------------------------------------------------------------
"#,
        BUILD_GIT, BUILD_AUTHOR, BUILD_BLOG, BUILD_VERSION, BUILD_TIME
    );
}
