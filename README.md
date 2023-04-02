# Aria2扩展服务

## 简介

Aria2是一款自由、跨平台命令行界面的下载管理器，该软件根据GPLv2许可证进行分发。 支持的下载协议有：HTTP、HTTPS、FTP、Bittorrent和Metalink。

为了方便Nas玩家更好的进行自动化资源下载，特意实现Aria2扩展服务，便于自动订阅并下载想要的资源。

## 功能介绍

- Rss种子订阅

## 数据库介绍

目前仅支持Rss订阅下载

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
INSERT INTO rsses (title, link, description, `limit`, cron, path)
VALUES ("Mikan Project - 名侦探柯南", "https://mikanani.me/RSS/Bangumi?bangumiId=227&subgroupid=562",
        "Mikan Project - 名侦探柯南", "B-Global 1920x1080 HEVC AAC MKV", "0 0 9 * * 6 2023-2025",
        "/downloads/名侦探柯南");
```

## 附录

### Cron表达式参考

| 字段             | 允许值                      | 允许的特殊字符              |
|----------------|--------------------------|----------------------|
| 秒（Seconds）     | 0~59的整数                  | , - * / 四个字符         |
| 分（Minutes）     | 0~59的整数                  | , - * / 四个字符         |
| 小时（Hours）      | 0~23的整数                  | , - * / 四个字符         |
| 日期（DayofMonth） | 1~31的整数（但是你需要考虑你月的天数）    | ,- * ? / L W C 八个字符  |
| 月份（Month）      | 1~12的整数或者 JAN-DEC        | , - * / 四个字符         |
| 星期（DayofWeek）  | 1~7的整数或者 SUN-SAT （1=SUN） | , - * ? / L C # 八个字符 |
| 年(可选，留空)（Year） | 1970~2099                | , - * / 四个字符         |

