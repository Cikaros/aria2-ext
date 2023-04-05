package plugin

import (
	"log"
	"os"
	"plugin"
	"strings"
)

const defaultPath = "/default-plugins"

var pluginPath = os.Getenv("ARIA2_PLUGINS")
var skipBanner = strings.ToLower(os.Getenv("ARIA2_SKIP_BANNER")) == "true"
var Plugins = map[string]IPlugin{}

func Init() {
	loadPlugins(pluginPath)
	loadPlugins(defaultPath)
}

func loadPlugins(pluginPath string) {
	dirs, err := os.ReadDir(pluginPath)
	if err != nil {
		log.Printf("Plug-in directory read failed, plug-in loading from %s ignored... Procedure: %v\n", pluginPath, err)
		return
	}
	for _, file := range dirs {
		if !file.IsDir() {
			p, err := plugin.Open(pluginPath + "/" + file.Name())
			if err != nil {
				log.Printf("Unable to open %s, load has been skipped... Procedure: %v\n", file.Name(), err)
				return
			}
			cal, err := p.Lookup("Instance")
			if err != nil {
				log.Printf("Plugin %s format is incorrect, load has been skipped... Procedure: %v\n", file.Name(), err)
				return
			}
			iPlug := cal.(func() IPlugin)()
			info := iPlug.Info()
			if !skipBanner {
				info.Banner()
			}
			Plugins[info.UID()] = iPlug
			log.Printf("Plug-in %s detected, successfully loaded.\n", info.UID())
		}
	}
}
