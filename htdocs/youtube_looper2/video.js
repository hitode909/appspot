var Gallery, Page, YoutubeLooper, YoutubeSearcher, bindLoadVideoFormEvents, bindLoopControllerEvents, setTweetLink, setup, setupPopState, setupSaveLoop, setupSearch, setupSelectOnClick, setupUrlShare;
Page = {
  parseQuery: function(query_string) {
    var k, pair, query, v, _i, _len, _ref, _ref2;
    query = {};
    _ref = query_string.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      _ref2 = pair.split('='), k = _ref2[0], v = _ref2[1];
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return query;
  },
  createQuery: function(query) {
    var key, keys;
    keys = ((function() {
      var _results;
      _results = [];
      for (key in query) {
        _results.push(key);
      }
      return _results;
    })()).sort();
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push("" + (encodeURIComponent(key)) + "=" + (encodeURIComponent(query[key])));
      }
      return _results;
    })()).join('&');
  },
  createURL: function(query) {
    var module;
    module = this;
    return location.protocol + '//' + location.host + location.pathname + '?' + module.createQuery(query);
  }
};
YoutubeLooper = {
  ready: false,
  player: null,
  players: [],
  activePlayer: null,
  waitingPlayer: null,
  playerLoaded: false,
  seekToPosition: 5,
  seekDuration: 1.0,
  playingVideoId: null,
  playingVideoUrl: null,
  knowDuration: false,
  seekPositionChanged: false,
  setup: function() {
    var module;
    module = this;
    if (module.ready) {
      return;
    }
    module.setupLoop();
    window.onYouTubePlayerReady = function(playerId) {
      return module.onYouTubePlayerReady(playerId);
    };
    module.loadPlayer('player1');
    module.loadPlayer('player2');
    return module.ready = true;
  },
  setSeekToPosition: function(sec) {
    var module;
    module = this;
    module.seekToPosition = Math.floor(+sec * 10) / 10;
    $(module).trigger('loopSetChanged');
    if (module.waitingPlayer) {
      module.waitingPlayer.seekTo(module.seekToPosition, true);
      return module.waitingPlayer.pauseVideo();
    }
  },
  setSeekDuration: function(sec) {
    var module;
    module = this;
    module.seekDuration = Math.floor(+sec * 100) / 100;
    return $(module).trigger('loopSetChanged');
  },
  setupLoop: function() {
    var module, playerIndex;
    module = this;
    playerIndex = 0;
    return _.defer(function() {
      var doAfter, from, player1, player2;
      from = Date.now();
      doAfter = 500;
      if (module.playerLoaded) {
        if (!module.knowDuration && module.player.getVideoUrl() !== module.playingVideoUrl && module.player.getDuration() > 0) {
          module.knowDuration = true;
          $(module).trigger('videoDurationChanged', module.player.getDuration());
          module.playingVideoUrl = module.player.getVideoUrl();
        }
        if (module.player.getPlayerState() !== 3 && module.allPlayersLoaded()) {
          playerIndex++;
          player1 = module.players[playerIndex % 2];
          player2 = module.players[(playerIndex + 1) % 2];
          module.activePlayer = player1;
          module.waitingPlayer = player2;
          if (module.seekPositionChanged) {
            console.log('more seek');
            module.seekPositionChanged = false;
            player1.seekTo(module.seekToPosition, true);
          }
          player1.playVideo();
          player2.pauseVideo();
          _.defer(function() {
            player1.style.visibility = 'visible';
            player2.style.visibility = 'hidden';
            player2.seekTo(module.seekToPosition, true);
            return player2.pauseVideo();
          });
          doAfter = module.seekDuration * 1000;
        } else {
          console.log('wait');
        }
      }
      console.log('took', Date.now() - from);
      return setTimeout(arguments.callee, doAfter);
    });
  },
  onYouTubePlayerReady: function(playerId) {
    var module, player;
    module = this;
    console.log("ready " + playerId);
    module.playerLoaded = true;
    player = document.getElementById(playerId);
    player.addEventListener('onError', "YoutubeLooper.onPlayerError");
    module.players.push(player);
    module.player = player;
    if (module.allPlayersLoaded()) {
      console.log("all players loaded");
      if (module.playingVideoId) {
        return module.playVideoById(module.playingVideoId);
      }
    }
  },
  allPlayersLoaded: function() {
    var module;
    module = this;
    return module.players.length === 2;
  },
  onPlayerStateChange: function(event) {},
  onPlayerError: function(event) {
    return $('.error').text("event error " + event);
  },
  playVideoById: function(videoId) {
    var module;
    module = this;
    if (!module.playerLoaded) {
      module.playingVideoId = videoId;
      return;
    }
    console.log("load " + videoId);
    module.knowDuration = false;
    module.eachPlayers(function(p) {
      p.stopVideo();
      return p.cueVideoById(videoId, module.seekToPosition);
    });
    module.playingVideoId = videoId;
    return $(module).trigger('loopSetChanged');
  },
  loadPlayer: function(playerId) {
    var attrs, params;
    params = {
      allowScriptAccess: 'always'
    };
    attrs = {
      id: playerId
    };
    return swfobject.embedSWF("http://gdata.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=" + playerId, playerId, "640", "360", "8", null, null, params, attrs);
  },
  eachPlayers: function(job) {
    var module, player, _i, _len, _ref, _results;
    module = this;
    _ref = module.players;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      player = _ref[_i];
      _results.push(job(player));
    }
    return _results;
  },
  loadQuery: function(query) {
    var module;
    module = this;
    query = Page.parseQuery(query ? query : location.search.slice(1));
    console.log(query);
    if (query.start && +query.start >= 0) {
      $('#loop-from').attr('max', 999).val(query.start).trigger('change');
    }
    if (query.duration && +query.duration > 0) {
      $('#loop-duration').val(query.duration).trigger('change');
    }
    if (query.video) {
      return module.playVideoById(query.video);
    }
  }
};
YoutubeSearcher = {
  searchVideo: function(query) {
    var dfd, module;
    module = this;
    dfd = $.Deferred();
    $.ajax({
      url: 'http://gdata.youtube.com/feeds/api/videos',
      data: {
        q: query,
        alt: 'json-in-script',
        format: 5,
        v: 2
      },
      dataType: 'jsonp'
    }).success(function(res) {
      var video_data;
      console.log(res.feed.entry);
      return dfd.resolve((function() {
        var _i, _len, _ref, _results;
        _ref = res.feed.entry;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          video_data = _ref[_i];
          _results.push(new module.Video(video_data));
        }
        return _results;
      })());
    });
    return dfd.promise();
  }
};
YoutubeSearcher.Video = (function() {
  function Video(data) {
    this.data = data;
  }
  Video.prototype.videoId = function() {
    return this.data.media$group.yt$videoid.$t;
  };
  Video.prototype.title = function() {
    return this.data.title.$t;
  };
  Video.prototype.duration = function() {
    return this.data.media$group.media$duration.$t;
  };
  Video.prototype.thumbnailUrl = function() {
    return this.data.media$group.media$thumbnail[0].url;
  };
  return Video;
})();
YoutubeSearcher.Loop = (function() {
  function Loop(data) {
    this.data = data;
  }
  Loop.prototype.isValid = function() {
    return (this.data.video != null) && (this.data.start != null) && +this.data.start >= 0 && (this.data.duration != null) && +this.data.duration >= 0;
  };
  Loop.prototype.videoId = function() {
    return this.data.video;
  };
  Loop.prototype.query = function() {
    return Page.createQuery(this.data);
  };
  Loop.prototype.url = function() {
    return Page.createURL(this.data);
  };
  Loop.prototype.thumbnailUrl = function() {
    return "http://img.youtube.com/vi/" + (this.videoId()) + "/0.jpg";
  };
  return Loop;
})();
Gallery = {
  validate: function(v) {
    var query;
    query = Page.parseQuery(v);
    return (query.video != null) && (query.start != null) && +query.start >= 0 && (query.duration != null) && +query.duration >= 0;
  },
  cache: null,
  clearCache: function() {
    var module;
    module = this;
    return module.cache = null;
  },
  receive: function() {
    var dfd, module;
    module = this;
    dfd = $.Deferred();
    if (module.cache) {
      console.log('cache hit');
      dfd.resolve(module.cache);
      return dfd.promise();
    }
    $.ajax({
      type: 'get',
      url: 'http://gigaschema.appspot.com/hitode909/youtube_loop.json',
      success: function(res) {
        var item, items;
        items = (function() {
          var _i, _len, _ref, _results;
          _ref = res.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            _results.push(new YoutubeSearcher.Loop(Page.parseQuery(item.value)));
          }
          return _results;
        })();
        module.cache = _.filter(items, function(item) {
          return item.isValid();
        });
        return dfd.resolve(module.cache);
      }
    });
    return dfd.promise();
  },
  post: function(video, start, duration) {
    var dfd, module, query;
    module = this;
    dfd = $.Deferred();
    query = Page.createQuery({
      video: video,
      start: start,
      duration: duration
    });
    module.receive().then(function(items) {
      var duplicate;
      duplicate = _.find(items, function(item) {
        return item.query() === query;
      });
      if (duplicate) {
        dfd.reject();
        return;
      }
      return $.ajax({
        type: 'post',
        url: 'http://gigaschema.appspot.com/hitode909/youtube_loop.json',
        data: {
          value: query,
          api_key: '094296d4fa1fc69200be31ba007b350c0afb2a5c'
        },
        complete: function(res) {
          return dfd.resolve();
        }
      });
    });
    return dfd.promise();
  },
  setupRecentLoops: function() {
    var module, template;
    module = this;
    template = _.template($('#recent-gallery-item-template').text());
    return module.receive().then(function(items) {
      var item, tags, _i, _len;
      tags = '';
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        tags += template({
          loop: item
        });
      }
      return $("#recent-loops").empty().append(tags);
    });
  },
  setupRecentLoopsClick: function() {
    return $('#recent-loops').on('click', '.loop', function(event) {
      var query;
      query = $(this).attr('data-query');
      history.pushState(query, query, '?' + query);
      YoutubeLooper.loadQuery(query);
      return false;
    });
  }
};
bindLoopControllerEvents = function() {
  $(document.body).on('change', '#loop-from', _.throttle(function() {
    var min, pos, sec1, sec2;
    console.log('change');
    YoutubeLooper.setSeekToPosition($('#loop-from').val());
    pos = YoutubeLooper.seekToPosition;
    min = Math.floor(pos / 60);
    if (min < 10) {
      min = "0" + min;
    }
    sec1 = Math.floor(pos % 60);
    if (sec1 < 10) {
      sec1 = "0" + sec1;
    }
    sec2 = Math.floor((pos * 10) % 10);
    return $('#loop-from-value').text("" + min + ":" + sec1 + "." + sec2);
  }, 100));
  $(document.body).on('change', '#loop-duration', _.throttle(function() {
    console.log('change');
    YoutubeLooper.setSeekDuration($('#loop-duration').val());
    return $('#loop-duration-value').text(YoutubeLooper.seekDuration);
  }, 100));
  $(YoutubeLooper).on('videoDurationChanged', function(event, duration) {
    console.log('videoDurationChanged', duration);
    return $('#loop-from').attr({
      max: duration
    });
  });
  $(document.body).on('click', 'button#position-left', function() {
    return $('#loop-from').val(+$('#loop-from').val() - 0.1).trigger('change');
  });
  $(document.body).on('click', 'button#position-right', function() {
    return $('#loop-from').val(+$('#loop-from').val() + 0.1).trigger('change');
  });
  $(document.body).on('click', 'button#position-left-loop', function() {
    return $('#loop-from').val(+$('#loop-from').val() - (+$('#loop-duration').val())).trigger('change');
  });
  $(document.body).on('click', 'button#position-right-loop', function() {
    return $('#loop-from').val(+$('#loop-from').val() + (+$('#loop-duration').val())).trigger('change');
  });
  $(document.body).on('click', 'button#duration-left', function() {
    return $('#loop-duration').val(+$('#loop-duration').val() - 0.01).trigger('change');
  });
  $(document.body).on('click', 'button#duration-right', function() {
    return $('#loop-duration').val(+$('#loop-duration').val() + 0.01).trigger('change');
  });
  $(document.body).on('click', 'button#duration-double', function() {
    return $('#loop-duration').val(+$('#loop-duration').val() * 2.0).trigger('change');
  });
  $(document.body).on('click', 'button#duration-half', function() {
    return $('#loop-duration').val(+$('#loop-duration').val() * 0.5).trigger('change');
  });
  return _.defer(function() {
    $('#loop-from').val(YoutubeLooper.seekToPosition).trigger('change');
    return $('#loop-duration').val(YoutubeLooper.seekDuration).trigger('change');
  });
};
bindLoadVideoFormEvents = function() {
  return $(document.body).on('submit', 'form.load-video', function(event) {
    var query, video_id;
    video_id = $(event.target).find('input.video-id').val();
    YoutubeLooper.playVideoById(video_id);
    query = Page.createQuery({
      video: YoutubeLooper.playingVideoId,
      start: YoutubeLooper.seekToPosition,
      duration: YoutubeLooper.seekDuration
    });
    history.pushState(query, query, '?' + query);
    setTweetLink();
    return false;
  });
};
setupUrlShare = function() {
  return $(YoutubeLooper).on('loopSetChanged', function(event) {
    var query;
    if (!YoutubeLooper.playingVideoId) {
      return;
    }
    query = Page.createQuery({
      video: YoutubeLooper.playingVideoId,
      start: YoutubeLooper.seekToPosition,
      duration: YoutubeLooper.seekDuration
    });
    history.replaceState(query, query, '?' + query);
    return setTweetLink();
  });
};
setupSelectOnClick = function() {
  $(document.body).on('click', 'input.select-on-click', function(event) {
    event.target.select();
    return false;
  });
  return $(document.body).on('click', 'label.select-on-click', function(event) {
    return $(event.target).find('input.select-on-click')[0].select();
  });
};
setupSearch = function() {
  var template;
  template = _.template($('#search-result-template').text());
  $('#search-form').submit(function() {
    var keyword;
    try {
      keyword = $('#search-keyword').val();
      if (!keyword) {
        return false;
      }
      $('#search-results').empty();
      $('#searching').text(keyword + '...').show();
      YoutubeSearcher.searchVideo(keyword).then(function(videos) {
        var tags, video, _i, _len;
        $('#searching').hide();
        tags = '';
        for (_i = 0, _len = videos.length; _i < _len; _i++) {
          video = videos[_i];
          tags += template({
            video: video
          });
        }
        return $('#search-results').append(tags);
      });
    } catch (_e) {}
    return false;
  });
  return $('#search-results').on('click', '.video', function(event) {
    var query, target, videoId;
    target = $(event.target).is('.video') ? $(event.target) : $(event.target).parents('.video');
    videoId = target.attr('data-video-id');
    console.log('play', videoId);
    YoutubeLooper.playVideoById(videoId);
    query = Page.createQuery({
      video: YoutubeLooper.playingVideoId,
      start: YoutubeLooper.seekToPosition,
      duration: YoutubeLooper.seekDuration
    });
    history.pushState(query, query, '?' + query);
    return setTweetLink();
  });
};
setupPopState = function() {
  return $(window).on('popstate', function(event) {
    var query;
    query = event.originalEvent.state;
    return YoutubeLooper.loadQuery(query);
  });
};
setupSaveLoop = function() {
  return $('#save-loop').click(function() {
    if (!YoutubeLooper.playingVideoId) {
      return;
    }
    $('#save-loop').attr('disabled', true);
    Gallery.clearCache();
    return Gallery.post(YoutubeLooper.playingVideoId, YoutubeLooper.seekToPosition, YoutubeLooper.seekDuration).then(function() {
      var $message;
      Gallery.clearCache();
      Gallery.setupRecentLoops();
      $message = $('<span>').addClass('message').text('保存しました');
      $('#save-loop').after($message);
      return setTimeout(function() {
        return $message.remove();
      }, 3000);
    }).always(function() {
      return $('#save-loop').attr('disabled', false);
    });
  });
};
setTweetLink = function() {
  var share_url, text, url;
  text = 'ループしました';
  url = location.href;
  share_url = "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
  return $("a#tweet-loop").show().attr({
    href: share_url
  });
};
setup = function() {
  bindLoopControllerEvents();
  bindLoadVideoFormEvents();
  YoutubeLooper.loadQuery();
  setupUrlShare();
  YoutubeLooper.setup();
  setupSelectOnClick();
  setupSearch();
  Gallery.setupRecentLoops();
  Gallery.setupRecentLoopsClick();
  setupPopState();
  return setupSaveLoop();
};
$(function() {
  return setup();
});