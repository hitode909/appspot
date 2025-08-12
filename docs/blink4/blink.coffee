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

$ ->
  $(document.body).click ->
    window.requestAnimationFrame = (callback, element) ->
      window.setTimeout ->
        callback()
      , 1000 / 6

  rand = (max) ->
    Math.floor(Math.random() * max)

  setColor = ->
    return unless window.$canvas
    canvas = window.$canvas[0]
    ctx = window.$canvas[0].getContext('2d')
    imagedata = ctx.getImageData(Math.floor(canvas.width * Math.random()), Math.floor(canvas.height * Math.random()), 1, 1)
    document.body.style.background = "rgb(#{ imagedata.data[0] }, #{ imagedata.data[1] }, #{ imagedata.data[2] })"

  animationLoop = ->
    setColor()
    window.requestAnimationFrame(animationLoop)

  animationLoop()

  $(document.body).click ->
    window.requestAnimationFrame = (callback, element) ->
      window.setTimeout ->
        callback()
      , 1000 / 6

  resize_to_fit = (x1, y1, x2, y2) ->
    return [x1, y1] if x1 <= x2 and y1 <= y2
    rate = _.min [x2 / x1, y2 / y1]
    return _.map [x1, y1], (v) -> Math.floor(v * rate)

  load_img_to_canvas = (img) ->
    item_container = $('<div>')
    .addClass 'item'

    $('#image-container')
    .append(item_container)

    $canvas = $('<canvas>')
    .addClass('image')

    canvas = $canvas[0]
    canvas.width = img.width
    canvas.height = img.height
    ctx = canvas.getContext('2d')
    ctx.drawImage img, 0, 0, img.width, img.height, 0, 0, img.width, img.height

    $canvas

  image_url_prepared = (url) ->
    img = new Image
    img.onload = ->
      $('.item').remove()
      $('#stripe-container').empty()
      $('body').removeClass('hovering')
      $('body').addClass('dropped')
      $canvas = load_img_to_canvas img
      window.$canvas = $canvas
      $(document.body).empty().append($canvas)
    img.onerror = ->
      alert "画像の読み込みに失敗しました．時間をおいて試してみてください．"
    img.src = url

  file_dropped = (file) ->
    unless window.FileReader
      alert("お使いのブラウザはファイル読み込みに対応していません．画像URLを指定すると読み込めます．Google ChromeかFirefoxなら画像をドロップで読み込めます．")
      return
    reader = new FileReader
    reader.onload = ->
      image_url_prepared reader.result
    reader.readAsDataURL file

  setup_drop = ->
    enter_counter = 0
    dragging_img_src = null

    $(document)
    .on 'dragstart', (jquery_event) ->
      event = jquery_event.originalEvent
      if event.target.src
        dragging_img_src = event.target.src
      if $(event.target).find('img')
        dragging_img_src = $(event.target).find('img')[0].src
      else
        dragging_img_src = null
      true
    .on 'dragover', ->
      false

    .on 'dragleave', ->
      if enter_counter > 0
        enter_counter--
      if enter_counter == 0
        $('body').removeClass('hovering')
      false

    .on 'dragenter', ->
      enter_counter++
      if enter_counter == 1
        $('body').addClass('hovering')
      false

    .on 'drop', (jquery_event) ->
      enter_counter = 0
      $('body').removeClass('hovering')
      event = jquery_event.originalEvent

      if event.dataTransfer.files.length > 0
        file = event.dataTransfer.files[0]
        file_dropped(file)

      false

  setup_drop()
