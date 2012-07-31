# todo
# chromeless player -> fallback -> normal player
# google pickerつかう

# ページやURLの操作
Page =
  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

  createQuery: (query) ->
    keys = (key for key of query).sort()
    ("#{encodeURIComponent(key)}=#{encodeURIComponent(query[key])}" for key in keys).join('&')

  createURL: (query) ->
    module = this
    location.protocol + '//' + location.host + location.pathname + '?' + module.createQuery(query)

# ビデオ読み込み，ループ
YoutubeLooper =
  ready: false
  player: null
  players: []
  activePlayer: null
  waitingPlayer: null
  playerLoaded: false
  seekToPosition: 5
  seekDuration: 1.0
  playingVideoId: null
  playingVideoUrl: null
  knowDuration: false
  seekPositionChanged: false

  setup: ->
    module = this
    return if module.ready
    module.setupLoop()
    window.onYouTubePlayerReady = (playerId) ->
      module.onYouTubePlayerReady(playerId)

    module.loadPlayer('player1')
    module.loadPlayer('player2')

    module.ready = true

  setSeekToPosition: (sec) ->
    module = this
    module.seekToPosition = Math.floor(+sec * 10) / 10
    $(module).trigger 'loopSetChanged'
    if module.waitingPlayer
      module.waitingPlayer.seekTo(module.seekToPosition, true)
      module.waitingPlayer.pauseVideo()

  setSeekDuration: (sec) ->
    module = this
    module.seekDuration = Math.floor(+sec * 100) / 100
    $(module).trigger 'loopSetChanged'

  setupLoop: ->
    module = this

    playerIndex = 0

    _.defer ->
      from = Date.now()
      doAfter = 500
      if module.playerLoaded
        # try
          if !module.knowDuration && module.player.getVideoUrl() != module.playingVideoUrl && module.player.getDuration() > 0
            module.knowDuration = true
            $(module).trigger 'videoDurationChanged', module.player.getDuration()
            module.playingVideoUrl = module.player.getVideoUrl()

          if module.player.getPlayerState() != 3 && module.allPlayersLoaded()
            playerIndex++
            player1 = module.players[playerIndex % 2]
            player2 = module.players[(playerIndex+1) % 2]
            module.activePlayer = player1
            module.waitingPlayer = player2

            if module.seekPositionChanged# && Math.abs(player1.getCurrentTime() - module.seekToPosition) > 0.5
              console.log 'more seek'
              module.seekPositionChanged = false
              player1.seekTo(module.seekToPosition, true)

            player1.playVideo()
            player2.pauseVideo()

            _.defer ->
              player1.style.visibility = 'visible'
              player2.style.visibility = 'hidden'
              player2.seekTo(module.seekToPosition, true)
              player2.pauseVideo()

            doAfter = module.seekDuration * 1000
          else
            console.log 'wait'

      console.log 'took', Date.now() - from
      setTimeout arguments.callee, doAfter
        # catch error
        #   console.log(error)

  onYouTubePlayerReady: (playerId) ->
    module = this
    console.log "ready #{playerId}"
    module.playerLoaded = true
    player = document.getElementById(playerId)
    player.addEventListener 'onError', "YoutubeLooper.onPlayerError"
    # player.addEventListener 'onStateChange', "YoutubeLooper.onPlayerStateChange"
    module.players.push player
    module.player = player

    if module.allPlayersLoaded()
      console.log "all players loaded"
      if module.playingVideoId
        module.playVideoById(module.playingVideoId)

  allPlayersLoaded: ->
    module = this
    module.players.length == 2

  onPlayerStateChange: (event) ->
    # console.log 'state change' , event

  onPlayerError: (event) ->
    $('.error').text("event error #{event}")


  playVideoById: (videoId) ->
    module = this
    unless module.playerLoaded
      module.playingVideoId = videoId
      return
    console.log "load #{videoId}"
    module.knowDuration = false
    module.eachPlayers (p) ->
      p.stopVideo()
      p.cueVideoById(videoId, module.seekToPosition)
      # p.playVideo()
    module.playingVideoId = videoId
    $(module).trigger 'loopSetChanged'

  loadPlayer: (playerId) ->
    params =
      allowScriptAccess: 'always'
    attrs =
      id: playerId

    swfobject.embedSWF "http://gdata.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=#{playerId}",playerId, "640", "360", "8", null, null, params, attrs

  eachPlayers: (job) ->
    module = this
    for player in module.players
      job(player)

  loadQuery: (query)->
    module = this
    query = Page.parseQuery(if query then query else location.search[1..-1])
    console.log query

    if query.start && +query.start >= 0
      # xxx
      $('#loop-from').attr('max', 999).val(query.start).trigger('change')

    if query.duration && +query.duration > 0
      # xxx
      $('#loop-duration').val(query.duration).trigger('change')

    if query.video
      module.playVideoById query.video

