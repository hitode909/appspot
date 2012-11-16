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
    Math.floor(Math.random() * max)

  setColor = ->
    document.body.style.background = "rgb(#{ rand(256) }, #{ rand(256) }, #{ rand(256) })"

  animationLoop = ->
    setColor()
    window.requestAnimationFrame(animationLoop)

  animationLoop()

  $(document.body).click ->
    window.requestAnimationFrame = (callback, element) ->
      window.setTimeout ->
        callback()
      , 1000 / 6

