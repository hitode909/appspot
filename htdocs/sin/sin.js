var Sin;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Sin = (function() {
  function Sin(container) {
    this.container = container;
    this.osc = T("sin", 400);
    this.load();
  }
  Sin.prototype.load = function() {
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
    return this.rangeTimer = setTimeout(__bind(function() {
      this.setRange();
      return this.rangeTimer = null;
    }, this), 500);
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
    if (val / max > 0.7) {
      input.attr('max', max * 2);
    }
    if (val / max < 0.3) {
      return input.attr('max', max / 2);
    }
  };
  return Sin;
})();
$(function() {
  var osc, oscs, timer;
  oscs = [];
  $('.osc').each(function() {
    var container;
    container = $(this);
    return oscs.push(new Sin(container));
  });
  timer = T("interval", 100, function() {
    var osc, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = oscs.length; _i < _len; _i++) {
      osc = oscs[_i];
      _results.push(osc.load());
    }
    return _results;
  });
  timer.on();
  return T.apply(window, ["+"].concat((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = oscs.length; _i < _len; _i++) {
      osc = oscs[_i];
      _results.push(osc.osc);
    }
    return _results;
  })())).play();
});