package job

import (
	"aria2-ext/aria2"
	"aria2-ext/dao"
	"github.com/oliverpool/argo"
	"log"
	"runtime"
	"strings"
)

var client argo.Client

func Init() {
	if runtime.GOOS != "windows" {
		client = aria2.DefaultServer.NewClient()
	}
}

func Destroy() {
	defer func(client argo.Client) {
		err := client.Close()
		if err != nil {
		}
	}(client)
}

func worker(job *Parse, file *dao.File) {
	//文件下载规则
	if runtime.GOOS != "windows" {
		var gid argo.GIDwithID
		var gids argo.GIDs
		var data []byte
		var err error
		var option = &argo.Option{}
		if len(job.Path) > 0 && strings.Index(job.Path, aria2.DefaultServer.Path) == 0 {
			option = &argo.Option{
				"dir": job.Path,
			}
			log.Printf("File[%s] as %s...\n", file.Title, job.Path)
		}
		switch job.Type {
		case 3:
			data, err = file.GetBytes()
			if err == nil {
				gid, err = client.AddTorrent(data, *option)
			}
			break
		case 4:
			data, err = file.GetBytes()
			if err == nil {
				gids, err = client.AddMetalink(data, *option)
			}
			break
		default:
			gid, err = client.AddURI([]string{file.Url()}, *option)
		}
		if err != nil {
			dao.Conn.Delete(file)
			return
		}
		if len(gid.ID) > 0 {
			file.AriaId = gid.ID
		} else {
			file.AriaId = gids.ID
		}
		dao.Conn.Update("aria_id", file)
	} else {
		log.Printf("url:%s\n", file.Url())
	}
}