YoutubeSearcher =
  searchVideo: (query) ->
    module = this
    dfd = $.Deferred()

    $.ajax
      url: 'http://gdata.youtube.com/feeds/api/videos'
      data:
        q: query
        alt: 'json-in-script'
        format: 5
        v: 2
      dataType: 'jsonp'
    .success (res) ->
      console.log res.feed.entry
      dfd.resolve (new module.Video(video_data) for video_data in res.feed.entry)

    dfd.promise()

class YoutubeSearcher.Video
  constructor: (data) ->
    @data = data

  videoId: ->
    @data.media$group.yt$videoid.$t

  title: ->
    @data.title.$t

  duration: ->
    @data.media$group.media$duration.$t

  thumbnailUrl: ->
    @data.media$group.media$thumbnail[0].url

class YoutubeSearcher.Loop
  constructor: (data) ->
    @data = data

  isValid: ->
    @data.video? and @data.start? and +@data.start >= 0 and @data.duration? and +@data.duration >= 0

  videoId: ->
    @data.video

  query: ->
    Page.createQuery(@data)

  url: ->
    Page.createURL(@data)

  thumbnailUrl: ->
    "http://img.youtube.com/vi/#{@videoId()}/0.jpg"

# todo: cache control
Gallery =
  validate: (v) ->
    query = Page.parseQuery v
    query.video? and query.start? and +query.start >= 0 and query.duration? and +query.duration >= 0

  cache: null

  clearCache: ->
    module = this
    module.cache = null

  receive: ->
    module = this
    dfd = $.Deferred()

    if module.cache
      console.log 'cache hit'
      dfd.resolve(module.cache)
      return dfd.promise()

    $.ajax
      type: 'get'
      url: 'http://gigaschema.appspot.com/hitode909/youtube_loop.json'
      success: (res) ->
        items = (new YoutubeSearcher.Loop(Page.parseQuery(item.value)) for item in res.data)
        module.cache = _.filter items, (item) ->
          item.isValid()
        dfd.resolve module.cache

    dfd.promise()

  post: (video, start, duration) ->
    module = this
    dfd = $.Deferred()

    query = Page.createQuery
      video: video
      start: start
      duration: duration

    module.receive().then (items) ->
      duplicate = _.find items, (item) ->
        item.query() == query

      if duplicate
        dfd.reject()
        return

      $.ajax
        type: 'post'
        url: 'http://gigaschema.appspot.com/hitode909/youtube_loop.json'
        data:
          value: query
          api_key: '094296d4fa1fc69200be31ba007b350c0afb2a5c'
        complete: (res) ->
          dfd.resolve()

    dfd.promise()

  setupRecentLoops: ->
    module = this

    template = _.template($('#recent-gallery-item-template').text())
    module.receive().then (items) ->
      tags = ''
      for item in items
        tags += template
          loop: item
      $("#recent-loops").empty().append tags

  setupRecentLoopsClick: ->
    $('#recent-loops').on 'click', '.loop', (event) ->
      query = $(this).attr('data-query')
      history.pushState(query, query, '?'+query)
      YoutubeLooper.loadQuery query
      false

bindLoopControllerEvents = ->
  $(document.body)
  .on 'change', '#loop-from', _.throttle ->
    console.log 'change'
    YoutubeLooper.setSeekToPosition($('#loop-from').val())
    pos = YoutubeLooper.seekToPosition
    min = Math.floor(pos / 60)
    min = "0#{min}" if min < 10
    sec1 = Math.floor(pos % 60)
    sec1 = "0#{sec1}" if sec1 < 10
    sec2 = Math.floor((pos*10)%10)
    $('#loop-from-value').text("#{min}:#{sec1}.#{sec2}")
  , 100

  $(document.body)
  .on 'change', '#loop-duration', _.throttle ->
    console.log 'change'
    YoutubeLooper.setSeekDuration($('#loop-duration').val())
    $('#loop-duration-value').text(YoutubeLooper.seekDuration)
  , 100

  $(YoutubeLooper)
  .on 'videoDurationChanged', (event, duration) ->
    console.log 'videoDurationChanged', duration
    $('#loop-from').attr
      max: duration

  $(document.body)
  .on 'click', 'button#position-left', ->
    $('#loop-from')
    .val(+$('#loop-from').val() - 0.1)
    .trigger('change')

  $(document.body)
  .on 'click', 'button#position-right', ->
    $('#loop-from')
    .val(+$('#loop-from').val() + 0.1)
    .trigger('change')

  $(document.body)
  .on 'click', 'button#position-left-loop', ->
    $('#loop-from')
    .val(+$('#loop-from').val() - ( + $('#loop-duration').val()))
    .trigger('change')

  $(document.body)
  .on 'click', 'button#position-right-loop', ->
    $('#loop-from')
    .val(+ $('#loop-from').val() + ( + $('#loop-duration').val()))
    .trigger('change')

  $(document.body)
  .on 'click', 'button#duration-left', ->
    $('#loop-duration')
    .val(+$('#loop-duration').val() - 0.01)
    .trigger('change')

  $(document.body)
  .on 'click', 'button#duration-right', ->
    $('#loop-duration')
    .val(+$('#loop-duration').val() + 0.01)
    .trigger('change')

  $(document.body)
  .on 'click', 'button#duration-double', ->
    $('#loop-duration')
    .val(+$('#loop-duration').val() * 2.0)
    .trigger('change')

  $(document.body)
  .on 'click', 'button#duration-half', ->
    $('#loop-duration')
    .val(+$('#loop-duration').val() * 0.5)
    .trigger('change')

  _.defer ->
    $('#loop-from').val(YoutubeLooper.seekToPosition).trigger('change')
    $('#loop-duration').val(YoutubeLooper.seekDuration).trigger('change')

