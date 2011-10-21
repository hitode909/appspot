sample_8bit_to_float = (v) ->
  v / 128 - 0.5

play = ->
  channel = 1
  stream_length = 4096
  context = new webkitAudioContext()
  node = context.createJavaScriptNode(stream_length, 1, channel)
  time_count = 0
  last_t = 0
  value = 0
  plot_at = 0
  sample_value = 0.0
  canvas = $('canvas#plot')
  canvas_context = canvas[0].getContext('2d')
  canvas_width = canvas.width()
  canvas_height = canvas.height()
  fun = -> 0

  update_sample = (t)->

    value = fun(t) % 255
    sample_value = sample_8bit_to_float(value)

    plot_at++
    canvas_context.fillStyle = "rgb(#{value}, 0, 0)"
    x = Math.floor(plot_at / canvas_width) % canvas_width
    y = plot_at % canvas_height
    canvas_context.fillRect(x, y, 1, 1)

  node.onaudioprocess = (event) ->
    data = event.outputBuffer.getChannelData(0)
    len = data.length
    sampling_rate = $('input[name="sampling-rate"]:checked').val()
    try
      v = $("#f").val()
      fun = eval("(function(t){return " + v + ";})")


    for i in [0..len]
      t = Math.floor(time_count * sampling_rate / 44100)
      if t != last_t
        update_sample(t)
        last_t = t
      data[i] = sample_value
      time_count++

  node.connect(context.destination)

$ ->
  unless webkitAudioContext
    $('#message').text('Please visit this page with Google Chrome.')
  else
   play()