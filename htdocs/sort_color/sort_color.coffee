$ ->

  num_to_color = (num) ->
    '#' + ('000000' + (+num).toString(16))[-6..-1]

  load_img_to_canvas = (img) ->
    item_container = $('<div>')
      .addClass 'item'

    $('#image-container')
      .empty()
      .append(item_container)

    $canvas = $('<canvas>')
      .addClass('image')
    item_container.append $canvas
    canvas = $canvas[0]
    canvas.width = img.width
    canvas.height = img.height
    ctx = canvas.getContext('2d')
    ctx.drawImage img, 0, 0

    item_container

  histogram = (container) ->
    canvas = container.find('canvas')[0]
    ctx = canvas.getContext('2d')
    img_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    data = img_data.data
    len = data.length
    table = {}

    i = 0
    while i < len
      v = (data[i] << 16) + (data[i+1] << 8) + (data[i+2])
      table[v] ?= 0
      table[v]++
      i+= 4

    list = []
    for color, count of table
      list.push [color, count]

    famous_colors = list.sort (a, b) ->
      return 0 if a[1] == b[1]
      if a[1] < b[1] then 1 else -1


    displayed_colors_length = 0

    base = canvas.width * canvas.height

    stripe_container = $('#stripe-container')
    stripe_container.empty()

    for color in famous_colors
      width = color[1] * 5  / canvas.width
      break if width < 1
      displayed_colors_length++
      $('<span>')
        .addClass('color')
        .attr
          'data-color': num_to_color(color[0])
        .css
          display: 'inline-block',
          width: width
          height: canvas.height
          background: num_to_color(color[0])
        .appendTo(stripe_container)

    console.log "displayed #{ displayed_colors_length / famous_colors.length }, #{ displayed_colors_length} of  #{ famous_colors.length }"

  $(document).bind 'dragover', ->
    false

  $(document).bind 'drop', (jquery_event) ->
    event = jquery_event.originalEvent
    file = event.dataTransfer.files[0]
    reader = new FileReader
    reader.onload = ->
      img = new Image
      img.onload = ->
        histogram(load_img_to_canvas img)
      img.src = reader.result

    reader.readAsDataURL file

    false

  pick_color = (color) ->
    color_item =  $('<div>')
        .append(
          $('<span>')
            .addClass('color-sample')
            .css
              background: color
        ).append(color)

    $('#selected-colors').append color_item

  setup_click_color = ->
    $('body').on 'click', '.color', (event) ->
      color = $(this).attr('data-color')
      pick_color(color)

  setup_click_color()

  setup_cursor = ->
    offset = 15
    bg_color = '#ffffff'
    $(document).bind 'mousemove', (event)->
      $('.cursor-preview').remove()
      $('<span>').addClass('cursor-preview').appendTo($('body')).css
        left: event.pageX + offset
        top: event.pageY + offset
        'background-color': bg_color

      true

    $(document).on 'mousemove', '.color', (event)->
      bg_color = $(event.target).attr('data-color')
      true

    get_color_from_canvas = (canvas, x, y) ->
      ctx = canvas.getContext('2d')
      data = ctx.getImageData(x, y, 1, 1).data
      v = (data[0] << 16) + (data[1] << 8) + (data[2])
      num_to_color(v)

    $(document).on 'mousemove', 'canvas', (event)->
      canvas = event.target
      bg_color = get_color_from_canvas(canvas, event.offsetX, event.offsetY)
      true

    $(document).on 'click', 'canvas', (event) ->
      canvas = event.target
      color = get_color_from_canvas(canvas, event.offsetX, event.offsetY)
      pick_color(color)


  setup_cursor()

