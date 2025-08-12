var should_create, start;
should_create = function(g) {
  if (!g) {
    return true;
  }
  return g.source !== $('#source').val() || g.gram_length !== $('#gram-length').val();
};
start = function() {
  var body, g;
  body = $('#source').val();
  g = null;
  return setInterval(function() {
    if (should_create(g)) {
      g = new TextGenerator($('#source').val(), +$('#gram-length').val());
    }
    return $('#dest').val(g.get_from_text($('#dest').val()));
  }, 100);
};
$(function() {
  var set_timers, start_timer, typing_timer;
  start_timer = null;
  typing_timer = null;
  set_timers = function() {
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
  };
  $('#dest').keyup(function() {
    return set_timers();
  });
  $('body').mousedown(function() {
    return set_timers();
  });
  $('#gram-length').change(function() {
    return $('#gram-length-value').text($(this).val());
  });
  return $('button.sample').click(function() {
    $('#dest').val($(this).text());
    return set_timers();
  });
});