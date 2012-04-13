$(function() {
  var histogram, load_img_to_canvas, num_to_color, pick_color, setup_click_color, setup_cursor;
  num_to_color = function(num) {
    return '#' + ('000000' + (+num).toString(16)).slice(-6);
  };
  load_img_to_canvas = function(img) {
    var $canvas, canvas, ctx, item_container;
    item_container = $('<div>').addClass('item');
    $('#image-container').empty().append(item_container);
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
    var base, canvas, color, count, ctx, data, displayed_colors_length, famous_colors, i, img_data, len, list, table, v, width, _i, _len, _ref;
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
    displayed_colors_length = 0;
    base = canvas.width * canvas.height;
    for (_i = 0, _len = famous_colors.length; _i < _len; _i++) {
      color = famous_colors[_i];
      width = color[1] * 5 / canvas.width;
      if (width < 1) {
        break;
      }
      displayed_colors_length++;
      $('<span>').addClass('color').attr({
        'data-color': num_to_color(color[0])
      }).css({
        display: 'inline-block',
        width: width,
        height: canvas.height,
        background: num_to_color(color[0])
      }).appendTo(container);
    }
    return console.log("displayed " + (displayed_colors_length / famous_colors.length) + ", " + displayed_colors_length + " of  " + famous_colors.length);
  };
  $(document).bind('dragover', function() {
    return false;
  });
  $(document).bind('drop', function(jquery_event) {
    var event, file, reader;
    event = jquery_event.originalEvent;
    file = event.dataTransfer.files[0];
    reader = new FileReader;
    reader.onload = function() {
      var img;
      img = new Image;
      img.onload = function() {
        return histogram(load_img_to_canvas(img));
      };
      return img.src = reader.result;
    };
    reader.readAsDataURL(file);
    return false;
  });
  pick_color = function(color) {
    var color_item;
    color_item = $('<div>').append($('<span>').addClass('color-sample').css({
      background: color
    })).append(color);
    return $('#selected-colors').append(color_item);
  };
  setup_click_color = function() {
    return $('body').on('click', '.color', function(event) {
      var color;
      color = $(this).attr('data-color');
      return pick_color(color);
    });
  };
  setup_click_color();
  setup_cursor = function() {
    var bg_color, get_color_from_canvas, offset;
    offset = 15;
    bg_color = '#ffffff';
    $(document).bind('mousemove', function(event) {
      $('.cursor-preview').remove();
      $('<span>').addClass('cursor-preview').appendTo($('body')).css({
        left: event.pageX + offset,
        top: event.pageY + offset,
        'background-color': bg_color
      });
      return true;
    });
    $(document).on('mousemove', '.color', function(event) {
      bg_color = $(event.target).attr('data-color');
      return true;
    });
    get_color_from_canvas = function(canvas, x, y) {
      var ctx, data, v;
      ctx = canvas.getContext('2d');
      data = ctx.getImageData(x, y, 1, 1).data;
      v = (data[0] << 16) + (data[1] << 8) + data[2];
      return num_to_color(v);
    };
    $(document).on('mousemove', 'canvas', function(event) {
      var canvas;
      canvas = event.target;
      bg_color = get_color_from_canvas(canvas, event.offsetX, event.offsetY);
      return true;
    });
    return $(document).on('click', 'canvas', function(event) {
      var canvas, color;
      canvas = event.target;
      color = get_color_from_canvas(canvas, event.offsetX, event.offsetY);
      return pick_color(color);
    });
  };
  return setup_cursor();
});