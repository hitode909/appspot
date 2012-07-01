var Sin;
Sin = (function() {
  function Sin(container) {
    this.container = container;
    this.osc = T("sin", 400);
    this.load();
  }
  Sin.prototype.load = function() {
    this.freq = +this.container.find('input').val();
    this.osc.freq = this.freq;
    return this.container.find('.hz').text(this.freq);
  };
  Sin.prototype.set = function(freq) {
    this.container.find('input').val(freq);
    return this.load();
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