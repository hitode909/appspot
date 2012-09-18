var Page;
Page = {
  parseQuery: function(query_string) {
    var k, pair, query, v, _i, _len, _ref, _ref2;
    query = {};
    _ref = query_string.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      _ref2 = pair.split('='), k = _ref2[0], v = _ref2[1];
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return query;
  }
};
$(function() {
  var bind, load_bg;
  load_bg = function() {
    var is_repeat, query;
    query = Page.parseQuery(location.search.slice(1));
    if (!query.url) {
      return;
    }
    $('input[name="url"]').val(query.url);
    $('input[name="repeat"]').prop('checked', query.repeat);
    is_repeat = query.repeat ? 'repeat' : 'no-repeat';
    $(document.body).css({
      'background': "url('" + query.url + "')",
      'background-position': 'center'
    });
    if (query.repeat) {
      return $(document.body).css({
        'background-repeat': 'repeat'
      });
    } else {
      return $(document.body).css({
        'background-repeat': 'no-repeat',
        'background-size': 'cover'
      });
    }
  };
  load_bg();
  bind = function() {
    return $('#tweet').click(function() {
      var text, url;
      text = '見てください';
      url = location.href;
      return window.open("https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text)));
    });
  };
  return bind();
});