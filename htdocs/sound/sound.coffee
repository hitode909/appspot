$ ->

  last_x = null
  $(document).on 'mousemove', 'canvas', (event) ->
    last_x = event.clientX

  setInterval ->
    console.log last_x
  , 100

  channel = 2
  stream_length = 4096
  context = new webkitAudioContext()
  node = context.createJavaScriptNode(stream_length, 1, channel)
  time_count = 0
  last_t = 0
  value = 0
  plot_at = 0
  sample_value = 0.0
  fun = -> 0


  node.onaudioprocess = (event) ->
    data1 = event.outputBuffer.getChannelData(0)
    data2 = event.outputBuffer.getChannelData(1)
    len = data1.length
    sampling_rate = $('input[name="sampling-rate"]:checked').val()

    for i in [0..len]
      t = Math.floor(time_count * sampling_rate / 44100)
      if t != last_t
        update_sample(t)
        last_t = t
      data1[i] = Math.sin(i *800) * 2 - 1.0
      data2[i] = Math.sin(i * 80) * 2 - 1.0

  node.connect(context.destination)
