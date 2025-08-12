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

flatten = (a) ->
  [].concat.apply([], a)

class Filter
  constructor: (@width, @height) ->
    @canvas = document.createElement('canvas')
    @canvas.width = @width
    @canvas.height = @height
    @ctx = @canvas.getContext '2d'
    @kernels = []
    @flatten_kernels = []

  setKernel: (kernel, rgb) ->
    @kernels[rgb] = kernel
    @flatten_kernels[rgb] = flatten(kernel)

  process: (image, width, height, cb) ->
    @ctx.drawImage(image, 0, 0, width, height, 0, 0, @width, @height)

    bitmap = @ctx.getImageData(0, 0, @width, @height)

    result = @ctx.createImageData @width, @height

    kernel_size = @kernels[0][0].length
    kernel_radius = @kernels[0][0].length-1 / 2

    for y in [1..@height-2]
      offset_px_y = y * @width
      for x in [1..@width-2]
        offset_px_x = x
        sliced = @ctx.getImageData(x-kernel_radius, y-kernel_radius, kernel_size, kernel_size).data

        index = (offset_px_y + offset_px_x) * 4

        for offset_rgb in [0..2]
          kernel = @flatten_kernels[offset_rgb]
          continue unless kernel
          v = 0
          for i in [0..kernel.length-1]
            v += (sliced[i*4]*0.29+sliced[i*4+1]*0.58+sliced[i*4]*0.11) * kernel[i]
          v *= -1 if v < 0
          v = 255 if v > 255
          result.data[index+offset_rgb] = v

        # alpha channel
        result.data[index+3] = 255

    @ctx.putImageData result, 0, 0

    cb @canvas.toDataURL()

main = ->
  video = document.querySelector('#video')
  img = document.querySelector('#screen')
  filter = null

  process = ->
    return unless video.videoWidth

    unless filter
      scale = 0.25
      filter = new Filter(video.videoWidth * scale, video.videoHeight * scale)

      filter.setKernel [
        [-1, -2, -1],
        [0, 0, 0],
        [1,2, 1],
      ], 0
      filter.setKernel [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ], 1

    filter.process video, video.videoWidth, video.videoHeight, (url) ->
      img.src = url


  success = (stream)->
    video = document.querySelector('#video')
    video.src = window.URL.createObjectURL(stream)
    video.play()

  error = ->
    alert 'error'

  if navigator.webkitGetUserMedia
    navigator.webkitGetUserMedia({video:true}, success, error)
  else
    navigator.mozGetUserMedia({video:true}, success, error)

  animationLoop = ->
    process()
    window.requestAnimationFrame(animationLoop)

  animationLoop()

main()
