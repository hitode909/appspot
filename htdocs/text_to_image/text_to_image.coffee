class TextToImage

  constructor: ->
    @text = ''
    @font = undefined
    @lineHeight = 1.2
    @width = undefined
    @color = undefined
    @background = undefined

  createImage: (type, quality) ->
    img = document.createElement('img')
    img.src = @createDataURL(type, quality)
    img

  createDataURL: (type, quality) ->
    @createCanvas().toDataURL(type, quality)

  createCanvas: ->
    canvasSize = @_calculateCanvasSize()
    canvasWidth = canvasSize.width
    canvasHeight = canvasSize.height

    canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    ctx = canvas.getContext('2d')
    color = @color || ctx.fillStyle
    if @background
      ctx.fillStyle = @background
      ctx.fillRect 0, 0, canvasWidth, canvasHeight
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = color
    ctx.font = @font if @font

    fontSize = @_getFontSizeFromFont(ctx.font)
    positionX = 0
    positionY = 0

    nextLine = =>
      positionX = 0
      positionY = positionY + fontSize * @lineHeight

    for char in @text.split('')
      charWidth = (ctx.measureText char).width
      nextLine() if positionX + charWidth > canvasWidth
      nextLine() if char == "\n"
      continue if char == "\n"
      ctx.fillText(char, positionX, positionY)
      positionX += charWidth

    canvas

  _getFontSizeFromFont: (font) ->
    [_, size] = font.match(/(\d+)px/)
    +size

  _calculateCanvasSize: ->
    canvas = document.createElement('canvas')

    ctx = canvas.getContext('2d')
    ctx.font = @font if @font

    fontSize = @_getFontSizeFromFont(ctx.font)
    positionX = 0
    positionY = 0
    maxX = 0

    nextLine = =>
      positionX = 0
      positionY = positionY + fontSize * @lineHeight

    for char in @text.split('')
      charWidth = (ctx.measureText char).width
      nextLine() if @width? and positionX + charWidth > @width
      nextLine() if char == "\n"
      continue if char == "\n"
      positionX += charWidth
      maxX = positionX if positionX > maxX

    width: @width || maxX
    height: positionY + fontSize * @lineHeight
