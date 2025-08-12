(function() {
  var Nagameru, NagameruView, Tapper, decodeParam;

  Nagameru = (function() {
    function Nagameru(name) {
      this.name = name;
    }

    Nagameru.prototype.fetch = function() {
      var API_KEY, LIMIT, crawl, received;
      received = $.Deferred();
      API_KEY = 'uFWEhQ88W0vkFQ6c5lpya5uWlFQ2AXUYL4yrQzXNsmUeD6qVQO';
      LIMIT = 20;
      crawl = (function(_this) {
        return function(offset) {
          var req;
          console.log("fetch from " + offset);
          req = $.ajax({
            type: 'get',
            dataType: 'jsonp',
            url: "http://api.tumblr.com/v2/blog/" + _this.name + ".tumblr.com/posts",
            data: {
              api_key: API_KEY,
              type: 'photo',
              limit: LIMIT,
              offset: offset
            }
          });
          return req.done(function(res) {
            received.notify(res.response.posts);
            if (offset < 200) {
              return crawl(offset + LIMIT);
            }
          });
        };
      })(this);
      crawl(0);
      return received.promise();
    };

    return Nagameru;

  })();

  NagameruView = (function() {
    function NagameruView($container) {
      this.$container = $container;
      this.$stage = $container.find('.js-stage');
      this.$pool = $container.find('.js-pool');
      this.$loopFrom = $container.find('.js-loop-from');
      this.$loopSize = $container.find('.js-loop-size');
      this.$shuffle = $container.find('.js-shuffle');
      this.$photos = [];
      this.index = 0;
    }

    NagameruView.prototype.loadPost = function(post) {
      var $img;
      $img = $('<img>');
      $img.attr('src', post.photos[0].original_size.url);
      return $img.on('load', (function(_this) {
        return function() {
          _this.$photos.push($img);
          return _this.$pool.append($img);
        };
      })(this));
    };

    NagameruView.prototype.step = function() {
      var $photo, from, to;
      if (this.$shuffle.prop('checked')) {
        this.index = Math.floor(this.$photos.length * Math.random());
      } else {
        from = Math.floor(this.$photos.length * parseFloat(this.$loopFrom.val()));
        to = Math.floor(this.$photos.length * (parseFloat(this.$loopFrom.val()) + parseFloat(this.$loopSize.val())));
        this.index++;
        if (this.index < from) {
          this.index = from;
        }
        if (this.index > to) {
          this.index = from;
        }
        if (this.index >= this.$photos.length) {
          this.index -= this.$photos.length;
        }
        if (this.index < 0) {
          this.index = 0;
        }
      }
      $photo = this.$photos[this.index];
      if ($photo) {
        return this.$stage.css('background-image', "url(" + ($photo.attr('src')) + ")");
      }
    };

    return NagameruView;

  })();

  Tapper = (function() {
    function Tapper($container) {
      this.$container = $container;
      this.$speedInput = $container.find('.js-speed');
      this.step = 500;
      this.times = [];
      this.tapMax = 4;
      this.$$highSpeed = $('.js-high-speed');
      this.tap();
    }

    Tapper.prototype.tap = function() {
      $(this).triggerHandler('tap');
      this.pause();
      this.step = this.$speedInput.val();
      return this.timer = setTimeout((function(_this) {
        return function() {
          return _this.tap();
        };
      })(this), this.step);
    };

    Tapper.prototype.pause = function() {
      if (this.timer) {
        return clearTimeout(this.timer);
      }
    };

    Tapper.prototype.click = function() {
      this.times.push(Date.now());
      if (this.times.length > this.tapMax) {
        this.times.shift();
      }
      this.updateStep();
      return this.tap();
    };

    Tapper.prototype.updateStep = function() {
      var diff, prev, time, total, _i, _len, _ref;
      if (!(this.times.length > 1)) {
        return;
      }
      prev = this.times[0];
      total = 0;
      _ref = this.times;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        time = _ref[_i];
        diff = time - prev;
        total += diff;
        prev = time;
      }
      this.step = total / (this.times.length - 1);
      return this.$speedInput.val(this.step);
    };

    return Tapper;

  })();

  decodeParam = function (data) {
    var params = {};
    var values = data.split('&');
    for (var i = 0, len = values.length; i < len; i++) {
        if (!values[i].match(/[=]/)) continue;
        var kv = values[i].split('=');
        var key = decodeURIComponent(kv[0]);
        var val = kv[1].replace(/\+/g, ' ');
        if (!params[key]) params[key] = [];
        params[key].push(decodeURIComponent(val));
    }
   return params;
};;

  $(function() {
    var ng, ngview, params, tapper;
    params = decodeParam(location.search.slice(1));
    if (!params.user) {
      params.user = 'hitode909';
    }
    console.log(params.user);
    ng = new Nagameru(params.user);
    ngview = new NagameruView($(document.body));
    tapper = new Tapper($(document.body));
    ng.fetch().progress(function(posts) {
      var post, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        _results.push(ngview.loadPost(post));
      }
      return _results;
    });
    $('.js-stage').on('mousedown', function() {
      return tapper.click();
    });
    return ($(tapper)).on('tap', function() {
      return ngview.step();
    });
  });

}).call(this);
