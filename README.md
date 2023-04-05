# Aria2扩展服务

## 简介

Aria2是一款自由、跨平台命令行界面的下载管理器，该软件根据GPLv2许可证进行分发。 支持的下载协议有：HTTP、HTTPS、FTP、Bittorrent和Metalink。

为了方便Nas玩家更好的进行自动化资源下载，特意实现Aria2扩展服务，便于自动订阅并下载想要的资源。

## 功能介绍

- Plugins
- Subscribe
    - Rss订阅
    - Custom订阅

## 数据库介绍

```xml

<rss version="2.0">
    <channel>
        <title>Mikan Project - 名侦探柯南</title>
        <link>http://mikanani.me/RSS/Bangumi?bangumiId=227&subgroupid=562</link>
        <description>Mikan Project - 名侦探柯南</description>
        <item>
            <guid isPermaLink="false">[NC-Raws] 名侦探柯南 / Detective Conan - 1071 (CR 1920x1080 AVC AAC MKV)</guid>
            <link>https://mikanani.me/Home/Episode/0d73785bdf95dc1f209a65d5d884c7d48e00fb55</link>
            <title>[NC-Raws] 名侦探柯南 / Detective Conan - 1071 (CR 1920x1080 AVC AAC MKV)</title>
            <description>[NC-Raws] 名侦探柯南 / Detective Conan - 1071 (CR 1920x1080 AVC AAC MKV)[1.38 GB]</description>
            <torrent xmlns="https://mikanani.me/0.1/">
                <link>https://mikanani.me/Home/Episode/0d73785bdf95dc1f209a65d5d884c7d48e00fb55</link>
                <contentLength>1481763712</contentLength>
                <pubDate>2023-01-28T20:31:24.817</pubDate>
            </torrent>
            <enclosure type="application/x-bittorrent" length="1481763712"
                       url="https://mikanani.me/Download/20230128/0d73785bdf95dc1f209a65d5d884c7d48e00fb55.torrent"/>
        </item>
        <item>
            <guid isPermaLink="false">[NC-Raws] 名侦探柯南 / Detective Conan - 1128 (B-Global 1920x1080 HEVC AAC MKV)
            </guid>
            <link>https://mikanani.me/Home/Episode/7b89972b81e3f71be98f5f4f1e73430ee7b41ac3</link>
            <title>[NC-Raws] 名侦探柯南 / Detective Conan - 1128 (B-Global 1920x1080 HEVC AAC MKV)</title>
            <description>[NC-Raws] 名侦探柯南 / Detective Conan - 1128 (B-Global 1920x1080 HEVC AAC MKV)[222.88 MB]
            </description>
            <torrent xmlns="https://mikanani.me/0.1/">
                <link>https://mikanani.me/Home/Episode/7b89972b81e3f71be98f5f4f1e73430ee7b41ac3</link>
                <contentLength>233706624</contentLength>
                <pubDate>2023-01-28T19:31:30.314</pubDate>
            </torrent>
            <enclosure type="application/x-bittorrent" length="233706624"
                       url="https://mikanani.me/Download/20230128/7b89972b81e3f71be98f5f4f1e73430ee7b41ac3.torrent"/>
        </item>
        <item>
            <guid isPermaLink="false">[NC-Raws] 名侦探柯南 / Detective Conan - 1127 (B-Global 1920x1080 HEVC AAC MKV)
            </guid>
            <link>https://mikanani.me/Home/Episode/03d2e294840ecd7c28842f2ff293091c25cfe434</link>
            <title>[NC-Raws] 名侦探柯南 / Detective Conan - 1127 (B-Global 1920x1080 HEVC AAC MKV)</title>
            <description>[NC-Raws] 名侦探柯南 / Detective Conan - 1127 (B-Global 1920x1080 HEVC AAC MKV)[214.03 MB]
            </description>
            <torrent xmlns="https://mikanani.me/0.1/">
                <link>https://mikanani.me/Home/Episode/03d2e294840ecd7c28842f2ff293091c25cfe434</link>
                <contentLength>224426720</contentLength>
                <pubDate>2023-01-21T21:15:45.953</pubDate>
            </torrent>
            <enclosure type="application/x-bittorrent" length="224426720"
                       url="https://mikanani.me/Download/20230121/03d2e294840ecd7c28842f2ff293091c25cfe434.torrent"/>
        </item>
    </channel>
</rss>
```

