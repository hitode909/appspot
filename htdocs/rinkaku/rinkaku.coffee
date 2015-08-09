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
    @src = document.createElement('canvas')
    @src.width = @width
    @src.height = @height
    @src_ctx = @src.getContext '2d'

    @dst = document.createElement('canvas')
    @dst.width = @width
    @dst.height = @height
    @dst_ctx = @dst.getContext '2d'


  setKernel: (kernel) ->
    @kernel = kernel

  process: (image, width, height, cb) ->
    @clear()
    @src_ctx.drawImage(image, 0, 0, width, height, 0, 0, @width, @height)
    @dst_ctx.drawImage(image, 0, 0, width, height, 0, 0, @width, @height)

    bitmap = @src_ctx.getImageData(0, 0, @width, @height)

    result = @src_ctx.createImageData @width, @height

    kernel_size = @kernel[0].length
    kernel_radius = @kernel[0].length-1 / 2
    kernel = flatten(@kernel)

    for y in [20..@height-2]
      offset_px_y = y * @width
      for x in [20..@width-2]
        offset_px_x = x
        sliced = @src_ctx.getImageData(x-kernel_radius, y-kernel_radius, kernel_size, kernel_size).data

        index = (offset_px_y + offset_px_x) * 4

        for offset_rgb in [0..2]
          v = 0
          for i in [0..kernel.length-1]
            v += sliced[i*4+offset_rgb] * kernel[i]
          v = 255 if v > 255
          v = 0 if v < 0
          result.data[index+offset_rgb] = v

        # alpha channel
        result.data[index+3] = 255

      #   break
      # break

    @src_ctx.putImageData result, 0, 0

    cb @src.toDataURL()

  clear: ->
    for ctx in [@src_ctx, @dst_ctx]
      ctx.clearRect 0, 0, @width, @height

main = ->
  video = document.querySelector('#video')
  img = document.querySelector('#screen')

  filter = null

  process = ->
    return unless video.videoWidth

    unless filter
      scale = 0.25
      filter = new Filter(video.videoWidth * scale, video.videoHeight * scale)

      # emboss
      filter.setKernel [
        [-2, -1, 0],
        [-1, 1,  1],
        [0,  1,  2],
      ]

      # 縦
      filter.setKernel [
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1],
      ]
      # 横
      filter.setKernel [
        [-1, -1, -1],
        [0, 0, 0],
        [1,1, 1],
      ]

    filter.process video, video.videoWidth, video.videoHeight, (url) ->
      img.src = url

  success = (stream)->
    video = document.querySelector('#video')
    video.src = window.URL.createObjectURL(stream)
    video.play()

  error = ->
    alert 'error'

  navigator.webkitGetUserMedia({video:true}, success, error)

  animationLoop = ->
    process()
    setTimeout animationLoop, 100
    # window.requestAnimationFrame(animationLoop)

  animationLoop()

main()
