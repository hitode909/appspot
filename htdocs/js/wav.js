
$.deferred.define();

$.extend({
    // see http://github.com/yanagia/jsaudio
    wavUtil: {
        playSaw: function(duration, f, factor) {
            var data = this.createSignal(duration, f, factor);
            return this.playUrl(this.convertToURL(data));
        },
        createSignal: function(t, sinF, factor){
            var i;
            var signals, sig, phase, hz;

            hz = 44100;
            phase = 0;
            t = Math.round(t*hz);
            var freq = sinF * 2.0 * Math.PI / hz;
            signals = "";

            var canvas = $('canvas')[0];
            var ctx = $('canvas')[0].getContext('2d');
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.beginPath();
            ctx.moveTo(-1, window.innerHeight / 2);

            var width = window.innerWidth;
            var height = window.innerHeight;
            for(i = 0; i < t; i++){
                sig = Math.sin(phase) * (1 - factor) + (Math.cos(phase) > 0 ? 1.0 : -1.0) * factor / 2;
                sig = (sig + 1) / 2 * 255;
                signals += String.fromCharCode(sig);
                if (i < width && i % 5 == 0) {
                    ctx.lineTo(i, sig / 255 * height);
                }
                phase += freq;
            };
            ctx.stroke();

            return signals;
        },
        convertToURL: function(signals) {
            var header;

            header = "WAVEfmt " + String.fromCharCode(16, 0, 0, 0);
            header += String.fromCharCode(1, 0); // format id
            header += String.fromCharCode(1, 0); // channels
            header += String.fromCharCode(68, 172, 0, 0); // sampling rate
            header += String.fromCharCode(68, 172, 0, 0); // byte/sec
            header += String.fromCharCode(1, 0); // block size
            header += String.fromCharCode(8, 0); // byte/sample
            header += "data";		       // data chunk label

            var siglen = signals.length;
            var sigsize;

            sigsize = String.fromCharCode((siglen >> 0 & 0xFF),
				          (siglen >> 8 & 0xFF),
				          (siglen >> 16 & 0xFF),
				          (siglen >> 24 & 0xFF));

            header += sigsize;
            var wavlen = header.length + signals.length;
            var riff = "RIFF";
            
            riff += String.fromCharCode((wavlen >> 0 & 0xFF),
			                (wavlen >> 8 & 0xFF),
			                (wavlen >> 16 & 0xFF),
			                (wavlen >> 24 & 0xFF));
            
            var wavefile = riff + header + signals;
            var encodedata = Base64.encode(wavefile);
            var dataurl = "data:audio/wav;base64," + encodedata;

            return dataurl;
        },
        _header: function() {
        },
        playUrl: function(url){
            var $audio = $('<audio>').attr({ src: url, loop: 'loop' });
            $('body').append($audio);
            $audio.bind('canplay', function(){
                this.play()
            });
            $audio.bind('ended', function(){
                $(this).remove()
            });
            return $audio;
        }
    },
});

$(function(){
    if (navigator.userAgent.indexOf('Firefox/') == -1) {
        $('h1').text('Firefox only');
        return;
    }
    var canvas = $('canvas');
    if (!canvas) {
        canvas = $('<canvas>');
        $('<body>').append(canvas);
    }
    canvas.attr({ width: window.innerWidth, height: window.innerHeight });

    var audio = null;
    var gotAxis = false;
    var lastMouseData = { x: 0, y: 0, z: 0 };

    var onData = function(data) {
        pitch = (-data.y + 1) * 700.0;
        var new_audio = $.wavUtil.playSaw(0.3, pitch, Math.abs(data.x));
        if (audio) audio.remove();
        audio = null;
        audio = new_audio;
        $('h1').css({ top: (data.y * 50 + 50) + '%', left: (data.x * 50 + 50) + '%' });
    };
    
    window.addEventListener(
        "MozOrientation",
        function(data) {
            gotAxis = true;
            onData(data);
        },true);

    $('body').bind('mousemove', function(ev) {
        if (!gotAxis)
            lastMouseData = { x: ev.pageX / window.innerWidth * 2.0 - 1.0, y: ev.pageY / window.innerHeight * 2.0 - 1.0, z: 0 };
    });
    var mouseTimer = setInterval(function() {
        if (gotAxis) clearInterval(mouseTimer);
        onData(lastMouseData);
    }, 100);
});