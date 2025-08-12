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
    return Math.floor(Math.random() * max);
  };
  setColor = function() {
    return document.body.style.background = "hsl(" + (rand(360)) + ", 100%, 50%)";
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