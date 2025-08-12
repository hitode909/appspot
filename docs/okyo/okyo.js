$(function() {
    var okyo = new Okyo;
    var samples = [];
    for (var i = 0;i < 8; i++) {
        samples.push(HTML909.prototype.samples[Math.floor(Math.random() * HTML909.prototype.samples.length)]);
    }
    okyo.on_play = function() {
        (new HTML909).play(samples[Math.floor(Math.random() * samples.length)], 0.5);
    };
});
