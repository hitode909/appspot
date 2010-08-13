document.addEventListener('DOMContentLoaded', function() {
    if (navigator.userAgent.indexOf('Firefox/') == -1) {
        var div = document.createElement('div');
        div.id = 'banner';
        div.innerHTML = "<a href='http://www.mozilla.com/?from=sfx&amp;uid=0&amp;t=572'><img src='http://sfx-images.mozilla.org/firefox/3.6/468x60_blue.png' alt='Spread Firefox Affiliate Button' border='0' /></a>";
        document.body.appendChild(div);
    }
}, false);

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.querySelector('canvas');
    var plotter = new Plotter(canvas, 255);

    // 用意されたaudioタグを再生 前のaudioがstopしたタイミングで呼ばれる
    var playNext = function(that) {
        if (!that) throw('no that');

        // 次があるとき再生
        if (that.next) {
            that.current = that.next;
            that.current.audio.play();

            // plot
            setTimeout(function() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                plotter.clear();
                plotter.plot(that.current.vars);
            }, 0);

            // prepare next
            setTimeout(function() {
                prepareNext(that);
            }, 0);
        } else {
            // 次がないとき，同期的にprepareNextしてplayNextする
            prepareNext(that);
            playNext(that);
        }
    };

    // 次のaudioタグを用意してnextにいれる 非同期によいタイミングで
    var prepareNext = function(that) {
        if (!that) throw('no that');

        var samples = that.randomBeats(4);
        var audio = that.binaryAudio(samples);

        var sampleVars = [];
        for(var i = 0; i < samples.length; i++) {
            sampleVars.push(samples.charCodeAt(i) & 0xff);
        }

        audio.addEventListener('ended', function(e) {
            playNext(that);
            setTimeout(function() {
                e.target.parentNode.removeChild(e.target);
            }, 0);
        }, false);

        that.next = { audio: audio, vars: sampleVars };
    };

    var wav = new WavFile('./amen_lq.wav', function(that) {
        that.beatDetect();
        playNext(that);
    });
}, false);
