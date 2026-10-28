getArgs = ->
  args =
    strokeWeight: + $('#stroke-weight').val()
    radiusDiff: + $('#radius-diff').val()
    radianDiff: + $('#radian-diff').val()
    radiusNoiseDiff: + $('#radius-noise-diff').val()

render = (processing) ->

  processing.setup = ->
    processing.size(500, 500)
    processing.frameRate(12)

  processing.draw = ->
    center =
      x: processing.width / 2
      y: processing.height / 2

    args = getArgs()
    processing.background(255)
    processing.stroke(255, 0, 0)
    processing.smooth()
    processing.strokeWeight(args.strokeWeight*10)

    lastX = null
    lastY = null
    radian = 0.0
    radius = 1.0
    radiusNoiseTime = 0.0
    time = 0
    currentRadius = 0
    while ++time < 5000 and Math.abs(currentRadius) < Math.abs(center.x)
      radius += args.radiusDiff
      radian += args.radianDiff
      radiusNoiseTime += args.radiusNoiseDiff

      currentRadius = radius * processing.noise(radiusNoiseTime)
      currentX = center.x + Math.sin(radian) * currentRadius
      currentY = center.y + Math.cos(radian) * currentRadius

      if lastX and lastY
        processing.line(lastX, lastY, currentX, currentY)

      lastX = currentX
      lastY = currentY

save = ->
  link = document.createElement('a')
  link.href = $('#screen').get(0).toDataURL('image/png')
  link.download = '謹賀新年2013.png'
  link.click()

$ ->
  new Processing($('#screen').get(0), render)

  $('#save').click ->
    save()