package dao

import (
	"aria2-ext/aria2"
	"github.com/oliverpool/argo"
	"gorm.io/gorm"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
)

var client = aria2.DefaultServer.NewClient()

type RssFile struct {
	gorm.Model
	Reference   uint //Rss主键
	Guid        string
	IsPermaLink bool
	Link        string
	Title       string
	Description string
	Torrent     Torrent   `gorm:"embedded;embeddedPrefix:torrent_"`
	Enclosure   Enclosure `gorm:"embedded;embeddedPrefix:enclosure_"`
	AriaId      string
}

type Torrent struct {
	Link          string
	ContentLength int64
	PubDate       string
}

type Enclosure struct {
	Type   string
	Length int64
	Url    string
}

func (file *RssFile) url() string {
	var url = file.Link
	if file.Enclosure.Type == "application/x-bittorrent" {
		url = file.Enclosure.Url
	} else if len(file.Torrent.Link) > 0 {
		url = file.Torrent.Link
	}
	return url
}

func (file *RssFile) getBytes() ([]byte, error) {
	var data []byte
	resp, err := http.Get(file.url())
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
}

func (file *RssFile) worker(job *Rss, wg *sync.WaitGroup) {
	defer wg.Done()
	//文件下载规则
	var gid argo.GIDwithID
	var gids argo.GIDs
	var data []byte
	var err error
	var option = &argo.Option{}
	if len(job.Path) > 0 && strings.Index(job.Path, aria2.DefaultServer.Path) == 0 {
		option = &argo.Option{
			"dir": job.Path,
		}
		log.Printf("File as %s...\n", job.Path)
	}
	switch job.Type {
	case 3:
		data, err = file.getBytes()
		if err == nil {
			gid, err = client.AddTorrent(data, *option)
		}
		break
	case 4:
		data, err = file.getBytes()
		if err == nil {
			gids, err = client.AddMetalink(data, *option)
		}
		break
	default:
		gid, err = client.AddURI([]string{file.url()}, *option)
	}
	if err != nil {
		Conn.Delete(file)
		return
	}
	if len(gid.ID) > 0 {
		file.AriaId = gid.ID
	} else {
		file.AriaId = gids.ID
	}
	Conn.Update("aria_id", file)
}
