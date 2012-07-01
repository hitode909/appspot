var InputHistory;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
InputHistory = (function() {
  function InputHistory(name) {
    this.name = name;
    this.key = "InputHistory-" + this.name;
    this.history = [];
    this._loadHistory();
  }
  InputHistory.prototype.get = function() {
    return this.history;
  };
  InputHistory.prototype.last = function() {
    return this.history[this.history.length - 1];
  };
  InputHistory.prototype.add = function(value) {
    this.history.push({
      time: (new Date).getTime(),
      value: value
    });
    return localStorage[this.key] = JSON.stringify(this.history);
  };
  InputHistory.prototype.clear = function() {
    delete localStorage[this.key];
    return this.history = [];
  };
  InputHistory.prototype._loadHistory = function() {
    var item, parsed, stored, _i, _len;
    stored = localStorage[this.key];
    if (stored == null) {
      return;
    }
    try {
      parsed = JSON.parse(stored);
      for (_i = 0, _len = parsed.length; _i < _len; _i++) {
        item = parsed[_i];
        if (item.time == null) {
          throw 'time required';
        }
        if (item.value == null) {
          throw 'value required';
        }
      }
      return this.history = parsed;
    } catch (error) {
      clear();
    }
  };
  return InputHistory;
})();
$.fn.extend({
  watchValue: function() {
    var input, last_value, revision, start, stop, timer;
    input = this;
    last_value = input.val();
    timer = null;
    revision = 0;
    start = __bind(function() {
      stop();
      return timer = setInterval(__bind(function() {
        var current_value;
        current_value = input.val();
        if (current_value !== last_value) {
          last_value = current_value;
          return input.trigger('change');
        }
      }, this), 100);
    }, this);
    stop = __bind(function() {
      if (!timer) {
        return;
      }
      clearInterval(timer);
      return timer = null;
    }, this);
    input.on('focus', function() {
      return start();
    });
    return input.on('blur', function() {
      return stop();
    });
  },
  logify: function(name) {
    var history, history_container, input, item, line, reset, _i, _len, _ref;
    input = this;
    input.watchValue();
    history = new InputHistory(name);
    history_container = $('<ul>');
    history_container.addClass('logify-history');
    input.after(history_container);
    line = function(item) {
      var history_item;
      history_item = $('<li>');
      history_item.addClass('logify-item');
      history_item.attr({
        'data-value': item.value,
        'data-time': item.time,
        title: "" + (new Date(item.time)) + "\n" + item.value
      });
      history_item.text(item.value);
      return history_container.prepend(history_item);
    };
    _ref = history.get();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      line(item);
    }
    input.on('change', function() {
      var value, _ref2;
      value = input.val();
      if (value !== ((_ref2 = history.last()) != null ? _ref2.value : void 0)) {
        history.add(value);
        return line(history.last());
      }
    });
    history_container.on('click', '.logify-item', function() {
      return input.val($(this).attr('data-value')).change();
    });
    reset = $('<button>');
    reset.text('履歴をクリア');
    input.after(reset);
    return reset.click(function() {
      history.clear();
      return history_container.empty();
    });
  }
});
$(function() {
  return $('textarea, input').each(function() {
    return $(this).logify($(this).attr('id'));
  });
});