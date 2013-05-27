class Sin
  constructor: (@container) ->
    @osc = T("sin", 400)
    @bind()
    @load()
    @setRange()

  bind: ->
    @container.find('.kill').on 'click', =>
      @osc.pause()
      @container.remove()

  alive: ->
    @container.is ':visible'

  load: ->
    @play()
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

  play: ->
    @osc.play()

  volume: (v) ->
    @osc.mul = v

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

    input.val(+input.val()+1)
    input.val(+input.val()-1)

$ ->
  oscs = []

  add_sin = ->
    $new_container = if $('.osc:last')[0] then $('.osc:last').clone() else $($.parseHTML($('#osc-template').html()))
    $pitch = $new_container.find('input[name="pitch"]')
    $pitch.val($pitch.val() * 1.1)
    $('.oscs').append $new_container
    oscs.push new Sin($new_container)

  add_sin()

  timer = T "interval", 50, ->
    oscs = (osc for osc in oscs when osc.alive())
    for osc in oscs
      osc.load()

  $('.add').click ->
    add_sin()

  timer.on()

