package net

type Rss struct {
	Channel Channel `xml:"channel"`
}

type Channel struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	Items       []Item `xml:"item"`
}

type Item struct {
	Guid        string    `xml:"guid"`
	IsPermaLink bool      `xml:"guid,attr"`
	Link        string    `xml:"link"`
	Title       string    `xml:"title"`
	Description string    `xml:"description"`
	Torrent     Torrent   `xml:"torrent"`
	Enclosure   Enclosure `xml:"enclosure"`
}

type Torrent struct {
	Link          string `xml:"link"`
	ContentLength int64  `xml:"contentLength"`
	PubDate       string `xml:"pubDate"`
}

type Enclosure struct {
	Type   string `xml:"type,attr"`
	Length int64  `xml:"length,attr"`
	Url    string `xml:"url,attr"`
}
