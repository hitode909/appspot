var newAudio = function(src_url) {
    var audio = jQuery("<audio>");
    audio.attr("src", src_url);
    jQuery("body").append(audio);
    return audio[0];
}

var Okyo = function() {
    var self = this;
    var okyo_url = self.okyo_list[Math.floor(Math.random() * self.okyo_list.length)];
    var audio_element = newAudio(okyo_url);

    setTimeout(function() {
        var rand = Math.random();
        if (rand < 0.1) {
            self.interval *= 2;
        } else if (rand < 0.2) {
            self.interval /= 2;
        } else if (rand < 0.3) {
            self.position = Math.random() * audio_element.duration;
        }

        audio_element.currentTime = self.position;
        audio_element.play();
        if (self.on_play) {
            self.on_play(self);
        }
        setTimeout(arguments.callee, self.interval);
    }, self.interval);

};

Okyo.prototype = {
    okyo_list: [
        'http://shofukuji.net/music/singyo2.mp3',
        'http://shofukuji.net/music/hakuin2.mp3',
        'http://shofukuji.net/music/daihisyu.mp3',
        'http://shofukuji.net/music/enmei.mp3'
    ],
    interval: 500,
    position: 0,
    on_play: null
};
