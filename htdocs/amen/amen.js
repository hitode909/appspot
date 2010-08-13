$(function() {
    var canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var plotter = new Plotter(canvas);

    // append, play => (append audio)  => playEnd = playNext  => (append audio)  => playEnd = playNext
    
    // 用意されたaudioタグを再生 前のaudioがstopしたタイミングで呼ばれる
    var playNext = function(that) {
        if (!that) throw('no that');

        // 次があるとき再生
        if (that.next) {
            that.current = that.next;
            that.current.audio[0].play();

            // plot
            setTimeout(function() {
                plotter.clear();
                plotter.plot(that.current.vars);
            }, 0);

            // prepare next
            setTimeout(function() {
                prepareNext(that);
            }, 100);
        } else {
            // 次がないとき，同期的に，prepareNextしてplayNextする
            prepareNext(that);
            playNext(that);
        }
    };

    // 次のaudioタグを用意してnextにいれる 非同期によいタイミングで
    var prepareNext = function(that) {
        if (!that) throw('no that');

        var samples = that.randomBeats(20);
        var audio = that.binaryAudio(samples);

        var sampleVars = [];
        for(var i = 0; i < samples.length; i++) {
            sampleVars.push(samples.charCodeAt(i) & 0xff);
        }

        audio.bind('ended', function(){
            playNext(that);
            $(this).remove();
        });

        that.next = { audio: audio, vars: sampleVars };
    };

    var wav = new WavFile('./amen_lq.wav', function(that) {
        that.beatDetect();
        playNext(that);
    });
});
