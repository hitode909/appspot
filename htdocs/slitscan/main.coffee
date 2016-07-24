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

class Filter
  constructor: (@width, @height) ->
    @canvas = document.createElement('canvas')
    @canvas.width = @width
    @canvas.height = @height
    @ctx = @canvas.getContext '2d'

  process: (image, width, height, cb) ->
    existing = @ctx.getImageData(0,0,@width-1, @height)
    @ctx.putImageData(existing, 1,0)
    @ctx.drawImage(image, Math.floor(@width/2), 0, 1, height, 0, 0, 1, @height)
    cb @canvas.toDataURL()

main = ->
  video = document.querySelector('#video')
  img = document.querySelector('#screen')
  filter = null

  process = ->
    return unless video.videoWidth

    unless filter
      scale = 1
      filter = new Filter(video.videoWidth * scale, video.videoHeight * scale)

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

  img.addEventListener('click', () ->
    new_img = document.createElement 'img'
    new_img.src = img.src
    document.body.appendChild(new_img)
  )


main()
