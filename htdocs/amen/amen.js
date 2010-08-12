$(function() {
    var canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var plotter = new Plotter(canvas);

    var play = function(that) {
        plotter.clear();
        var samples = that.randomBeats(20);
        that.playBinary(samples);


        var sampleVars = [];
        for(var i = 0; i < samples.length; i++) {
            sampleVars.push(samples.charCodeAt(i) & 0xff);
        }
        plotter.plot(sampleVars);
    };
    var wav = new WavFile('./amen_lq.wav', function(that) {
        that.beatDetect();
        play(that);

    }, function(that) {
        play(that);
    });
});
