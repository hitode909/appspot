window.requestAnimationFrame = (->
  window.requestAnimationFrame		||
  window.webkitRequestAnimationFrame	||
  window.mozRequestAnimationFrame		||
  window.oRequestAnimationFrame		||
  window.msRequestAnimationFrame		||
  (callback, element) ->
    window.setTimeout ->
      callback()
    , 1000 / 60
)()

GigaSchema =
  endpoint: 'http://gigaschema.appspot.com/hitode909/blink6.json'
  api_key: '1fafd791506648d93656432dd8c95bce81424367'
  list: ->
    dfd = $.Deferred()
    $.ajax(
      url: GigaSchema.endpoint
      # crossDomain: true
      type: 'GET'
      dataType: 'json'
    ).done (res) ->
      dfd.resolve res.data
    dfd

  getValue: (key) ->
    dfd = $.Deferred()

    $.ajax(
      url: "http://gigaschema.appspot.com/hitode909/blink6/#{key}.json"
      # crossDomain: true
      type: 'GET'
      dataType: 'json'
    ).done (res) ->
      dfd.resolve JSON.parse res.value

    dfd

  save: (frames) ->
    dfd = $.Deferred()

    $.ajax(
      url: GigaSchema.endpoint
      # crossDomain: true
      type: 'POST'
      data:
        value: JSON.stringify(frames)
        api_key: GigaSchema.api_key
      dataType: 'json'
    ).done (res) ->
      dfd.resolve(res.data[0].key)

    dfd

$ ->
  $input_color = $('input#color-input')
  $body = $('body')

  playingFrames = []
  playingFrame = 0
  edit_session = null

  reset_edit_session = ->
    if edit_session
      clearTimeout(edit_session)
    else
      playingFrames = []
      playingFrame = 0
    edit_session = setTimeout ->
      edit_session = null
      GigaSchema.save(playingFrames).done (key) ->
        location.hash = key
        addToGallery(key, playingFrames)
    , 500

  $input_color.on 'change', ->
    reset_edit_session()
    color = $input_color.val()
    playingFrames[playingFrame] = color
    $body.css
      background: color

  animations = []
  process = ->
    for animation in animations
      animation()
  animationLoop = ->
    process()
    window.requestAnimationFrame(animationLoop)
  registerAnimation = (f) ->
    animations.push f

  registerAnimation ->
    playingFrame++
    playingFrame = 0 if playingFrame > playingFrames.length and ! edit_session
    if playingFrames[playingFrame]
      $body.css
        background: playingFrames[playingFrame]

  animationLoop()

  loadList = ->
    dfd = $.Deferred()
    GigaSchema.list().done (items) ->
      for item in items.reverse()
        addToGallery(item.key, JSON.parse(item.value))
      dfd.resolve()

  setupInitialState = ->
    if location.hash.length > 0
      loadList()
      GigaSchema.getValue(location.hash[1..-1]).done (gotFrames) ->
        playingFrames = gotFrames
    else
      loadList().done ->
        $('.gallery-item:eq(0)').triggerHandler('click')

  setupInitialState()

  addToGallery = (key, frames) ->
    $item = $('<div>').addClass('gallery-item').prependTo($('#gallery'))
    frame = 0
    registerAnimation ->
      frame++
      frame = 0 if frame > frames.length
      $item.css
        background: frames[frame]

    $item.on 'click', ->
      playingFrames = frames
      playingFrame = frame
      location.hash = key

  checkSupported = ->
    return if $('<input type="color">').val() == '#000000'
    $('<div>').addClass('message').text('blink6 supports Google Chrome').prependTo($('body'))
    $('.add').remove()

  checkSupported()