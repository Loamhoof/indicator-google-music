;(() => {
    const TARGET = 'http://127.0.0.1:12347'

    setInterval(() => {
        chrome.tabs.query({url: 'https://play.google.com/music/listen*'}, (tabs) => {
            if (!tabs.length) {
                return;
            }

            let tab = tabs[0];

            chrome.tabs.executeScript(tab.id, {code: '(' + (() => {
                let artist = document.getElementById('player-artist').innerText;
                let title = document.getElementById('currently-playing-title').innerText;
                let current = document.getElementById('time_container_current').innerText;
                let duration = document.getElementById('time_container_duration').innerText;
                let [,audio] = document.getElementsByTagName('audio');
                // let current = audio.currentTime;
                // let duration = document.querySelector(".currently-playing [data-col=duration] span").innerText;
                let paused = !!audio.paused;

                return [artist, title, current, duration, paused];
            }) + ')();'}, ([[artist, title, current, duration, paused]]) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', `${TARGET}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}/${current}/${duration}/${paused}`);
                xhr.send();
            });
        })
    }, 1000);
})();
