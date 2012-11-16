window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
$(function() {
  var animationLoop, file_dropped, image_url_prepared, load_img_to_canvas, rand, resize_to_fit, setColor, setup_drop;
  $(document.body).click(function() {
    return window.requestAnimationFrame = function(callback, element) {
      return window.setTimeout(function() {
        return callback();
      }, 1000 / 6);
    };
  });
  rand = function(max) {
    return Math.floor(Math.random() * max);
  };
  setColor = function() {
    var canvas, ctx, imagedata;
    if (!window.$canvas) {
      return;
    }
    canvas = window.$canvas[0];
    ctx = window.$canvas[0].getContext('2d');
    imagedata = ctx.getImageData(Math.floor(canvas.width * Math.random()), Math.floor(canvas.height * Math.random()), 1, 1);
    return document.body.style.background = "rgb(" + imagedata.data[0] + ", " + imagedata.data[1] + ", " + imagedata.data[2] + ")";
  };
  animationLoop = function() {
    setColor();
    return window.requestAnimationFrame(animationLoop);
  };
  animationLoop();
  $(document.body).click(function() {
    return window.requestAnimationFrame = function(callback, element) {
      return window.setTimeout(function() {
        return callback();
      }, 1000 / 6);
    };
  });
  resize_to_fit = function(x1, y1, x2, y2) {
    var rate;
    if (x1 <= x2 && y1 <= y2) {
      return [x1, y1];
    }
    rate = _.min([x2 / x1, y2 / y1]);
    return _.map([x1, y1], function(v) {
      return Math.floor(v * rate);
    });
  };
  load_img_to_canvas = function(img) {
    var $canvas, canvas, ctx, item_container;
    item_container = $('<div>').addClass('item');
    $('#image-container').append(item_container);
    $canvas = $('<canvas>').addClass('image');
    canvas = $canvas[0];
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    return $canvas;
  };
  image_url_prepared = function(url) {
    var img;
    img = new Image;
    img.onload = function() {
      var $canvas;
      $('.item').remove();
      $('#stripe-container').empty();
      $('body').removeClass('hovering');
      $('body').addClass('dropped');
      $canvas = load_img_to_canvas(img);
      window.$canvas = $canvas;
      return $(document.body).empty().append($canvas);
    };
    img.onerror = function() {
      return alert("画像の読み込みに失敗しました．時間をおいて試してみてください．");
    };
    return img.src = url;
  };
  file_dropped = function(file) {
    var reader;
    if (!window.FileReader) {
      alert("お使いのブラウザはファイル読み込みに対応していません．画像URLを指定すると読み込めます．Google ChromeかFirefoxなら画像をドロップで読み込めます．");
      return;
    }
    reader = new FileReader;
    reader.onload = function() {
      return image_url_prepared(reader.result);
    };
    return reader.readAsDataURL(file);
  };
  setup_drop = function() {
    var dragging_img_src, enter_counter;
    enter_counter = 0;
    dragging_img_src = null;
    return $(document).on('dragstart', function(jquery_event) {
      var event;
      event = jquery_event.originalEvent;
      if (event.target.src) {
        dragging_img_src = event.target.src;
      }
      if ($(event.target).find('img')) {
        dragging_img_src = $(event.target).find('img')[0].src;
      } else {
        dragging_img_src = null;
      }
      return true;
    }).on('dragover', function() {
      return false;
    }).on('dragleave', function() {
      if (enter_counter > 0) {
        enter_counter--;
      }
      if (enter_counter === 0) {
        $('body').removeClass('hovering');
      }
      return false;
    }).on('dragenter', function() {
      enter_counter++;
      if (enter_counter === 1) {
        $('body').addClass('hovering');
      }
      return false;
    }).on('drop', function(jquery_event) {
      var event, file;
      enter_counter = 0;
      $('body').removeClass('hovering');
      event = jquery_event.originalEvent;
      if (event.dataTransfer.files.length > 0) {
        file = event.dataTransfer.files[0];
        file_dropped(file);
      }
      return false;
    });
  };
  return setup_drop();
});