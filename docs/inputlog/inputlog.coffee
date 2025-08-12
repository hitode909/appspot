class InputHistory
  # name: key of storage
  constructor: (@name) ->
    @key = "InputHistory-#{@name}"
    @history = []
    @_loadHistory()

  # get all history items
  # [ {time, value} ]
  get: ->
    @history

  # get last history item
  # {time, value}
  last: ->
    @history[@history.length-1]

  # add history item
  # value: String
  add: (value) ->
    @history.push
      time: (new Date).getTime()
      value: value
    localStorage[@key] = JSON.stringify @history

  # clear history items
  clear: ->
    delete localStorage[@key]
    @history = []

  _loadHistory: ->
    stored = localStorage[@key]
    return unless stored?
    try
      parsed = JSON.parse stored
      for item in parsed
        throw 'time required' unless item.time?
        throw 'value required' unless item.value?
      @history = parsed
    catch error
      clear()
      return

$.fn.extend
  watchValue: ->
    input = this

    last_value = input.val()

    timer = null
    revision = 0
    start = =>
      stop()
      timer = setInterval =>
        current_value = input.val()
        if current_value != last_value
          last_value = current_value
          input.trigger 'change'
      , 100

    stop = =>
      return unless timer
      clearInterval timer
      timer = null

    input.on 'focus', ->
      start()

    input.on 'blur', ->
      stop()

  # name: key of input
  logify: (name) ->
    input = this

    input.watchValue()

    history = new InputHistory(name)

    history_container = $('<ul>')
    history_container.addClass 'logify-history'
    input.after history_container

    # item: { time, value }
    line = (item) ->
      history_item = $('<li>')
      history_item.addClass 'logify-item'
      history_item.attr
        'data-value': item.value
        'data-time': item.time
        title: "#{new Date(item.time)}\n#{item.value}"
      history_item.text item.value
      history_container.prepend history_item

    for item in history.get()
      line(item)

    input.on 'change', ->
      value = input.val()
      if value != history.last()?.value
        history.add(value)
        line(history.last())

    history_container.on 'click', '.logify-item', ->
      input
        .val($(this).attr('data-value'))
        .change()

    reset = $('<button>')
    reset.text '履歴をクリア'
    input.after(reset)
    reset.click ->
      history.clear()
      history_container.empty()

$ ->
  $('textarea, input').each ->
    $(this).logify($(this).attr('id'))