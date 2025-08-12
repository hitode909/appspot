var getArgs, render, save;
getArgs = function() {
  var args;
  return args = {
    strokeWeight: +$('#stroke-weight').val(),
    radiusDiff: +$('#radius-diff').val(),
    radianDiff: +$('#radian-diff').val(),
    radiusNoiseDiff: +$('#radius-noise-diff').val()
  };
};
render = function(processing) {
  processing.setup = function() {
    processing.size(500, 500);
    return processing.frameRate(12);
  };
  return processing.draw = function() {
    var args, center, currentRadius, currentX, currentY, lastX, lastY, radian, radius, radiusNoiseTime, time, _results;
    center = {
      x: processing.width / 2,
      y: processing.height / 2
    };
    args = getArgs();
    processing.background(255);
    processing.stroke(255, 0, 0);
    processing.smooth();
    processing.strokeWeight(args.strokeWeight * 10);
    lastX = null;
    lastY = null;
    radian = 0.0;
    radius = 1.0;
    radiusNoiseTime = 0.0;
    time = 0;
    currentRadius = 0;
    _results = [];
    while (++time < 5000 && Math.abs(currentRadius) < Math.abs(center.x)) {
      radius += args.radiusDiff;
      radian += args.radianDiff;
      radiusNoiseTime += args.radiusNoiseDiff;
      currentRadius = radius * processing.noise(radiusNoiseTime);
      currentX = center.x + Math.sin(radian) * currentRadius;
      currentY = center.y + Math.cos(radian) * currentRadius;
      if (lastX && lastY) {
        processing.line(lastX, lastY, currentX, currentY);
      }
      lastX = currentX;
      _results.push(lastY = currentY);
    }
    return _results;
  };
};
save = function() {
  var dataURL;
  dataURL = $('#screen').get(0).toDataURL();
  return $.ajax({
    async: false,
    type: 'POST',
    url: '/png/',
    data: {
      data: dataURL
    }
  }).done(function(tinyURL) {
    return window.open("https://twitter.com/share?" + $.param({
      url: 'http://hitode909.appspot.com/2013/',
      text: "謹賀新年 " + tinyURL
    }));
  });
};
$(function() {
  new Processing($('#screen').get(0), render);
  return $('#save').click(function() {
    return save();
  });
});