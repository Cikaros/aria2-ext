package dao

import (
	"aria2-ext/aria2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var Conn *gorm.DB

func init() {
	Conn, _ = gorm.Open(sqlite.Open(aria2.DefaultServer.DataPath), &gorm.Config{})
	_ = Conn.AutoMigrate(&Rss{})
	_ = Conn.AutoMigrate(&File{})
}
