var GigaSchema;
window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
GigaSchema = {
  endpoint: 'http://gigaschema.appspot.com/hitode909/blink6.json',
  api_key: '1fafd791506648d93656432dd8c95bce81424367',
  list: function() {
    var dfd;
    dfd = $.Deferred();
    $.ajax({
      url: GigaSchema.endpoint,
      type: 'GET',
      dataType: 'json'
    }).done(function(res) {
      return dfd.resolve(res.data);
    });
    return dfd;
  },
  getValue: function(key) {
    var dfd;
    dfd = $.Deferred();
    $.ajax({
      url: "http://gigaschema.appspot.com/hitode909/blink6/" + key + ".json",
      type: 'GET',
      dataType: 'json'
    }).done(function(res) {
      return dfd.resolve(JSON.parse(res.value));
    });
    return dfd;
  },
  save: function(frames) {
    var dfd;
    dfd = $.Deferred();
    $.ajax({
      url: GigaSchema.endpoint,
      type: 'POST',
      data: {
        value: JSON.stringify(frames),
        api_key: GigaSchema.api_key
      },
      dataType: 'json'
    }).done(function(res) {
      return dfd.resolve(res.data[0].key);
    });
    return dfd;
  }
};
$(function() {
  var $body, $input_color, addToGallery, animationLoop, animations, checkSupported, edit_session, loadList, playingFrame, playingFrames, process, registerAnimation, reset_edit_session, setupInitialState;
  $input_color = $('input#color-input');
  $body = $('body');
  playingFrames = [];
  playingFrame = 0;
  edit_session = null;
  reset_edit_session = function() {
    if (edit_session) {
      clearTimeout(edit_session);
    } else {
      playingFrames = [];
      playingFrame = 0;
    }
    return edit_session = setTimeout(function() {
      edit_session = null;
      return GigaSchema.save(playingFrames).done(function(key) {
        location.hash = key;
        return addToGallery(key, playingFrames);
      });
    }, 500);
  };
  $input_color.on('change', function() {
    var color;
    reset_edit_session();
    color = $input_color.val();
    playingFrames[playingFrame] = color;
    return $body.css({
      background: color
    });
  });
  animations = [];
  process = function() {
    var animation, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = animations.length; _i < _len; _i++) {
      animation = animations[_i];
      _results.push(animation());
    }
    return _results;
  };
  animationLoop = function() {
    process();
    return window.requestAnimationFrame(animationLoop);
  };
  registerAnimation = function(f) {
    return animations.push(f);
  };
  registerAnimation(function() {
    playingFrame++;
    if (playingFrame > playingFrames.length && !edit_session) {
      playingFrame = 0;
    }
    if (playingFrames[playingFrame]) {
      return $body.css({
        background: playingFrames[playingFrame]
      });
    }
  });
  animationLoop();
  loadList = function() {
    var dfd;
    dfd = $.Deferred();
    return GigaSchema.list().done(function(items) {
      var item, _i, _len, _ref;
      _ref = items.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        addToGallery(item.key, JSON.parse(item.value));
      }
      return dfd.resolve();
    });
  };
  setupInitialState = function() {
    if (location.hash.length > 0) {
      loadList();
      return GigaSchema.getValue(location.hash.slice(1)).done(function(gotFrames) {
        return playingFrames = gotFrames;
      });
    } else {
      return loadList().done(function() {
        return $('.gallery-item:eq(0)').triggerHandler('click');
      });
    }
  };
  setupInitialState();
  addToGallery = function(key, frames) {
    var $item, frame;
    $item = $('<div>').addClass('gallery-item').prependTo($('#gallery'));
    frame = 0;
    registerAnimation(function() {
      frame++;
      if (frame > frames.length) {
        frame = 0;
      }
      return $item.css({
        background: frames[frame]
      });
    });
    return $item.on('click', function() {
      playingFrames = frames;
      playingFrame = frame;
      return location.hash = key;
    });
  };
  checkSupported = function() {
    if ($('<input type="color">').val() === '#000000') {
      return;
    }
    $('<div>').addClass('message').text('blink6 supports Google Chrome').prependTo($('body'));
    return $('.add').remove();
  };
  return checkSupported();
});