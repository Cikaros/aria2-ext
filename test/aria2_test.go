package test

import (
	"github.com/oliverpool/argo"
	"log"
	"os"
	"testing"
)

func TestAriaOption(t *testing.T) {
	option := argo.Option{
		"dir": "/download",
	}
	println(option)
}

func TestFiles(t *testing.T) {
	path := "E:\\Temp\\go\\src\\aria2-ext\\plugin"
	dirs, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Plug-in directory read failed, plug-in loading from %s ignored...\n", path)
		return
	}
	for _, file := range dirs {
		log.Println(file.Name())
	}
}