bindLoadVideoFormEvents = ->
  $(document.body).on 'submit', 'form.load-video', (event) ->
    video_id = $(event.target).find('input.video-id').val()
    YoutubeLooper.playVideoById(video_id)

    # dry
    query = Page.createQuery
      video: YoutubeLooper.playingVideoId
      start: YoutubeLooper.seekToPosition
      duration: YoutubeLooper.seekDuration

    history.pushState query, query, '?'+query

    setTweetLink()

    false


setupUrlShare = ->
  $(YoutubeLooper)
  .on 'loopSetChanged', (event) ->
    # dry
    return unless YoutubeLooper.playingVideoId
    query = Page.createQuery
      video: YoutubeLooper.playingVideoId
      start: YoutubeLooper.seekToPosition
      duration: YoutubeLooper.seekDuration

    history.replaceState query, query, '?'+query

    setTweetLink()

setupSelectOnClick = ->
  $(document.body).on 'click', 'input.select-on-click', (event) ->
    event.target.select()
    false

  $(document.body).on 'click', 'label.select-on-click', (event) ->
    $(event.target).find('input.select-on-click')[0].select()

setupSearch = ->
  template = _.template($('#search-result-template').text())

  $('#search-form').submit ->
    try
      keyword = $('#search-keyword').val()
      return false unless keyword
      $('#search-results').empty()
      $('#searching').text(keyword + '...').show()
      YoutubeSearcher.searchVideo(keyword).then (videos) ->
        $('#searching').hide()
        tags = ''
        for video in videos
          tags += template
            video: video
        $('#search-results').append tags
    false

  $('#search-results').on 'click', '.video', (event) ->
    target = if $(event.target).is('.video') then $(event.target) else $(event.target).parents('.video')
    videoId = target.attr('data-video-id')
    console.log 'play', videoId

    YoutubeLooper.playVideoById(videoId)

    # dry
    query = Page.createQuery
      video: YoutubeLooper.playingVideoId
      start: YoutubeLooper.seekToPosition
      duration: YoutubeLooper.seekDuration

    history.pushState query, query, '?'+query

    setTweetLink()

setupPopState = ->
  $(window).on 'popstate', (event) ->
    query = event.originalEvent.state
    YoutubeLooper.loadQuery query

setupSaveLoop = ->
  $('#save-loop').click ->
    return unless YoutubeLooper.playingVideoId

    $('#save-loop').attr('disabled', true)
    Gallery.clearCache()
    Gallery.post(YoutubeLooper.playingVideoId, YoutubeLooper.seekToPosition, YoutubeLooper.seekDuration).then ->
      Gallery.clearCache()
      Gallery.setupRecentLoops()

      $message = $('<span>').addClass('message').text('保存しました')
      $('#save-loop').after($message)

      setTimeout ->
        $message.remove()
      , 3000


    .always ->
        $('#save-loop').attr('disabled', false)

setTweetLink = ->
  text = 'ループしました'
  url = location.href
  share_url = "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
  $("a#tweet-loop").show().attr
    href: share_url

setup = ->
  bindLoopControllerEvents()
  bindLoadVideoFormEvents()
  YoutubeLooper.loadQuery()
  setupUrlShare()
  YoutubeLooper.setup()
  setupSelectOnClick()
  setupSearch()
  Gallery.setupRecentLoops()
  Gallery.setupRecentLoopsClick()
  setupPopState()
  setupSaveLoop()

$ ->
  setup()
