package aria2

import (
	"github.com/oliverpool/argo"
	"github.com/oliverpool/argo/daemon"
	"github.com/oliverpool/argo/rpc/http"
	"gorm.io/gorm"
	"log"
	"os"
	"strconv"
	"time"
)

type AriaServer struct {
	gorm.DB
	protocol string //请求方式 http https
	host     string //请求地址 example.aria 127.0.0.1
	port     int    //请求端口 6800
	secret   string //请求证书 P3TERX
	Path     string //存放路径 /download
	DataPath string //数据存放地址
	enable   bool   //是否启用
	Remark   string //备注
}

var DefaultServer = Default()

func Default() AriaServer {
	port, err := strconv.ParseInt(os.Getenv("ARIA2_PORT"), 10, 32)
	if err != nil {
		port = 6800
	}
	var server = AriaServer{
		protocol: os.Getenv("ARIA2_PROTOCOL"),
		host:     os.Getenv("ARIA2_HOST"),
		port:     int(port),
		secret:   os.Getenv("ARIA2_SECRET"),
		Path:     os.Getenv("ARIA2_PATH"),
		DataPath: os.Getenv("ARIA2_DB"),
		enable:   true,
		Remark:   "",
	}
	log.Printf("Aria2 Ext DataPath: %s\n", server.DataPath)
	return server
}

func (s AriaServer) address() string {
	return s.host + ":" + strconv.Itoa(s.port)
}

func (s AriaServer) url() string {
	return s.protocol + "://" + s.address()
}

func (s AriaServer) jsonUrl() string {
	return s.url() + "/jsonrpc"
}

func (s AriaServer) NewClient() argo.Client {
	for !daemon.IsRunningOn(s.address()) {
		log.Println("Aria2 server is not started, waiting for a retry...")
		time.Sleep(time.Second)
	}
	log.Println("Aria2 server is started.")
	return http.NewClient(s.jsonUrl(), s.secret)
}
