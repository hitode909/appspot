var play, sample_8bit_to_float;
sample_8bit_to_float = function(v) {
  return v / 128 - 0.5;
};
play = function() {
  var canvas, canvas_context, canvas_height, canvas_width, channel, context, fun, last_t, node, plot_at, sample_value, stream_length, time_count, update_sample, value;
  channel = 1;
  stream_length = 4096;
  context = new webkitAudioContext();
  node = context.createJavaScriptNode(stream_length, 1, channel);
  time_count = 0;
  last_t = 0;
  value = 0;
  plot_at = 0;
  sample_value = 0.0;
  canvas = $('canvas#plot');
  canvas_context = canvas[0].getContext('2d');
  canvas_width = canvas.width();
  canvas_height = canvas.height();
  fun = function() {
    return 0;
  };
  update_sample = function(t) {
    var x, y;
    value = fun(t) % 255;
    sample_value = sample_8bit_to_float(value);
    plot_at++;
    canvas_context.fillStyle = "rgb(" + value + ", 0, 0)";
    x = Math.floor(plot_at / canvas_width) % canvas_width;
    y = plot_at % canvas_height;
    return canvas_context.fillRect(x, y, 1, 1);
  };
  node.onaudioprocess = function(event) {
    var data, i, len, sampling_rate, t, v, _results;
    data = event.outputBuffer.getChannelData(0);
    len = data.length;
    sampling_rate = $('input[name="sampling-rate"]:checked').val();
    try {
      v = $("#f").val();
      fun = eval("(function(t){return " + v + ";})");
    } catch (_e) {}
    _results = [];
    for (i = 0; 0 <= len ? i <= len : i >= len; 0 <= len ? i++ : i--) {
      t = Math.floor(time_count * sampling_rate / 44100);
      if (t !== last_t) {
        update_sample(t);
        last_t = t;
      }
      data[i] = sample_value;
      _results.push(time_count++);
    }
    return _results;
  };
  return node.connect(context.destination);
};
$(function() {
  if (!webkitAudioContext) {
    return $('#message').text('Please visit this page with Google Chrome.');
  } else {
    return play();
  }
});