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
        if (!this.binary) throw("no binary!!!!!!!!!!!!");
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
    }

}
