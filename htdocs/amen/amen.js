$(function() {
    console.log(1);
    var wav = new WavFile('./amen_lq.wav', function(that) {
        console.log('ok');
        that.beatDetect();
        // var i = 0;
        // setTimeout(function() {
        //     that.playUrl(that.toDataURL(that.beats[i]));
        //     i++;
        //     if (that.beats[i]) {
        //         setTimeout(arguments.callee, 500);
        //     }
        // }, 500);

        that.playBinary(that.randomBeats());
    });
});
