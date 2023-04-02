package dao

import (
	"aria2-ext/net"
	"encoding/xml"
	"github.com/robfig/cron"
	"gorm.io/gorm"
	"io"
	"log"
	"net/http"
	"regexp"
	"sync"
)

var wg sync.WaitGroup //协程任务池

type Rss struct {
	gorm.Model
	Title       string //标题
	Link        string //订阅地址
	Description string `gorm:"default:''"`            //描述信息
	Type        int8   `gorm:"default:0"`             //资源类型 0 HTTP 1 HTTPS 2 FTP 3 Bittorrent 4 MetaLink
	Limit       string `gorm:"default:''"`            //正则匹配限制
	Cron        string `gorm:"default:'0 0/1 * * *'"` //定时表达式Cron
	Path        string `gorm:"default:'/download'"`   //存放路径
	Count       int    `gorm:"default:0"`             //计数文件
}

func (job *Rss) Run() {
	//根据订阅地址获取并解析数据
	log.Printf("Running RssJob[%s] %s...\n", job.Title, job.Link)
	if rss, err := job.Parse(); err == nil {
		for _, item := range rss.Channel.Items {
			if matched, _ := regexp.MatchString(job.Limit, item.Title); matched {
				var file RssFile
				if result := Conn.Where(&RssFile{Reference: job.ID, Guid: item.Guid}).First(&file); result.Error != nil {
					//数据不存在
					file.ParseRssFile(item, job)
					Conn.Create(&file) //创建数据
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
}

func (job *Rss) Load(cron *cron.Cron) {
	if err := cron.AddJob(job.Cron, job); err != nil {
		log.Printf("Failed to add RssJob[%s]. Procedure: %v\n", job.Title, err)
	}
}

func (job *Rss) Parse() (net.Rss, error) {
	var rss net.Rss
	resp, err := http.Get(job.Link)
	if err != nil {
		log.Printf("Failed to request RssJob data. Procedure: %v\n", err)
		return rss, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)

	decoder := xml.NewDecoder(resp.Body)
	err = decoder.Decode(&rss)
	if err != nil {
		return rss, err
	}
	return rss, err
}
