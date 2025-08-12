$ ->

  num_to_color = (num) ->
    '#' + ('000000' + (+num).toString(16))[-6..-1].toLowerCase()

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

    famous_colors = (list.sort (a, b) ->
      return 0 if a[1] == b[1]
      if a[1] < b[1] then 1 else -1
    )[0..500]

    displayed_colors_length = 0

    base = canvas.width * canvas.height

    stripe_container = $('#stripe-container')
    stripe_container.empty()

    total = 0
    for color in famous_colors
      total += color[1]

    stripe_width = $('#stripe-container').width()
    width_total = 0
    for color in famous_colors
      rate = (color[1] / total)
      width = Math.ceil(stripe_width * rate)
      width = 1 if width < 1
      width_total += width
      break if width_total > stripe_width
      console.log width
      displayed_colors_length++
      $('<span>')
        .addClass('color stripe')
        .attr
          'data-color': num_to_color(color[0])
        .css
          display: 'inline-block',
          width: width
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
    delete_button = $('<img>')
      .addClass('delete-button')
      .attr
        src: 'delete.png'
    color_item =  $('<div>')
        .addClass('picked-color-item')
        .append(
          $('<span>')
            .addClass('color-sample')
            .css
              background: color
        ).append(color)
        .append(delete_button)

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

      return unless bg_color

      $('<span>').addClass('cursor-preview').appendTo($('body')).css
        left: event.pageX + offset
        top: event.pageY + offset
        'background-color': bg_color

      bg_color = null

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

  setup_delete_button = ->
    $(document).on 'click', '.delete-button', (event) ->
      delete_button = $(event.target)
      item = delete_button.parents('.picked-color-item')
      item.slideUp 300, ->
        item.remove()

    $(document).on 'click', '#delete-all-button', (event) ->
      $('#selected-colors').fadeOut 300, ->
        console.log 'callback'
        $('#selected-colors')
         .empty()
         .css
           display: 'block'
           opacity: 1.0


  setup_delete_button()

