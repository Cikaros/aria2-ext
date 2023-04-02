package job

import (
	"aria2-ext/dao"
	"aria2-ext/plugin"
	"github.com/robfig/cron"
	"log"
	"regexp"
	"sync"
)

var wg sync.WaitGroup //协程任务池

type Parse struct {
	dao.Rss
}

func (job *Parse) Run() {
	//根据订阅地址获取并解析数据
	log.Printf("Running RssJob[%s] %s...\n", job.Title, job.Link)
	iPlugin := plugin.Plugins[job.CustomPlugin]
	if iPlugin == nil {
		log.Printf("Plugin %s does not exist, skip RssJob[%s]...\n", job.CustomPlugin, job.Title)
		return
	}
	data, _ := iPlugin.GetBytes(&job.Rss)
	if len(data) > 0 {
		files, err := iPlugin.Files(data)
		if len(files) > 0 {
			for _, file := range files {
				if matched, _ := regexp.MatchString(job.Limit, file.Title); matched {
					var tmp dao.Rss
					if result := dao.Conn.Where(&dao.File{Reference: job.ID, Guid: file.Guid}).First(&tmp); result.Error != nil {
						//数据不存在
						file.Reference = job.ID
						dao.Conn.Create(&tmp) //创建数据
						wg.Add(1)
						go worker(job, &file, &wg) //创建一个 goroutine 执行任务下载
					}
				}
			}
			wg.Wait() //goroutine 全部执行完成
			log.Printf("Running RssJob[%s] is Ok!\n", job.Title)
		} else {
			log.Printf("Failed to parsing RssJob[%s]. Procedure: %v\n", job.Title, err)
		}
	}
}

func (job *Parse) Load(cron *cron.Cron) {
	if err := cron.AddJob(job.Cron, job); err != nil {
		log.Printf("Failed to add RssJob[%s]. Procedure: %v\n", job.Title, err)
	}
}
