window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
$(function() {
  var animationLoop, error, process, success;
  process = function() {
    var canvas, ctx, imagedata, video;
    canvas = $('canvas')[0];
    video = $('video')[0];
    ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    imagedata = ctx.getImageData(Math.floor(canvas.width * Math.random()), Math.floor(canvas.height * Math.random()), 1, 1);
    return document.body.style.background = "rgb(" + imagedata.data[0] + ", " + imagedata.data[1] + ", " + imagedata.data[2] + ")";
  };
  success = function(stream) {
    var video;
    video = $('video')[0];
    video.src = window.webkitURL.createObjectURL(stream);
    return video.play();
  };
  error = function() {
    return alert('error');
  };
  navigator.webkitGetUserMedia({
    video: true
  }, success, error);
  animationLoop = function() {
    process();
    return window.requestAnimationFrame(animationLoop);
  };
  return animationLoop();
});