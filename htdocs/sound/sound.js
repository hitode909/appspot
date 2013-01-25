$(function() {
  var channel, context, fun, last_t, last_x, node, plot_at, sample_value, stream_length, time_count, value;
  last_x = null;
  $(document).on('mousemove', 'canvas', function(event) {
    return last_x = event.clientX;
  });
  setInterval(function() {
    return console.log(last_x);
  }, 100);
  channel = 2;
  stream_length = 4096;
  context = new webkitAudioContext();
  node = context.createJavaScriptNode(stream_length, 1, channel);
  time_count = 0;
  last_t = 0;
  value = 0;
  plot_at = 0;
  sample_value = 0.0;
  fun = function() {
    return 0;
  };
  node.onaudioprocess = function(event) {
    var data1, data2, i, len, sampling_rate, t, _results;
    data1 = event.outputBuffer.getChannelData(0);
    data2 = event.outputBuffer.getChannelData(1);
    len = data1.length;
    sampling_rate = $('input[name="sampling-rate"]:checked').val();
    _results = [];
    for (i = 0; 0 <= len ? i <= len : i >= len; 0 <= len ? i++ : i--) {
      t = Math.floor(time_count * sampling_rate / 44100);
      if (t !== last_t) {
        update_sample(t);
        last_t = t;
      }
      data1[i] = Math.sin(i * 800) * 2 - 1.0;
      _results.push(data2[i] = Math.sin(i * 80) * 2 - 1.0);
    }
    return _results;
  };
  return node.connect(context.destination);
});