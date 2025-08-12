window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
$(function() {
  var animationLoop, rand, setColor;
  rand = function(max) {
    if (Math.random() > 0.5) {
      return 255;
    } else {
      return 0;
    }
  };
  setColor = function() {
    return document.body.style.background = "rgb(" + (rand()) + ", " + (rand()) + ", " + (rand()) + ")";
  };
  animationLoop = function() {
    setColor();
    return window.requestAnimationFrame(animationLoop);
  };
  animationLoop();
  return $(document.body).click(function() {
    return window.requestAnimationFrame = function(callback, element) {
      return window.setTimeout(function() {
        return callback();
      }, 1000 / 6);
    };
  });
});