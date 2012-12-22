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
  rand = (max) ->
    if Math.random() > 0.5 then 255 else 0

  setColor = ->
    document.body.style.background = "rgb(#{ rand() }, #{ rand() }, #{ rand() })"

  animationLoop = ->
    setColor()
    window.requestAnimationFrame(animationLoop)

  animationLoop()

  $(document.body).click ->
    window.requestAnimationFrame = (callback, element) ->
      window.setTimeout ->
        callback()
      , 1000 / 6

