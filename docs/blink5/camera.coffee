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
  process = ->
    canvas = $('canvas')[0]
    video = $('video')[0]
    ctx = canvas.getContext('2d')

    ctx.drawImage(video, 0, 0)

    imagedata = ctx.getImageData(Math.floor(canvas.width * Math.random()), Math.floor(canvas.height * Math.random()), 1, 1)
    document.body.style.background = "rgb(#{ imagedata.data[0] }, #{ imagedata.data[1] }, #{ imagedata.data[2] })"

  success = (stream)->
    video = $('video')[0]
    video.src = window.webkitURL.createObjectURL(stream);
    video.play()

  error = ->
    alert 'error'

  navigator.webkitGetUserMedia({video:true}, success, error);

  animationLoop = ->
    process()
    window.requestAnimationFrame(animationLoop)

  animationLoop()
