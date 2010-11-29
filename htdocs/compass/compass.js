document.addEventListener('DOMContentLoaded', function() {
    init();
}, false);

function init() {
    var compass = document.querySelector('#compass');

    function plot(i) {
        compass.style.webkitTransform = 'rotate(' + i + 'deg)';
    };

    window.ondeviceorientation = function(event) {
        plot(event.alpha);
    };
}