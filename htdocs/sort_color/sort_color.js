$(function() {
  var histogram, load_img_to_canvas, setup_click_color;
  load_img_to_canvas = function(img) {
    var $canvas, canvas, ctx, item_container;
    item_container = $('<div>').addClass('item');
    $('body').append(item_container);
    $canvas = $('<canvas>').addClass('image');
    item_container.append($canvas);
    canvas = $canvas[0];
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return item_container;
  };
  histogram = function(container) {
    var canvas, color, count, ctx, data, famous_colors, i, img_data, len, list, table, v, width, _i, _len, _ref, _results;
    canvas = container.find('canvas')[0];
    ctx = canvas.getContext('2d');
    img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = img_data.data;
    len = data.length;
    table = {};
    i = 0;
    while (i < len) {
      v = (data[i] << 16) + (data[i + 1] << 8) + data[i + 2];
      if ((_ref = table[v]) == null) {
        table[v] = 0;
      }
      table[v]++;
      i += 4;
    }
    list = [];
    for (color in table) {
      count = table[color];
      list.push([color, count]);
    }
    famous_colors = list.sort(function(a, b) {
      if (a[1] === b[1]) {
        return 0;
      }
      if (a[1] < b[1]) {
        return 1;
      } else {
        return -1;
      }
    });
    _results = [];
    for (_i = 0, _len = famous_colors.length; _i < _len; _i++) {
      color = famous_colors[_i];
      width = color[1] * 5 / canvas.width;
      if (width < 1) {
        break;
      }
      _results.push($('<span>').addClass('color').attr({
        title: '#' + (+color[0]).toString(16) + (" (" + color[1] + ")"),
        'data-color': '#' + (+color[0]).toString(16)
      }).css({
        display: 'inline-block',
        width: width,
        height: canvas.height,
        background: '#' + (+color[0]).toString(16)
      }).appendTo(container));
    }
    return _results;
  };
  $(document).bind('dragover', function() {
    return false;
  });
  $(document).bind('drop', function(jquery_event) {
    var event, file, _fn, _i, _len, _ref;
    event = jquery_event.originalEvent;
    _ref = event.dataTransfer.files;
    _fn = function() {
      var reader;
      reader = new FileReader;
      reader.onload = function() {
        var img;
        img = new Image;
        img.onload = function() {
          return histogram(load_img_to_canvas(img));
        };
        return img.src = reader.result;
      };
      return reader.readAsDataURL(file);
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      _fn();
    }
    return false;
  });
  setup_click_color = function() {
    return $('body').on('click', '.color', function() {
      var color, container;
      color = $(this).attr('data-color');
      container = $(this).parents('.item');
      return container.append($('<div>').append($('<span>').addClass('color-sample').css({
        background: color
      })).append(color));
    });
  };
  return setup_click_color();
});