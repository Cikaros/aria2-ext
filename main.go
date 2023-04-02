package main

import (
	"aria2-ext/dao"
	"aria2-ext/job"
	"github.com/robfig/cron"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	var timer = cron.New() //定时器
	var rsses []dao.Rss
	dao.Conn.Find(&rsses) //加载订阅任务
	for _, rss := range rsses {
		parse := job.Parse{Rss: rss}
		parse.Load(timer)
	}
	timer.Start()
	quit := make(chan os.Signal)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	timer.Stop()
}
