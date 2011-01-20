$(function() {
    var okyo = new Okyo;
    okyo.on_play = function() {
        (new HTML909).play(HTML909.prototype.samples[Math.floor(Math.random() * HTML909.prototype.samples.length)], 0.5)
    };
});
