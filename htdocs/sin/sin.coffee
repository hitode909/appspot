class Sin
  constructor: (@container) ->
    @osc = T("sin", 400)
    @load()

  load: ->
    @freq = +@container.find('input').val()
    return if @freq == @lastFreq
    @lastFreq = @freq
    @osc.freq = @freq
    @container.find('.hz').text(@freq)

    if @rangeTimer
      clearTimeout @rangeTimer

    @rangeTimer = setTimeout =>
      @setRange()
      @rangeTimer = null
    ,500

  set: (freq) ->
    @container.find('input').val(freq)
    @load()

  setRange: ->
    input = @container.find('input')
    min = +input.attr('min')
    max = +input.attr('max')
    val = +input.val()
    return if val == 0

    if val / max > 0.7
      input.attr('max', max * 2)

    if val / max < 0.3
      input.attr('max', max / 2)

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
