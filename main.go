package main

import (
	"aria2-ext/dao"
	"github.com/robfig/cron"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	var timer = cron.New() //定时器
	var jobs []dao.Rss
	dao.Conn.Find(&jobs) //加载订阅任务
	for _, rss := range jobs {
		rss.Load(timer)
	}
	timer.Start()
	quit := make(chan os.Signal)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	timer.Stop()
}
