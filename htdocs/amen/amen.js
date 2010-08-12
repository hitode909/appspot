$(function() {
    console.log(1);
    var wav = new WavFile('./amen_lq.wav', function(that) {
        console.log('ok');
        that.playUrl(that.toDataURL(that.body));
    });
});
