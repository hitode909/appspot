(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Filter, main;

window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();

Filter = (function() {
  function Filter(canvas1, width1, height1) {
    this.canvas = canvas1;
    this.width = width1;
    this.height = height1;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
  }

  Filter.prototype.process = function(image, width, height, cb) {
    var existing;
    existing = this.ctx.getImageData(0, 0, this.width - 1, this.height);
    this.ctx.putImageData(existing, 1, 0);
    return this.ctx.drawImage(image, Math.floor(this.width / 2), 0, 1, height, 0, 0, 1, this.height);
  };

  Filter.prototype.getURL = function() {
    return this.canvas.toDataURL();
  };

  return Filter;

})();

main = function() {
  var animationLoop, canvas, error, filter, process, success, video;
  video = document.querySelector('#video');
  canvas = document.querySelector('#canvas-screen');
  filter = null;
  process = function() {
    var scale;
    if (!video.videoWidth) {
      return;
    }
    if (!filter) {
      scale = 1;
      filter = new Filter(canvas, video.videoWidth * scale, video.videoHeight * scale);
    }
    return filter.process(video, video.videoWidth, video.videoHeight);
  };
  success = function(stream) {
    video = document.querySelector('#video');
    video.src = window.URL.createObjectURL(stream);
    return video.play();
  };
  error = function() {
    return alert('error');
  };
  if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({
      video: true
    }, success, error);
  } else {
    navigator.mozGetUserMedia({
      video: true
    }, success, error);
  }
  animationLoop = function() {
    process();
    return window.requestAnimationFrame(animationLoop);
  };
  animationLoop();
  return canvas.addEventListener('click', function() {
    var new_img;
    new_img = document.createElement('img');
    new_img.src = filter.getURL();
    return document.body.appendChild(new_img);
  });
};

main();


},{}]},{},[1]);
