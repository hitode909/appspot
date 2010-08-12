// glitchmonkey
function load_binary_resource(url) {
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  //XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  req.overrideMimeType('text/plain; charset=x-user-defined');
  req.send(null);
  if (req.status != 200) return '';
  return req.responseText;
}

function base64encode(data) {
  return btoa(data.replace(/[\u0100-\uffff]/g, function(c) {
    return String.fromCharCode(c.charCodeAt(0) & 0xff);
  }));
}

// ------------------------------------------------

WavFile = function(url, ok) {
    console.log(url);
    this.url = url;
    this.ok = ok;
    var self = this;
    this.binary = load_binary_resource(url);
    this.parseHeader();
};

WavFile.prototype = {
    playBinary: function(binary) {
        this.playUrl(this.toDataURL(binary));
    },
    playUrl: function(url) {
        if (!url) url = this.url;
        var $audio = $('<audio>').attr({ src: url});
        $('body').append($audio);
        $audio.bind('canplay', function(){
            console.log('play');
            this.play()
        });

        $audio.bind('ended', function(){
            console.log('remove');
            $(this).remove()
        });
        return $audio;
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
        if (this.ok) this.ok(this);
    },
    toDataURL: function(body) {
        return 'data:audio/wav;base64,' + base64encode(this.header + body);
    },
    beatDetect: function() {
        var i;
        if (!this.binary) throw("no binary");
        console.log('beat detecting');

        var beats = [];
        var powers = [];
        var sum = 0;
        var chunkSize = 500;
        for(i = 0; i < this.body.length; i++) {
            var pi = Math.floor(i / chunkSize);
            if (!powers[pi]) powers[pi] = 0;
            powers[pi] += this.sampleAt(i);
            sum += this.sampleAt(i);
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
        console.log(beats.length);
        this.beats = beats;
    },
    sampleAt: function(i) {
        return (this.body.charCodeAt(i) & 0xff);
    },
    randomBeats: function(length) {
        if (!length) length = 100;
        var buffer = '';
        for(var i = 0; i < length; i++) {
            buffer += this.beats[Math.floor(Math.random() * this.beats.length)];
        }
        console.log(buffer.length);
        return buffer;
    }
}
