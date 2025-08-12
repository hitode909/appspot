should_create = (g)->
  return true unless g
  g.source != $('#source').val() || g.gram_length != $('#gram-length').val()

start = ->
  body = $('#source').val()
  g = null
  setInterval ->
    if should_create(g)
      g = new TextGenerator($('#source').val(), +$('#gram-length').val())

    $('#dest').val(g.get_from_text($('#dest').val()))
  , 100

$ ->
  start_timer = null
  typing_timer = null
  set_timers = ->
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

  $('#dest').keyup ->
    set_timers()

  $('body').mousedown ->
    set_timers()

  $('#gram-length').change ->
    $('#gram-length-value').text($(this).val())

  $('button.sample').click ->
    $('#dest').val($(this).text())
    set_timers()