class Nagameru
  constructor: (name) ->
    @name = name

  fetch: ->
    received = $.Deferred()

    API_KEY = 'uFWEhQ88W0vkFQ6c5lpya5uWlFQ2AXUYL4yrQzXNsmUeD6qVQO'
    LIMIT = 20

    crawl = (offset) =>
      console.log "fetch from #{offset}"
      req = $.ajax
        type: 'get'
        dataType: 'jsonp'
        url: "http://api.tumblr.com/v2/blog/#{@name}.tumblr.com/posts"
        data:
          api_key: API_KEY
          type: 'photo'
          limit: LIMIT
          offset: offset
      req.done (res) ->
        received.notify res.response.posts
        if offset < 200
          crawl offset + LIMIT

    crawl 0

    do received.promise

class NagameruView
  constructor: ($container) ->
    @$container = $container
    @$stage = $container.find '.js-stage'
    @$pool = $container.find '.js-pool'
    @$loopFrom = $container.find '.js-loop-from'
    @$loopSize = $container.find '.js-loop-size'
    @$shuffle = $container.find '.js-shuffle'
    @$photos = []
    @index = 0

  loadPost: (post) ->
    $img = $ '<img>'
    $img.attr 'src', post.photos[0].original_size.url
    $img.on 'load', =>
      @$photos.push $img
      @$pool.append $img

  step: ->
    if @$shuffle.prop 'checked'
      @index = Math.floor(@$photos.length * Math.random())
    else
      from = Math.floor(@$photos.length * parseFloat(@$loopFrom.val()))
      to = Math.floor(@$photos.length * (parseFloat(@$loopFrom.val()) + parseFloat(@$loopSize.val())))

      @index++
      @index = from if @index < from
      @index = from if @index > to
      @index -= @$photos.length if @index >= @$photos.length
      @index = 0 if @index < 0

    $photo = @$photos[@index]
    if $photo
      @$stage.css 'background-image', "url(#{ $photo.attr('src') })"

class Tapper
  constructor: ($container) ->
    @$container = $container
    @$speedInput = $container.find '.js-speed'
    @step = 500
    @times = []
    @tapMax = 4
    @$$highSpeed = $ '.js-high-speed'

    do @tap

  tap: ->
    $(@).triggerHandler 'tap'
    do @pause

    @step = @$speedInput.val()

    @timer = setTimeout =>
      do @tap
    , @step

  pause: ->
    clearTimeout @timer if @timer

  click: ->
    @times.push do Date.now
    do @times.shift if @times.length > @tapMax
    do @updateStep
    @tap()

  updateStep: ->
    return unless @times.length > 1
    prev = @times[0]
    total = 0
    for time in @times
      diff = time - prev
      total += diff
      prev = time
    @step = total / (@times.length-1)
    @$speedInput.val @step

decodeParam = `function (data) {
    var params = {};
    var values = data.split('&');
    for (var i = 0, len = values.length; i < len; i++) {
        if (!values[i].match(/[=]/)) continue;
        var kv = values[i].split('=');
        var key = decodeURIComponent(kv[0]);
        var val = kv[1].replace(/\+/g, ' ');
        if (!params[key]) params[key] = [];
        params[key].push(decodeURIComponent(val));
    }
   return params;
};`

$ ->
  params = decodeParam(location.search.slice(1))
  if !params.user
    params.user = 'hitode909'
  console.log params.user
  ng = new Nagameru params.user
  ngview = new NagameruView ($ document.body)
  tapper = new Tapper ($ document.body)

  ng.fetch().progress (posts) ->
    for post in posts
      ngview.loadPost post

  $('.js-stage').on 'mousedown', ->
    do tapper.click

  ($ tapper).on 'tap', ->
    do ngview.step
