package test

import (
	"github.com/oliverpool/argo"
	"testing"
)

func TestAriaOption(t *testing.T) {
	option := argo.Option{
		"dir": "/download",
	}
	println(option)
}
