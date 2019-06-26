;(() => {
    const TARGET = 'http://127.0.0.1:12347'

    const update = ([[app, artist, title, current, duration, paused]]) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${TARGET}/${encodeURIComponent(app)}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}/${current}/${duration}/${paused}`);
        xhr.send();
    };

    setInterval(() => {
        chrome.tabs.query({url: 'https://play.google.com/music/listen*'}, (tabs) => {
            if (!tabs.length) {
                return;
            }

            let tab = tabs[0];

            chrome.tabs.executeScript(tab.id, {code: '(' + (() => {
                let artist = document.getElementById('player-artist').innerText;
                let title = document.getElementById('currently-playing-title').innerText;
                let current = '-';
                let duration = '-';
                let [,audio] = document.getElementsByTagName('audio');
                let paused = !!audio.paused;

                return ['google-music', artist, title, current, duration, paused];
            }) + ')();'}, update);
        })
    }, 1000);

    setInterval(() => {
        chrome.tabs.query({url: 'https://music.youtube.com/*'}, (tabs) => {
            if (!tabs.length) {
                return;
            }

            let tab = tabs[0];

            chrome.tabs.executeScript(tab.id, {code: '(' + (() => {
                let selected = document.querySelector('ytmusic-player-queue-item[selected]');
                let infos = selected.querySelectorAll('yt-formatted-string');

                let artist = infos[1].innerHTML;
                let title = infos[0].innerHTML;
                let current = '-';
                let duration = '-';
                let paused = selected.attributes['play-button-state'].nodeValue == 'paused';

                return ['youtube-music', artist, title, current, duration, paused];
            }) + ')();'}, update);
        })
    }, 1000);
})();
