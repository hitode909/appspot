$(function() {
  var $audio_b, $audio_c, $audio_d, $audio_e;
  $('button#a').mousedown(function() {
    var $audio;
    $audio = $('<audio>').attr({
      src: 'language.wav'
    });
    $('body').append($audio);
    $audio.bind('canplay', function() {
      return this.play();
    });
    return $audio.bind('ended', function() {
      return $(this).remove();
    });
  });
  $audio_b = null;
  $('button#b').mousedown(function() {
    if ($audio_b) {
      $audio_b.remove();
      $audio_b = null;
    }
    $audio_b = $('<audio>').attr({
      src: 'language.wav'
    });
    $('body').append($audio_b);
    $audio_b.bind('canplay', function() {
      return this.play();
    });
    return $audio_b.bind('ended', function() {
      $(this).remove();
      return $audio_b = null;
    });
  });
  $audio_c = null;
  $('button#c').mousedown(function() {
    $audio_c = $('<audio>').attr({
      src: 'language.wav',
      loop: true
    });
    $('body').append($audio_c);
    return $audio_c.bind('canplay', function() {
      return this.play();
    });
  });
  $('button#c').mouseup(function() {
    if ($audio_c) {
      $audio_c.remove();
      return $audio_c = null;
    }
  });
  $audio_d = null;
  $('button#d').mousedown(function() {
    if ($audio_d) {
      $audio_d[0].play();
      return;
    }
    $audio_d = $('<audio>').attr({
      src: 'language.wav',
      loop: true
    });
    $('body').append($audio_d);
    return $audio_d.bind('canplay', function() {
      return this.play();
    });
  });
  $('button#d').mouseup(function() {
    return $audio_d[0].pause();
  });
  $audio_e = null;
  $('button#e').mousedown(function() {
    if ($audio_e) {
      $audio_e[0].muted = false;
      return;
    }
    $audio_e = $('<audio>').attr({
      src: 'language.wav',
      loop: true
    });
    $('body').append($audio_e);
    return $audio_e.bind('canplay', function() {
      return this.play();
    });
  });
  return $('button#e').mouseup(function() {
    return $audio_e[0].muted = true;
  });
});