package dao

import (
	"aria2-ext/plugin"
	"github.com/robfig/cron"
	"gorm.io/gorm"
	"log"
	"regexp"
	"sync"
)

var wg sync.WaitGroup //协程任务池

type Rss struct {
	gorm.Model
	Title        string //标题
	Link         string //订阅地址
	Description  string `gorm:"default:''"`            //描述信息
	Type         int8   `gorm:"default:0"`             //资源类型 0 HTTP 1 HTTPS 2 FTP 3 Bittorrent 4 MetaLink
	CustomPlugin string `gorm:"default:''"`            //自定义解析插件 格式："Plugin.Package:Plugin.ID"
	Limit        string `gorm:"default:''"`            //正则匹配限制
	Cron         string `gorm:"default:'0 0/1 * * *'"` //定时表达式Cron
	Path         string `gorm:"default:'/download'"`   //存放路径
	Count        int    `gorm:"default:0"`             //计数文件
}

func (job *Rss) Run() {
	//根据订阅地址获取并解析数据
	log.Printf("Running RssJob[%s] %s...\n", job.Title, job.Link)
	iPlugin := plugin.Plugins[job.CustomPlugin]
	if iPlugin == nil {

	}
	bytes, err := iPlugin.GetBytes(job)
	if err == nil {
		var files []RssFile
		files, err = iPlugin.Files(bytes)
		if err == nil {
			for _, file := range files {
				if matched, _ := regexp.MatchString(job.Limit, file.Title); matched {
					var tmp RssFile
					if result := Conn.Where(&RssFile{Reference: job.ID, Guid: file.Guid}).First(&tmp); result.Error != nil {
						//数据不存在
						file.Reference = job.ID
						Conn.Create(&tmp) //创建数据
						wg.Add(1)
						go file.worker(job, &wg) //创建一个 goroutine 执行任务下载
					}
				}
			}
			wg.Wait() //goroutine 全部执行完成
			log.Printf("Running RssJob[%s] is Ok!\n", job.Title)
		} else {
			log.Printf("Failed to add RssJob[%s]. Procedure: %v\n", job.Title, err)
		}
	} else {
		log.Printf("Plugin %s does not exist, skip RssJob[%s]...\n", job.CustomPlugin, job.Title)
	}
}

func (job *Rss) Load(cron *cron.Cron) {
	if err := cron.AddJob(job.Cron, job); err != nil {
		log.Printf("Failed to add RssJob[%s]. Procedure: %v\n", job.Title, err)
	}
}
