(function() {
  var audio1, play_with_position, step, step_timer, tape, tapes;

  audio1 = T("audio", {
    loop: true
  }).load("shower.wav");

  tape = null;

  tapes = [];

  step_timer = null;

  audio1.done(function(result) {
    tape = T("tape", {
      tape: this
    }).tape;
    return step();
  });

  step = function() {
    var position, slice, speed, t, tracks;
    document.querySelector('#position').max = tape.duration();
    position = +document.querySelector('#position').value;
    document.querySelector('#position').max = tape.duration();
    speed = +document.querySelector('#speed').value;
    slice = +document.querySelector('#slice').value;
    tracks = +document.querySelector('#tracks').value;
    position += speed / 10;
    if (position > tape.duration()) {
      position -= tape.duration();
    }
    while (position < 0) {
      position += tape.duration();
    }
    tapes = tapes.concat(play_with_position(tape, position));
    while (true) {
      if (tapes.length <= tracks) {
        break;
      }
      t = tapes.shift();
      t.tape.pause().remove();
    }
    document.querySelector('#position').value = position;
    if (step_timer) {
      clearTimeout(step_timer);
    }
    return step_timer = setTimeout(function() {
      return step();
    }, slice);
  };

  play_with_position = function(tape, position) {
    var duration, duration_noise, imgs, piece, pitch, pitch_noise, position_noise, start_position, t, tape_duration;
    tapes = [];
    imgs = [];
    tape_duration = tape.duration();
    duration = +document.querySelector('#duration').value;
    duration_noise = +document.querySelector('#duration_noise').value;
    position_noise = +document.querySelector('#position_noise').value;
    pitch = +document.querySelector('#pitch').value;
    pitch_noise = +document.querySelector('#pitch_noise').value;
    start_position = position + (Math.random() - 0.5) * position_noise;
    while (start_position < 0) {
      start_position += tape_duration;
    }
    while (start_position > tape_duration) {
      start_position -= tape_duration;
    }
    duration = duration * (1 + (Math.random() - 0.5) * duration_noise);
    piece = tape.slice(start_position, duration).pitch(pitch + (Math.random() * pitch_noise));
    t = T("tape", {
      tape: piece,
      loop: true
    });
    t.play();
    tapes.push({
      tape: t,
      start: start_position,
      duration: duration
    });
    return tapes;
  };

  document.querySelector('#position').onchange = step;

}).call(this);
