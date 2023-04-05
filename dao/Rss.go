package dao

import (
	"fmt"
	"gorm.io/gorm"
)

type Rss struct {
	gorm.Model
	Title        string //标题
	Link         string //订阅地址
	Description  string `gorm:"default:''"`                              //描述信息
	Type         int8   `gorm:"default:0"`                               //资源类型 0 HTTP 1 HTTPS 2 FTP 3 Bittorrent 4 MetaLink
	CustomPlugin string `gorm:"default:'org.cikaros.plugin:plugin-rss'"` //自定义解析插件 格式："Plugin.Package:Plugin.ID"
	Limit        string `gorm:"default:''"`                              //正则匹配限制
	Cron         string `gorm:"default:'0 0/1 * * *'"`                   //定时表达式Cron
	Path         string `gorm:"default:'/download'"`                     //存放路径
	Enable       bool   `gorm:"default:true"`                            //是否启用
	Count        int    `gorm:"default:0"`                               //计数文件
}

func (rss *Rss) Info() {
	fmt.Println("----------------------------------------------------------------")
	fmt.Printf("Title: %s\n", rss.Title)
	fmt.Printf("Link: %s\n", rss.Link)
	fmt.Printf("CustomPlugin: %s\n", rss.CustomPlugin)
	fmt.Printf("Limit: %s\n", rss.Limit)
	fmt.Printf("Cron: %s\n", rss.Cron)
	fmt.Printf("Path: %s\n", rss.Path)
	fmt.Printf("Enable: %v\n", rss.Enable)
}
