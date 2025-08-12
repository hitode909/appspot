"use strict";

var info    = null;
var samples = [];

onmessage = function(e) {
  var data = e.data;
  if (typeof data === "number") {
    process(data);
  } else if (data instanceof Float32Array) {
    samples.push(data);
  } else {
    info = data;
  }
};

var makeWindow = function(size) {
  var window = new Float32Array(size);
  for (var i = 0; i < size; ++i) {
    window[i] = Math.sin(Math.PI * (i / size));
  }
  return window;
};

var normalize = function(data, k) {
  for (var i = 0, imax = data.length; i < imax; i++) {
    data[i] *= k;
  }
};

var process = function(duration) {
  var sampleRate = info.sampleRate;
  var channels   = info.channels;
  var length     = info.length;
  var chunkSize  = 8192;
  var zoom   = duration / info.duration;
  var window = makeWindow(chunkSize);
  var data = new Float32Array(duration * sampleRate * channels);
  var sample, index, absval, absmax = 0;
  
  for (var i = 0; i < channels; ++i) {
    sample = samples[i];
    for (var j = 0; j < length; j += chunkSize) {
      index = ((j * zoom)|0) * channels + i;
      for (var k = 0; k < chunkSize; ++k) {
        data[index] += sample[j + k] * window[k];
        absval = Math.abs(data[index]);
        if (absmax < absval) {
          absmax = absval;
        }
        index += channels;
      }
    }
  }
  
  if (absmax) {
    normalize(data, 1 / absmax);
  }
  
  postMessage(data, [data.buffer]);
};
