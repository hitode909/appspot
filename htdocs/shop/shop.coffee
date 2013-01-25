setup = ->
  bind_events = ->
    ($(document).find '.shop-item').draggable
      handle: '.shop-image'

    ($(document).find '.delete').click ->
      $(this).parents('.shop-item').hide()

  new_shop_item = (image_url, title) ->
    template = _.template($('#shop-item-template').text())

    shop_item = $(
      template
        image_url: image_url
        title: title
    )

    $('.items').append shop_item

    shop_item.css
      left: Math.random()*300
      top: Math.random()*300

    bind_events()

  get_image = (word) ->
    dfd = $.Deferred()

    search = new google.search.SearchControl()
    search.setResultSetSize google.search.Search.LARGE_RESULTSET
    search.addSearcher (new google.search.ImageSearch)

    search.setSearchCompleteCallback this, (sc, searcher) ->
      dfd.resolve searcher.results
    search.draw()
    search.execute(word)
    dfd.promise()

  search_and_append = (word) ->
    dfd = $.Deferred()
    get_image(word).then (res) ->
      for item in res
        new_shop_item item.tbUrl, item.contentNoFormatting
      dfd.resolve()

    dfd.promise()

  setup_search = ->
    $(document).find("button.search").click ->
      query = $(document).find("input.search").val()
      return unless query

      search_and_append(query)

  setup_search()

  add_pop = (word) ->
    pop = $('<span>')
      .addClass('pop')
      .text(word)
      .appendTo($('.items'))
      .css
        left: Math.random()*300
        top: Math.random()*300


    pop.draggable()

  setup_pop = ->
    $('button.add-pop').click ->
      add_pop($('.pop-input').val())

  setup_pop()

google.load "search", "1"
google.setOnLoadCallback ->
  setup()
