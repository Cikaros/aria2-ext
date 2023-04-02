package plug_in

import (
	"aria2-ext/dao"
	"aria2-ext/net"
	plug "aria2-ext/plugin"
	"bytes"
	"encoding/xml"
	"io"
	"log"
	"net/http"
)

type RssPlugin struct {
	plug.Plugin
}

func instance() *RssPlugin {
	return &RssPlugin{
		Plugin: plug.Plugin{
			ID:          "rss-plugin",
			Package:     "org.cikaros.plugin",
			Version:     "v1.0.0",
			Name:        "Rss解析插件",
			Description: "默认解析插件",
			Author:      "Cikaros",
			Blog:        "https://cikaros.gitee.io",
		},
	}
}

func (i *RssPlugin) Info() plug.Plugin {
	return i.Plugin
} //获取插件详情

func (i *RssPlugin) GetBytes(job *dao.Rss) ([]byte, error) {
	var data []byte
	resp, err := http.Get(job.Link)
	if err != nil {
		log.Printf("Failed to request RssJob data. Procedure: %v\n", err)
		return data, err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
		}
	}(resp.Body)
	_, err = resp.Body.Read(data)
	if err != nil {
		log.Printf("Failed to request RssJob data. Procedure: %v\n", err)
		return data, err
	}
	return data, err
} //拉取数据

func (i *RssPlugin) Files(data []byte) ([]dao.File, error) {
	var rss net.Rss
	var files []dao.File
	reader := bytes.NewReader(data)
	decoder := xml.NewDecoder(reader)
	err := decoder.Decode(&rss)
	if err != nil {
		return files, err
	}
	for _, file := range rss.Channel.Items {
		files = append(files, parse(file))
	}
	return files, err
} //获取资源Url

func parse(i net.Item) dao.File {
	return dao.File{
		Guid:        i.Guid,
		IsPermaLink: i.IsPermaLink,
		Link:        i.Link,
		Title:       i.Title,
		Description: i.Description,
		Torrent: dao.Torrent{
			Link:          i.Torrent.Link,
			ContentLength: i.Torrent.ContentLength,
			PubDate:       i.Torrent.PubDate,
		},
		Enclosure: dao.Enclosure{
			Type:   i.Enclosure.Type,
			Length: i.Enclosure.Length,
			Url:    i.Enclosure.Url,
		},
	}
}
