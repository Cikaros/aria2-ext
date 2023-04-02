package plugin

import (
	"log"
	"os"
	"plugin"
)

var pluginPath = os.Getenv("ARIA2_PLUGINS")
var Plugins map[string]IPlugin

func init() {
	dirs, err := os.ReadDir(pluginPath)
	if err != nil {
		log.Printf("Plug-in directory read failed, plug-in loading from %s ignored...\n", pluginPath)
		return
	}
	for _, file := range dirs {
		if !file.IsDir() {
			log.Printf(pluginPath + file.Name())
			p, err := plugin.Open(pluginPath + file.Name())
			if err != nil {
				log.Printf("Unable to open %s, load has been skipped...\n", file.Name())
			}
			cal, err := p.Lookup("instance")
			if err != nil {
				log.Printf("Plugin %s format is incorrect, load has been skipped...\n", file.Name())
			}
			iPlug := cal.(func() IPlugin)()
			info := iPlug.Info()
			Plugins[info.UID()] = iPlug
			log.Printf("Plug-in %s detected, successfully loaded.\n", info.UID())
		}
	}
}
