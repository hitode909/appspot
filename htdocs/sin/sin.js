// Generated by CoffeeScript 1.4.0
var Music, Sin;

Music = (function() {

  function Music() {}

  Music.load = function() {
    var i, pitches;
    return pitches = (function() {
      var _i, _len, _ref, _results;
      _ref = location.hash.slice(1).split(',');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(+i);
      }
      return _results;
    })();
  };

  Music.save = function(oscs) {
    var hash;
    hash = '#' + this.serialize(oscs);
    if (hash !== (location.hash || '#')) {
      return location.hash = hash;
    }
  };

  Music.serialize = function(oscs) {
    var osc;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = oscs.length; _i < _len; _i++) {
        osc = oscs[_i];
        _results.push(osc.freq);
      }
      return _results;
    })()).join(',');
  };

  return Music;

})();

Sin = (function() {

  function Sin(container) {
    this.container = container;
    this.osc = T("sin", 400);
    this.bind();
    this.load();
    this.setRange();
  }

  Sin.prototype.bind = function() {
    var _this = this;
    return this.container.find('.kill').on('click', function() {
      _this.osc.pause();
      return _this.container.remove();
    });
  };

  Sin.prototype.alive = function() {
    return this.container.is(':visible');
  };

  Sin.prototype.load = function() {
    var _this = this;
    this.play();
    this.freq = +this.container.find('input').val();
    if (this.freq === this.lastFreq) {
      return;
    }
    this.lastFreq = this.freq;
    this.osc.freq = this.freq;
    this.container.find('.hz').text(this.freq);
    if (this.rangeTimer) {
      clearTimeout(this.rangeTimer);
    }
    return this.rangeTimer = setTimeout(function() {
      _this.setRange();
      return _this.rangeTimer = null;
    }, 500);
  };

  Sin.prototype.play = function() {
    return this.osc.play();
  };

  Sin.prototype.volume = function(v) {
    return this.osc.mul = v;
  };

  Sin.prototype.set = function(freq) {
    this.container.find('input').val(freq);
    return this.load();
  };

  Sin.prototype.setRange = function() {
    var input, max, min, val;
    input = this.container.find('input');
    min = +input.attr('min');
    max = +input.attr('max');
    val = +input.val();
    if (val === 0) {
      return;
    }
    while (val / max > 0.7) {
      max *= 2;
    }
    while (val / max < 0.3) {
      max /= 2;
    }
    input.attr('max', max);
    input.val(+input.val() + 1);
    return input.val(+input.val() - 1);
  };

  return Sin;

})();

$(function() {
  var add_sin, oscs, pitch, pitches, timer, _i, _len;
  oscs = [];
  add_sin = function(pitch) {
    var $new_container, $pitch, max;
    $new_container = $('.osc:last')[0] ? $('.osc:last').clone() : $($.parseHTML($('#osc-template').html()));
    $pitch = $new_container.find('input[name="pitch"]');
    max = +$pitch.attr('max');
    pitch = pitch ? pitch : $pitch.val() * 1.1;
    while (pitch / max > 0.7) {
      max *= 2;
    }
    $pitch.attr('max', max);
    $pitch.val(pitch);
    $('.oscs').append($new_container);
    return oscs.push(new Sin($new_container));
  };
  pitches = Music.load();
  if (pitches.length > 0) {
    for (_i = 0, _len = pitches.length; _i < _len; _i++) {
      pitch = pitches[_i];
      add_sin(pitch);
    }
  } else {
    add_sin();
  }
  timer = T("interval", 50, function() {
    var osc, _j, _len1;
    oscs = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = oscs.length; _j < _len1; _j++) {
        osc = oscs[_j];
        if (osc.alive()) {
          _results.push(osc);
        }
      }
      return _results;
    })();
    for (_j = 0, _len1 = oscs.length; _j < _len1; _j++) {
      osc = oscs[_j];
      osc.load();
    }
    return Music.save(oscs);
  });
  $('.add').click(function() {
    return add_sin();
  });
  timer.on();
  return $('.share').click(function() {
    return window.open("https://twitter.com/share?" + $.param({
      url: location.href,
      text: "曲できた"
    }));
  });
});
