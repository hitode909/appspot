var Page, Video, main;
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
  }
};
Video = {
  load_players: function(n) {
    var i, _results;
    _results = [];
    for (i = 0; 0 <= n ? i <= n : i >= n; 0 <= n ? i++ : i--) {
      _results.push(this.load_player());
    }
    return _results;
  },
  load_player: function() {
    var attrs, params, playerId;
    playerId = 'video-' + Video.videoNumber++;
    this.container = $('<div>');
    this.container.addClass('player');
    this.container.attr('id', playerId);
    this.container.appendTo($('.players'));
    params = {
      allowScriptAccess: 'always'
    };
    attrs = {
      id: playerId
    };
    return swfobject.embedSWF("http://gdata.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=" + playerId, playerId, "1280", "720", "8", null, null, params, attrs);
  },
  set_videos: function(video_urls) {
    var module, players;
    module = this;
    players = module.get_players();
    if (video_urls.length > players.length) {
      module.load_players(video_urls.length - players.length);
      setTimeout(function() {
        return module.set_videos(video_urls);
      }, 500);
      return;
    }
    if (module.loadedPlayers !== players.length) {
      setTimeout(function() {
        return module.set_videos(video_urls);
      }, 500);
      return;
    }
    module.pauseAllPlayers();
    _.each(_.zip(this.get_players(), video_urls), function(pair) {
      var player, url;
      player = pair[0], url = pair[1];
      if (!(player && url)) {
        return;
      }
      return player.cueVideoById(url);
    });
    return Video.playingVideosCount = video_urls.length;
  },
  pauseAllPlayers: function() {
    var module, players;
    module = this;
    players = module.get_players();
    return _.each(players, function(player) {
      try {
        player.pauseVideo();
        return $(player).css({
          opacity: 0
        });
      } catch (error) {

      }
    });
  },
  get_players: function() {
    return $('.players object');
  },
  videoNumber: 1,
  playingVideosCount: 0,
  playingVideosOffset: 0,
  loadedPlayers: 0,
  toggleVideo: function() {
    var module, players, playing_player;
    module = this;
    players = module.get_players();
    _.each(players, function(player) {
      try {
        player.pauseVideo();
        return $(player).css({
          opacity: 0
        });
      } catch (error) {

      }
    });
    playing_player = players[module.playingVideosOffset];
    playing_player.playVideo();
    $(playing_player).css({
      opacity: 1
    });
    module.playingVideosOffset++;
    if (module.playingVideosOffset > module.playingVideosCount - 1) {
      return module.playingVideosOffset = 0;
    }
  },
  error: function(error) {},
  setup: function() {
    window.onYouTubePlayerReady = function() {
      return Video.loadedPlayers++;
    };
    return setInterval(function() {
      return Video.toggleVideo();
    }, 1000);
  }
};
main = function() {
  var bind_events, createShareURL, normalize_video_id, play_videos;
  Video.setup();
  Video.load_players(1);
  createShareURL = function(videos) {
    var text, url;
    url = "http://hitode909.appspot.com/paralleltube#" + encodeURIComponent(videos.join(' '));
    text = '#paralleltube';
    return "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
  };
  play_videos = function(video_urls) {
    location.hash = encodeURIComponent(video_urls.join(" "));
    $('form#videos-form').find('textarea').val(video_urls.join(" "));
    $('form#videos-form a.share').attr('href', createShareURL(video_urls));
    return Video.set_videos(video_urls);
  };
  normalize_video_id = function(str) {
    var match, query;
    match = str.match(/\?(.*)/);
    if (!match) {
      return str;
    }
    query = Page.parseQuery(match[1]);
    if (query['v']) {
      return query['v'];
    } else {
      return str;
    }
  };
  bind_events = function() {
    var fill_default, fill_from_hash;
    fill_from_hash = function() {
      var keyword;
      if (!(location.hash.length > 0)) {
        return false;
      }
      keyword = location.hash.replace(/^#/, '');
      $('form#videos-form textarea').val(decodeURIComponent(keyword));
      _.defer(function() {
        return $('form#videos-form').trigger('submit');
      });
      return true;
    };
    fill_default = function() {
      $('form#videos-form textarea').val(decodeURIComponent('e2GvmCfyYgw cPmmqBK8prM'));
      return _.defer(function() {
        return $('form#videos-form').trigger('submit');
      });
    };
    fill_from_hash() || fill_default();
    return $('form#videos-form').submit(function(event) {
      _.defer(function() {
        return play_videos(_.map($('form#videos-form').find('textarea').val().split(/\s+/), normalize_video_id));
      });
      return false;
    });
  };
  return bind_events();
};
$(function() {
  return main();
});