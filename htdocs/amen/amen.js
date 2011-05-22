document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.querySelector('canvas');
    var plotter = new Plotter(canvas, 1<<16);
    var text_player = new TextLoader();

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

                // テキスト表示モード
                if (location.hash.match(/text/)) {
                    var text = ' ' + text_player.get();
                    var fontSize = window.innerWidth / text.length;
                    plotter.context.fillStyle = 'hsl(' + (text.length * 10) + ',100%, 50%)';
                    plotter.context.font = '' + fontSize + 'px gothic bold';
                    plotter.context.fillText(text, 0, canvas.height - fontSize, 300);
                }

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

        var samples = that.shiftPitch(that.randomBeats(1));
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

    canvas.addEventListener('click', function(event) {
        var pitch = (canvas.clientHeight - event.clientY) / canvas.clientHeight * 2;
        wav.pitch = pitch;
    }, false);
}, false);
