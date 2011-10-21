var convert, play;
convert = function(v) {
  return (v % 256) / 128 - 0.5;
};
play = function() {
  var channel, context, node, stream_length, t2;
  channel = 2;
  stream_length = 4096;
  context = new webkitAudioContext();
  node = context.createJavaScriptNode(stream_length, 1, channel);
  console.log(node);
  t2 = 0;
  node.onaudioprocess = function(event) {
    var data, fun, i, len, sampling_rate, t, v, _results;
    data = event.outputBuffer.getChannelData(0);
    len = data.length;
    fun = function() {
      return 0;
    };
    try {
      v = $("#f").val();
      fun = eval("(function(t){return " + v + ";})");
    } catch (_e) {}
    sampling_rate = $('input[name="sampling-rate"]:checked').val();
    _results = [];
    for (i = 0; 0 <= len ? i <= len : i >= len; 0 <= len ? i++ : i--) {
      t = Math.floor(t2 * sampling_rate / 44100);
      data[i] = convert(fun(t));
      _results.push(t2++);
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