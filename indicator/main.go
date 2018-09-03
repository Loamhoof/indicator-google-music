package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	ID = "indicator-google-music"
)

var (
	port       int
	logger     *log.Logger
	resetTimer *time.Timer
	resetAfter time.Duration = time.Second * 3
)

func init() {
	flag.IntVar(&port, "port", 15000, "Port of the shepherd")

	flag.Parse()

	logger = log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile)
}

func ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	logger.Println("Request", req.URL.Path)

	resetTimer.Reset(resetAfter)

	path := decodePath(req.URL)

	artist := path[0]
	song := path[1]
	if len(artist) > 15 {
		artist = artist[:14] + "…"
	}
	if len(song) > 15 {
		song = song[:14] + "…"
	}

	label := fmt.Sprintf("%s - %s", artist, song)

	// var icon string
	// if path[4] == "false" {
	// 	icon = play
	// } else {
	// 	icon = pause
	// }

	if err := update(ID, label); err != nil {
		logger.Println(err)
	}
}

func decodePath(u *url.URL) []string {
	if u.RawPath == "" {
		return strings.Split(u.Path[1:], "/")
	}

	encodedPath := strings.Split(u.RawPath[1:], "/")

	decodedPath := make([]string, len(encodedPath))
	for i, encodedComponent := range encodedPath {
		decodedComponent, _ := url.PathUnescape(encodedComponent)
		decodedPath[i] = decodedComponent
	}

	return decodedPath
}

func serve() {
	http.HandleFunc("/", ServeHTTP)
	logger.Println("Listening...")
	if err := http.ListenAndServe(":12347", nil); err != nil {
		logger.Println(err)
	}
}

func update(id, label string) error {
	resp, err := http.Post(fmt.Sprintf("http://localhost:%v/%s", port, id), "text/plain", strings.NewReader(label))
	if err != nil {
		return err
	}
	resp.Body.Close()

	return nil
}

func main() {
	resetTimer = time.AfterFunc(resetAfter, func() {
		if err := update(ID, ""); err != nil {
			logger.Println(err)
		}
	})

	serve()
}
