package main

import (
	"aria2-ext/dao"
	"aria2-ext/job"
	plug "aria2-ext/plugin"
	"fmt"
	"github.com/robfig/cron"
	"os"
	"os/signal"
	"syscall"
)

const (
	Git       = "https://gitee.com/Cikaros/aria2-ext"
	Author    = "Cikaros"
	Blog      = "https://cikaros.gitee.io"
	Version   = "v0.2.0"
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

func Init() {
	fmt.Printf(Banner, Git, Author, Blog, Version, BuildTime)
}

func main() {
	Init()
	plug.Init()
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
