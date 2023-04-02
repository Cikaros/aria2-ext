package plugin

import (
	"aria2-ext/dao"
)

type Plugin struct {
	ID          string //插件ID demo
	Package     string //包名称 org.cikaros.plugin
	Name        string //插件名称 Demo
	Description string //插件描述 Plugin小Demo
	Version     string //插件版本 1.0.0
	Author      string //作者 Cikaros
	Blog        string //作者博客 https://cikaros.gitee.io
}

type IPlugin interface {
	Info() Plugin //获取插件详情

	GetBytes(*dao.Rss) ([]byte, error) //获取数据

	Files([]byte) ([]dao.RssFile, error) //获取资源Url

}

func (plugin *Plugin) UID() string {
	return plugin.Package + ":" + plugin.ID
}
