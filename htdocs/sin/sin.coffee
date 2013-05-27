class Music
  @load: ->
    pitches = ( + i for i in location.hash[1..-1].split(','))
  @save: (oscs) ->
    hash = '#' + @serialize(oscs)
    if hash != (location.hash || '#')
      location.hash = hash
  @serialize: (oscs) ->
    ( osc.freq for osc in  oscs).join(',')

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
    @freq = + @container.find('input').val()
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

  add_sin = (pitch) ->
    $new_container = if $('.osc:last')[0] then $('.osc:last').clone() else $($.parseHTML($('#osc-template').html()))
    $pitch = $new_container.find('input[name="pitch"]')
    $pitch.val(if pitch then pitch else $pitch.val() * 1.1)

    $('.oscs').append $new_container
    oscs.push new Sin($new_container)

  pitches = Music.load()
  if pitches.length > 0
    add_sin(pitch) for pitch in pitches
  else
    add_sin()

  timer = T "interval", 50, ->
    oscs = (osc for osc in oscs when osc.alive())
    for osc in oscs
      osc.load()

    Music.save(oscs)

  $('.add').click ->
    add_sin()

  timer.on()

  $('.share').click ->
    window.open "https://twitter.com/share?" + $.param
      url: location.href
      text: "曲できた"