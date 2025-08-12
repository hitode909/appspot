function plot(data) {
    for (var axis in data) if (data.hasOwnProperty(axis)) {
        var val = data[axis];
        var elem = document.querySelector('#' + axis);

        if (val > 0) {
            elem.style.width = data[axis] * 20;
            elem.style.marginLeft = 320;
        } else {
            elem.style.width = data[axis] * -20;
            elem.style.marginLeft = 320 + data[axis] * 20;
        }
    }
};

window.ondevicemotion = function(event) {
    plot(event.accelerationIncludingGravity);
};

window.ondeviceorientation = function(event) {
    var data = {
        alpha: event.alpha / 10,
        beta: event.beta / 10,
        gamma: event.gamma / 10
    };
    plot(data);
};
