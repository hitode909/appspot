// called from Player
function onYouTubePlayerReady(playerId) {
    ytl.loadingVideoCount--;
    if( ytl.loadingVideoCount == 0) {
        ytl.init();
    }
};

// Application
ytl = {};
ytl.videos = [];
ytl.loadingVideoCount = 0;
ytl.target = 0;
ytl.loopFrom = 0.2;
ytl.after = 400;

ytl.playerOf = function(elementId) {
    return document.getElementById(elementId);
    return $('#' + elementId)[0];
}

ytl.playerIdFor = function(videoId) {
    var suffix = 'player';
    for (var i=0;;i++){
        var name = videoId + suffix + i;
        if ( ytl.videos.indexOf(name) == -1) {
            return name;
        }
    }
}

ytl.newPlayer = function(videoId) {
    var newdiv = document.createElement('div');
    newdiv.id = videoId;
    document.getElementById('video_container').appendChild(newdiv);

    var params = { allowScriptAccess: "always"};
    var atts = { id: ytl.playerIdFor(videoId) };
    swfobject.embedSWF("http://www.youtube.com/v/"+videoId+"&enablejsapi=1&rel=0&loop=1&playerapiid=" + videoId,
                       videoId, "425", "356", "8", null, null, params, atts);
    ytl.videos.push(atts.id);
}

ytl.incrementTarget = function() {
    ytl.target += 1;
    if (ytl.target >= ytl.videos.length) {
        ytl.target = 0;
    }
}

ytl.init = function() {
    // load video
    $(ytl.videos).each(
        function(index) {
            var p = ytl.playerOf(this);
            p.playVideo();
            p.mute();
        }
    );
    ytl.playerOf(ytl.videos[ytl.videos.length-1]).unMute();
}

ytl.stop = function() {
    clearTimeout(ytl.timer);
    ytl.timer = null;
}

ytl.loop = function() {
    var target = ytl.target;
    ytl.incrementTarget();
    var seekPos;
    $(ytl.videos).each(
        function(index){
            var p = ytl.playerOf(this);
            if (index == target) {
                p.unMute();
                p.playVideo();
            } else {
                seekPos = ytl.loopFrom * p.getDuration();
                p.seekTo(seekPos);
                p.pauseVideo();
            }
        }
    );
    ytl.timer = setTimeout(ytl.loop, ytl.after);
}

ytl.jumpRandom = function() {
    var p = ytl.playerOf(ytl.videos[0]);
    ytl.loopFrom = Math.random() * p.getDuration();
}

ytl.loadVideo = function(videoId) {
    for( var i=0; i<ytl.len; i++) {
        ytl.loadingVideoCount++;
        ytl.newPlayer(videoId);
    }
}

ytl.parseQuery = function() {
    var query = {};
    try {
    $(location.href.split('?')[1].split('&')).each(
        function(){
            var assign = this.split('=');
            if (assign.length == 2) {
                var key = assign[0];
                var value = decodeURIComponent(assign[1]);
                query[key] = value;
            }
        }
    );
    } catch (e){
    }
    return query;
}

ytl.padTouch = function(e) {
    if (ytl.mousedown) {
        var rateX = (e.clientX - $(this).offset().left)/this.clientWidth || 0.125;
        ytl.after = 60*1000*parseInt(rateX*32)/8/ytl.bpm || ytl.after;
        var rateY = (e.clientY - $(this).offset().top)/this.clientHeight;
        ytl.loopFrom = rateY || ytl.loopFrom;
        if (ytl.timer == null) {
            $('button.stop').show();
            ytl.loop();
        }
    }
}

ytl.validateVideoId = function(vid) {
    var defaultId = 'W6YgZc5th6g'; //Balmer sells windows
    if (typeof(vid) == 'string' && vid.search(/^(\w|\-)+$/) != -1) {
        return vid;
    } else {
        return defaultId;
    }
}

$(function(){
      $('button.stop').click(
          function() {
              ytl.stop();
              $(this).hide();
          }
      );
      $('div.pad').mousedown(
          function(e) {
              ytl.mousedown = true;
              var rateX = (e.clientX - $(this).offset().left)/this.clientWidth || 0.125;
              ytl.after = 60*1000*parseInt(rateX*32)/8/ytl.bpm || ytl.after;
              var rateY = (e.clientY - $(this).offset().top)/this.clientHeight;
              ytl.loopFrom = rateY || ytl.loopFrom;
              if (ytl.timer == null) {
                  $('button.stop').show();
                  ytl.loop();
              }
          }
      );
      $('div.pad').mouseup(
          function (e) {
              ytl.mousedown = false;
          }
      );
      $('div.pad').mouseout(
          function (e) {
              ytl.mousedown = false;
          }
      );
      $('div.pad').mousemove(
          ytl.padTouch
      );
      
      
      var query = ytl.parseQuery();
      var videoId = ytl.validateVideoId(query.v);
      document.title += ' - ' + videoId;
      ytl.bpm = parseInt(query.bpm) || 120;
      ytl.len = parseInt(query.len) || 2;
      ytl.loadVideo(videoId);
  });
                                                         
