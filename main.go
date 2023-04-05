package main

import (
	"aria2-ext/dao"
	"aria2-ext/job"
	plug "aria2-ext/plugin"
	"fmt"
	"github.com/robfig/cron"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

const (
	Git       = "https://gitee.com/Cikaros/aria2-ext"
	Author    = "Cikaros"
	Blog      = "https://cikaros.gitee.io"
	Version   = "v0.3.0"
	BuildTime = "2023/04/03 12:00"
)

const Banner = `
----------------------------------------------------------------

 █████╗ ██████╗ ██╗ █████╗ ██████╗     ███████╗██╗  ██╗████████╗
██╔══██╗██╔══██╗██║██╔══██╗╚════██╗    ██╔════╝╚██╗██╔╝╚══██╔══╝
███████║██████╔╝██║███████║ █████╔╝    █████╗   ╚███╔╝    ██║   
██╔══██║██╔══██╗██║██╔══██║██╔═══╝     ██╔══╝   ██╔██╗    ██║   
██║  ██║██║  ██║██║██║  ██║███████╗    ███████╗██╔╝ ██╗   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝   ╚═╝

%s

Copyright (c) %s 2023-2024 <%s>

Version: %s | Build Time: %s
----------------------------------------------------------------
`

var startup = strings.ToLower(os.Getenv("ARIA2_STARTUP")) == "true"

func banner(jobs []dao.Rss) {
	fmt.Printf(Banner, Git, Author, Blog, Version, BuildTime)
	for _, rss := range jobs {
		rss.Info()
	}
}

func main() {
	var timer = cron.New() //定时器
	var rsses []dao.Rss
	dao.Conn.Find(&rsses) //加载订阅任务
	banner(rsses)
	plug.Init()
	for _, rss := range rsses {
		parse := job.Parse{Rss: rss}
		parse.Load(timer)
	}
	job.Init()
	defer job.Destroy()
	timer.Start()
	defer timer.Stop()
	if startup {
		for _, entry := range timer.Entries() {
			entry.Job.Run()
		}
	}
	quit := make(chan os.Signal)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

}
