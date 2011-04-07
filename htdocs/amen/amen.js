document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.querySelector('canvas');
    var plotter = new Plotter(canvas, 1<<16);

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

        var samples = that.randomBeats(1);
        var audio = that.binaryAudio(samples);

        var sampleVars = [];
        for(var i = 0; i < samples.length; i+=2) {
            sampleVars.push(((samples.charCodeAt(i) & 0xff)<< 8) + (samples.charCodeAt(i+1) & 0xff));
        }

        audio.addEventListener('ended', function(e) {
            playNext(that);
            setTimeout(function() {
                e.target.parentNode.removeChild(e.target);
            }, 0);
        }, false);

        that.next = { audio: audio, vars: sampleVars };
    };

    var wav = new WavFile('./amen_mq.wav', function(that) {
        window.that = that;
        that.beatDetect();
        playNext(that);
    });
}, false);