以上述RSS为例，添加Rss订阅：

```sqlite
INSERT INTO rsses (title, link, description, `limit`, cron, path, custom_plugin, enable)
VALUES ("Mikan Project - 名侦探柯南", "https://mikanani.me/RSS/Bangumi?bangumiId=227&subgroupid=562",
        "Mikan Project - 名侦探柯南", "B-Global 1920x1080 HEVC AAC MKV", "0 0 9 * * 6 2023-2025",
        "/downloads/名侦探柯南", "org.cikaros.plugin:rss-plugin", true);
```

如需进行其他形式的订阅，订阅创建方法与RSS订阅类似，创建与其相符的订阅信息，但在`custom_plugin`字段中填写自定义插件的UID即可扩展现有功能

> UID的格式为 `Package:ID` 例如: `org.cikaros.plugin:plugin-rss`

## 附录

### docker环境搭建

为方便一键搭建环境，准备了`docker-compose.yml`一份，仅供参考：

```yml
version: "3.8"

services:
  Aria2-Pro:
    container_name: aria2-pro
    image: p3terx/aria2-pro:latest
    environment:
      - ALL_PROXY=http://192.168.198.1:7890
      - PUID=65534
      - PGID=65534
      - UMASK_SET=022
      - RPC_SECRET=P3TERX
      - RPC_PORT=6800
      - LISTEN_PORT=6888
      - DISK_CACHE=64M
      - IPV6_MODE=false
      - UPDATE_TRACKERS=true
      - CUSTOM_TRACKER_URL=https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/AT_all.txt
      - TZ=Asia/Shanghai
    volumes:
      - vo-aria2:/config
      - /tmp/aria2:/downloads
    ports:
      - '6800:6800'
      - '6888:6888'
      - '6888:6888/udp'
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: 5m
  Aria2-Ext:
    container_name: aria2-ext
    image: cikaros/aria2-ext:v0.3.x
    depends_on:
      - Aria2-Pro
    environment:
      LANG: C.UTF-8
      TZ: Asia/Shanghai
      ARIA2_PROTOCOL: http
      ARIA2_HOST: 192.168.198.129
      ARIA2_SECRET: P3TERX
      ARIA2_PORT: 6800
      ARIA2_PLUGINS: /plugins
      ARIA2_PATH: /downloads
      ARIA2_DB: /config/data.db
      ARIA2_STARTUP: false
    restart: unless-stopped
    volumes:
      - ./aria2-ext.db:/config/data.db
    logging:
      driver: json-file
      options:
        max-size: 5m
volumes:
  vo-aria2:
```

### 环境变量说明

| Key               | Value           | 作用            |
|-------------------|-----------------|---------------|
| ARIA2_PROTOCOL    | http/https      | ARIA2_PRO请求协议 |
| ARIA2_HOST        | IP/Host         | ARIA2_PRO请求地址 |
| ARIA2_PORT        | 6800            | ARIA2_PRO请求端口 |
| ARIA2_SECRET      | P3TERX          | ARIA2_PRO请求证书 |
| ARIA2_PLUGINS     | /plugins        | 自定义插件地址       |
| ARIA2_PATH        | /downloads      | 自定义下载根路径      |
| ARIA2_DB          | /config/data.db | 自定义数据库文件地址    |
| ARIA2_STARTUP     | false           | 是否启动后立即执行一次   |
| ARIA2_SKIP_BANNER | false           | 是否跳过插件Banner  |

### Cron表达式参考

| 字段             | 允许值                      | 允许的特殊字符              |
|----------------|--------------------------|----------------------|
| 秒（Seconds）     | 0~59的整数                  | , - * / 四个字符         |
| 分（Minutes）     | 0~59的整数                  | , - * / 四个字符         |
| 小时（Hours）      | 0~23的整数                  | , - * / 四个字符         |
| 日期（DayofMonth） | 1~31的整数（但是你需要考虑你月的天数）    | ,- * ? / L W C 八个字符  |
| 月份（Month）      | 1~12的整数或者 JAN-DEC        | , - * / 四个字符         |
| 星期（DayofWeek）  | 1~7的整数或者 SUN-SAT （1=SUN） | , - * ? / L C # 八个字符 |

