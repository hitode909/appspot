$ ->

  load_img_to_canvas = (img) ->
    item_container = $('<div>')
      .addClass 'item'

    $('body').append(item_container)

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

    for color in famous_colors
      width = color[1] * 5  / canvas.width
      break if width < 1
      $('<span>')
        .addClass('color')
        .attr
          title: '#' + (+color[0]).toString(16) + " (#{ color[1] })"
          'data-color': '#' + (+color[0]).toString(16)
        .css
          display: 'inline-block',
          width: width
          height: canvas.height
          background: '#' + (+color[0]).toString(16)
        .appendTo(container)

  $(document).bind 'dragover', ->
    false

  $(document).bind 'drop', (jquery_event) ->
    event = jquery_event.originalEvent
    for file in  event.dataTransfer.files
      do ->
        reader = new FileReader
        reader.onload = ->
          img = new Image
          img.onload = ->
            histogram(load_img_to_canvas img)
          img.src = reader.result

        reader.readAsDataURL file

    false

  setup_click_color = ->
    $('body').on 'click', '.color', ->
      color = $(this).attr('data-color')
      container = $(this).parents('.item')
      container.append(
        $('<div>')
          .append(
            $('<span>')
              .addClass('color-sample')
              .css
                background: color
          ).append(color)
      )

  setup_click_color()

