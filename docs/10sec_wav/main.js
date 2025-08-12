$(function() {
  "use strict";
  
  var URL               = window.URL || window.webkitURL;
  var AudioContext      = window.AudioContext || window.webkitAudioContext;
  var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  var duration = 10;
  
  if (!(URL && AudioContext && requestFileSystem)) {
    $("#result").empty().text("Please use Chrome");
    return;
  }
  
  $(window).on("dragover", function() {
    return false;
  }).on("drop", function(e) {
    main(e.originalEvent.dataTransfer.files);
    return false;
  });
  
  var process = function(binary) {
    var dfd = $.Deferred();
    var context = new AudioContext();
    var buffer  = context.createBuffer(binary, false);
    var worker  = new Worker("worker.js");
    var data = {
      sampleRate: buffer.sampleRate,
      channels  : buffer.numberOfChannels,
      duration  : buffer.duration,
      length    : buffer.length
    };
    worker.postMessage(data);
    for (var i = 0; i < buffer.numberOfChannels; ++i) {
      var samples = buffer.getChannelData(i)
      worker.postMessage(samples, [samples.buffer]);
    }
    worker.postMessage(duration);
    worker.onmessage = function(e) {
      data.samples = e.data;
      dfd.resolve(data);
    };
    return dfd.promise();
  };
  
  var read = function(files) {
    var dfd = $.Deferred();
    var result = [];
    var $li = new Array(files.length);
    for (var i = 0; i < $li.length; ++i) {
      $li[i] = $("<li>").text(files[i].name).css({color:"#95a5a6"}).appendTo($("#list"));
    } 

    var loop = function() {
      var index = result.length;
      var file  = files[index];
      if (file) {
        $li[index].css({color:"#f1c40f"});
        var reader = new FileReader();
        reader.onload = function(e) {
          result.push(process(e.target.result).then(function(result) {
            $li[index].css({color:"#2ab966"});
            return result;
          }));
          loop();
        };
        reader.readAsArrayBuffer(file);
      } else {
        dfd.resolve(result);
      }
      return dfd.promise();
    };
    return loop().promise()
  };

  var make = function() {
    var dfd = $.Deferred();
    var audio = [].slice.call(arguments);
    if (audio.length) {
      var writer = new WavStreamWriter();
      writer.sampleRate = audio[0].sampleRate;
      writer.channels   = audio[0].channels;
      for (var i = 0; i < audio.length; ++i) {
        writer.write(audio[i].samples)
      }
      writer.flush("out.wav", function(err, path) {
        dfd.resolve(path);
      });
    }
    return dfd.promise();
  };
  
  var main = function(files) {
    $("#list").empty();
    read(files).then(function(list) {
      $("#result").text("processing...");
      $.when.apply(null, list).then(make).then(function(path) {
        $("#result").empty().append(
          $("<a>").attr({href:path, download:"out"}).css({color:"#2980b9"}).text("download")
        );
      });
    });
    $("#result").empty();
  };

});
