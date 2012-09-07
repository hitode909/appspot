Page =
  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query


$ ->

  load_bg = ->
    query = Page.parseQuery(location.search[1..-1])
    return unless query.url
    $('input[name="url"]').val(query.url)
    $('input[name="repeat"]').prop('checked', query.repeat)
    is_repeat = if query.repeat then 'repeat' else 'no-repeat'
    $(document.body).css
      'background': "url('#{query.url}')"
      'background-position': 'center'

    if query.repeat
      $(document.body).css
        'background-repeat': 'repeat'
    else
      $(document.body).css
        'background-repeat': 'no-repeat'
        'background-size': 'cover'

  load_bg()