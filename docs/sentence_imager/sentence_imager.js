var DataStorage;
DataStorage = {
  save: function(data) {
    var dfd;
    dfd = $.Deferred();
    $.ajax({
      url: '/text/',
      data: {
        data: data
      },
      type: 'POST',
      dataType: 'text',
      success: function(url) {
        var key;
        key = url.split('/').pop();
        localStorage["data-" + key] = data;
        return dfd.resolve(key || 'hello');
      },
      error: function() {
        return dfd.reject();
      }
    });
    return dfd;
  },
  get: function(key) {
    var dataKey, dfd;
    dfd = $.Deferred();
    dataKey = "data-" + key;
    if (localStorage[dataKey]) {
      dfd.resolve(localStorage[dataKey]);
    } else {
      $.ajax({
        url: "/text/" + key,
        type: 'GET',
        dataType: 'text',
        success: function(data) {
          localStorage[dataKey] = data;
          return dfd.resolve(data);
        },
        error: function() {
          return dfd.reject();
        }
      });
    }
    return dfd.promise();
  }
};
$(function() {
  var analyse, append_image, bind;
  append_image = function(phrase, score) {
    var $item;
    $item = $('<div>').addClass('item result');
    $item.css({
      'background-image': "url('http://" + phrase + ".jpg.to')"
    });
    $item.append((($('<h2>').text(phrase)).addClass('title')).css({
      'font-size': "" + (Math.sqrt(score) * 5 + 30) + "px"
    }));
    return $item.appendTo($(document.body));
  };
  analyse = function(text) {
    $('.indicator').show();
    $('input[type=submit]').prop({
      disabled: true
    });
    return $.ajax({
      type: 'get',
      dataType: 'jsonp',
      url: 'http://jlp.yahooapis.jp/KeyphraseService/V1/extract',
      data: {
        appid: 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--',
        sentence: text,
        output: 'json'
      }
    }).always(function() {
      $('.indicator').hide();
      return $('input[type=submit]').prop({
        disabled: false
      });
    }).then(function(res) {
      var phrase, score, _results;
      $('.result').remove();
      _results = [];
      for (phrase in res) {
        score = res[phrase];
        _results.push(append_image(phrase, score));
      }
      return _results;
    }, function(error) {
      return alert("趣旨の取得に失敗しました．時間をおいて試してみてください．文章が長すぎるのかもしれません．");
    });
  };
  bind = function() {
    var matched;
    $('#body-form').submit(function(event) {
      var text;
      text = $('#body').val();
      DataStorage.save(text).done(function(key) {
        return location.href = "/sentence_imager/-/" + key;
      });
      return false;
    });
    matched = location.pathname.match(/sentence_imager\/[-]\/([^?&\/]+)/);
    if (matched && matched[1]) {
      return DataStorage.get(matched[1]).then(function(body) {
        $('textarea#body').val(body);
        analyse(body);
        return $('#tweet').show().click(function() {
          var text, url;
          text = '趣旨ビジュアライザー';
          url = location.href;
          window.open("https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text)));
          return false;
        });
      }, function() {
        alert("文章の取得に失敗しました．トップページに戻ります．");
        return location.href = "/sentence_imager/";
      });
    }
  };
  return bind();
});