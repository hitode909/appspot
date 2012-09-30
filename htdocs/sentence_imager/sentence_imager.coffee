DataStorage =
  save: (data) ->
    dfd = $.Deferred()
    $.ajax
      url: '/text/'
      data:
        data: data
      type: 'POST'
      dataType: 'text'
      success: (url) ->
        key = url.split('/').pop()
        localStorage["data-#{key}"] = data
        dfd.resolve key || 'hello'
      error: ->
        dfd.reject()

    dfd

  get: (key) ->
    dfd = $.Deferred()
    dataKey = "data-#{key}"

    if localStorage[dataKey]
      dfd.resolve localStorage[dataKey]
    else
      $.ajax
        url: "/text/#{key}"
        type: 'GET'
        dataType: 'text'
        success: (data) ->
          localStorage[dataKey] = data
          dfd.resolve data
        error: ->
          dfd.reject()

    dfd.promise()

$ ->

  append_image = (phrase, score) ->
    $item = $('<div>').addClass 'item result'
    $item.css
      'background-image': "url('http://#{ encodeURIComponent(phrase)}.jpg.to')"
    $item.append \
      (($('<h2>').text phrase).addClass 'title').css
        'font-size': "#{ Math.sqrt(score) * 5 + 30 }px"

    $item.appendTo $(document.body)

  analyse = (text) ->

    $('.indicator').show()
    $('input[type=submit]').prop
      disabled: true

    $.ajax
      type: 'get'
      dataType: 'jsonp'
      url: 'http://jlp.yahooapis.jp/KeyphraseService/V1/extract'
      data:
        appid: 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--'
        sentence: text
        output: 'json'
    .always ->
      $('.indicator').hide()
      $('input[type=submit]').prop
        disabled: false
    .then (res) ->
      $('.result').remove()
      for phrase, score of res
        append_image phrase, score
    , (error) ->
      alert "趣旨の取得に失敗しました．時間をおいて試してみてください．文章が長すぎるのかもしれません．"

  bind = ->
    $('#body-form').submit (event) ->
      text = $('#body').val()
      DataStorage.save(text).done (key) ->
        location.href = "/sentence_imager/-/#{key}"

      false

    matched = location.pathname.match(/sentence_imager\/[-]\/([^?&\/]+)/)
    if matched && matched[1]
      DataStorage.get(matched[1]).then (body) ->
        $('textarea#body').val(body)
        analyse(body)

        $('#tweet').show().click ->
          text = '趣旨ビジュアライザー'
          url = location.href
          window.open "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
          false
      , ->
        alert "文章の取得に失敗しました．トップページに戻ります．"
        location.href = "/sentence_imager/"



  bind()