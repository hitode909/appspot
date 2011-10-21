convert = (v) ->
  (v % 256) / 128 - 0.5

play = ->
  channel = 2
  stream_length = 4096
  context = new webkitAudioContext()
  node = context.createJavaScriptNode(stream_length, 1, channel)
  console.log(node)
  t2 = 0

  node.onaudioprocess = (event) ->
    data = event.outputBuffer.getChannelData(0)
    len = data.length

    fun = -> 0

    try
      v = $("#f").val()
      fun = eval("(function(t){return " + v + ";})")

    sampling_rate = $('input[name="sampling-rate"]:checked').val()

    for i in [0..len]
      t = Math.floor(t2 * sampling_rate / 44100)
      data[i] = convert(fun(t))
      t2++

  node.connect(context.destination)

$ ->
  unless webkitAudioContext
    $('#message').text('Please visit this page with Google Chrome.')
  else
   play()