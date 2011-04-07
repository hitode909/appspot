// see glitchmonkey
function load_binary_resource(url, ok) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.onreadystatechange = function (e) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                ok(req.responseText);
            }
        }
    };
    req.send(null);
}

function base64encode(data) {
  return btoa(data.replace(/[\u0100-\uffff]/g, function(c) {
    return String.fromCharCode(c.charCodeAt(0) & 0xff);
  }));
}

// ------------------------------------------------

WavFile = function(url, ok) {
    this.url = url;
    this.ok = ok;
    var self = this;
    load_binary_resource(url, function(binary) {
        self.binary = binary;
        self.parseHeader();
        if (self.ok) self.ok(self);
    });
};

WavFile.prototype = {
    playBinary: function(binary) {
        return this.playUrl(this.toDataURL(binary));
    },
    playUrl: function(url) {
        var audio = this.URLAudio(url);
        audio.addEventListener('canplay', function() {
            e.target.play();
        }, false);

        audio.addEventListener('ended', function(e) {
            e.target.parentNode.removeChild(e.target);
        }, false);

        return audio;
    },
    URLAudio: function(url) {
        if (!url) url = this.url;
        var audio = document.createElement('audio');
        audio.src = url;
        document.body.appendChild(audio);
        return audio;
    },
    binaryAudio: function(binary) {
        if (!binary) throw("no binary");
        return this.URLAudio(this.toDataURL(binary));
    },
    parseHeader: function() {
        if (this.header) return;
        if (!this.binary) throw("no binary");
        var binary = this.binary;
        var dataAt = binary.indexOf('data');
        var header = binary.slice(0, dataAt + 4);
        var body = binary.slice(dataAt + 4, binary.length); // XXX
        this.header = header;
        this.body = body;
    },
    toDataURL: function(body) {
        return 'data:audio/wav;base64,' + base64encode(this.header + body);
    },
    beatDetect: function() {
        var i;
        if (!this.binary) throw("no binary");

        var beats = [];
        var powers = [];
        var sum = 0;
        var chunkSize = 3000;
        for(i = 0; i < this.body.length; i+=2) {
            var pi = Math.floor(i / chunkSize);
            if (!powers[pi]) powers[pi] = 0;
            var sample = this.sampleAt(i);
            powers[pi] += sample;
            sum += sample;
        }
        this.powers = powers;
        var average = sum / powers.length;
        var lastBeat = 0;
        var now = false;
        for(i = 0; i < powers.length; i++) {
            if (powers[i] > average) {
                now = true;
            } else {
                if (now) {
                    now = false;
                    beats.push(this.body.slice(lastBeat * chunkSize, i * chunkSize));
                    lastBeat = i;
                }
            }
        }
        this.beats = beats;
    },
    sampleAt: function(i) {
        return ((this.body.charCodeAt(i) & 0xff) <<8) + (this.body.charCodeAt(i+1) & 0xff);
    },
    randomBeats: function(length) {
        if (!length) length = 100;
        var buffer = '';
        for(var i = 0; i < length; i++) {
            buffer += this.beats[Math.floor(Math.random() * this.beats.length)];
        }
        return buffer;
    }
}
