var start;
start = function() {
  var body, g;
  body = $('#source').val();
  g = new TextGenerator(body);
  return setInterval(function() {
    if (body !== $('#source').val()) {
      body = $('#source').val();
      g = new TextGenerator(body);
    }
    return $('#dest').val(g.get_from_text($('#dest').val()));
  }, 100);
};
$(function() {
  var start_timer, typing_timer;
  start_timer = null;
  typing_timer = null;
  return $('#dest').keyup(function() {
    if (typing_timer) {
      clearTimeout(typing_timer);
      typing_timer = null;
    }
    if (start_timer) {
      clearTimeout(start_timer);
      start_timer = null;
    }
    return start_timer = setTimeout(function() {
      typing_timer = start();
      return start_timer = null;
    }, 1000);
  });
});