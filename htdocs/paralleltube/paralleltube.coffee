Page =
  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

Video =
  load_players: (n) ->
    for i in [0..n]
      this.load_player()

  load_player: ->
    playerId = 'video-' + Video.videoNumber++
    @container = $('<div>')
    @container.addClass('player')
    @container.attr('id', playerId)
    @container.appendTo($('.players'))

    params =
      allowScriptAccess: 'always'

    attrs =
      id: playerId

    swfobject.embedSWF "http://gdata.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=#{playerId}",playerId, "1280", "720", "8", null, null, params, attrs

  set_videos: (video_urls) ->
    module = this

    players = module.get_players()

    if video_urls.length > players.length
      # load more
      module.load_players(video_urls.length - players.length)
      setTimeout ->
        module.set_videos video_urls
      , 500

      return

    if module.loadedPlayers != players.length
      # wait
      setTimeout ->
        module.set_videos video_urls
      , 500

      return

    module.pauseAllPlayers()

    _.each _.zip(this.get_players(), video_urls), (pair) ->
      [player, url] = pair
      return unless player and url
      player.cueVideoById(url) #???

    Video.playingVideosCount = video_urls.length

  pauseAllPlayers: ->
    module = this

    players = module.get_players()

    _.each players, (player) ->
      try
        player.pauseVideo()
        $(player).css
          opacity: 0
      catch error
        # console.log error

  get_players: ->
    $('.players object')

  videoNumber: 1
  playingVideosCount: 0
  playingVideosOffset: 0
  loadedPlayers: 0

  toggleVideo: ->
    module = this
    players = module.get_players()

    _.each players, (player) ->
      try
        player.pauseVideo()
        $(player).css
          opacity: 0
      catch error

    playing_player = players[module.playingVideosOffset]
    playing_player.playVideo()
    $(playing_player).css
          opacity: 1

    module.playingVideosOffset++
    module.playingVideosOffset = 0 if module.playingVideosOffset > module.playingVideosCount - 1

  error: (error) ->
    # console.log error

  setup: ->

    window.onYouTubePlayerReady = ->
      Video.loadedPlayers++

    setInterval ->
      Video.toggleVideo()
    , 1000

main = ->
  Video.setup()
  Video.load_players(1)

  createShareURL = (videos) ->
      url = "http://hitode909.appspot.com/paralleltube/#" + encodeURIComponent(videos.join(' '))
      text = '#paralleltube'
      "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"

  play_videos = (video_urls) ->

    location.hash = encodeURIComponent(video_urls.join " ")
    $('form#videos-form').find('textarea').val(video_urls.join " ")

    $('form#videos-form a.share').attr('href', createShareURL(video_urls))

    Video.set_videos(video_urls)

  normalize_video_id = (str) ->
    match = str.match(/\?(.*)/)
    return str unless match
    query = Page.parseQuery(match[1])
    if query['v']
      query['v']
    else
      str

  bind_events = ->

    fill_from_hash = ->
      return false unless location.hash.length > 0
      keyword = location.hash.replace /^#/, ''
      $('form#videos-form textarea').val(decodeURIComponent(keyword))
      _.defer ->
        $('form#videos-form').trigger('submit')
      true

    fill_default = ->
      $('form#videos-form textarea').val(decodeURIComponent('e2GvmCfyYgw cPmmqBK8prM'))
      _.defer ->
        $('form#videos-form').trigger('submit')

    fill_from_hash() || fill_default()


    $('form#videos-form').submit (event) ->
      _.defer ->
        play_videos _.map($('form#videos-form').find('textarea').val().split(/\s+/), normalize_video_id)
      false

  bind_events()

$ ->
  main()