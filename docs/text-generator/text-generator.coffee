class TextGenerator
  constructor: (@source, @gram_length) ->
    @gram_length ||= 3
    @prepare()

  prepare: ->
    @table = {}
    last_node = @source.slice(0, @gram_length)
    for index in [1..@source.length - @gram_length]
      current_node = @source.slice(index, index + @gram_length)
      @table[last_node] ?= []
      @table[last_node].push(current_node)
      last_node = current_node

  get: ->
    @last_selected ?= @get_first()
    @last_selected = @get_next_of(@last_selected)
    @last_selected[@last_selected.length-1]

  get_from_text: (text) ->
    return '' unless text && text.length

    node = @get_next_of(text)
    return text unless node
    text + node[node.length-1]

  get_first: ->
    @selectRandom(_.keys(@table))

  get_next_of: (text)->
    node = text.slice(text.length - @gram_length, text.length)
    return null unless @table[node] && @table[node].length
    @table[node][Math.floor(Math.random() * @table[node].length)]

  selectRandom: (list) ->
    list[Math.floor(Math.random() * list.length)]
