class Sin
  constructor: (@container) ->
    @osc = T("sin", 400)
    @load()

  load: ->
    @freq = +@container.find('input').val()
    @osc.freq = @freq
    @container.find('.hz').text(@freq)

  set: (freq) ->
    @container.find('input').val(freq)
    @load()

$ ->
  oscs = []
  $('.osc').each ->
    container = $(this)
    oscs.push(new Sin(container))

  timer = T "interval", 100, ->
    for osc in oscs
      osc.load()

  timer.on()

  T.apply(window, ["+"].concat(osc.osc for osc in oscs)).play()
