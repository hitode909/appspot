start = ->
  body = $('#source').val()
  g = new TextGenerator(body)
  setInterval ->
    if body != $('#source').val()
      body = $('#source').val()
      g = new TextGenerator(body)

    $('#dest').val(g.get_from_text($('#dest').val()))
  , 100

$ ->
  start_timer = null
  typing_timer = null

  $('#dest').keyup ->

    if typing_timer
      clearTimeout(typing_timer)
      typing_timer = null

    if start_timer
      clearTimeout(start_timer)
      start_timer = null

    start_timer = setTimeout ->
      typing_timer = start()
      start_timer = null

    ,1000
