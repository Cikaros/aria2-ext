package dao

import (
	"gorm.io/gorm"
	"io"
	"log"
	"net/http"
)

type File struct {
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

func (file *File) Url() string {
	var url = file.Link
	if file.Enclosure.Type == "application/x-bittorrent" {
		url = file.Enclosure.Url
	} else if len(file.Torrent.Link) > 0 {
		url = file.Torrent.Link
	}
	return url
}

func (file *File) GetBytes() ([]byte, error) {
	var data []byte
	resp, err := http.Get(file.Url())
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
