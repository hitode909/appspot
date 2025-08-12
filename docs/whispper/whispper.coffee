$ ->
  handle = ->
    status = $(this).val()
    lang = $('html').attr('lang')
    $(this).val('')
    $('.speech-container').animate
      opacity: 0.0

    $.ajax
      url: '/tweet/'
      type: 'POST'
      dataType: 'json'
      data:
        status: "#{ status } #whispper"
      complete: =>
        $('.speech-container').animate
          opacity: 1.0
      success: (res) ->
        element = $('<div>').addClass('status')
        link = $('<a>').text(res.text).attr
          href: "http://twitter.com/#!/#{ res.user.screen_name }/status/#{ res.id_str }"
          target: "_blank"
        element.append link
        $('#results').prepend element
      error: (res, text, error) ->
        message = $('<div>').addClass('error').text(res.responseText)
        $('#results').prepend message


  $('#language-selector input').change ->
    $('html').attr('lang', $(this).val())

  $('input.speech').bind 'speechchange', handle
  $('input.speech').bind 'webkitspeechchange', handle

  show_login_or_logout = ->
    $.ajax
      url: '/tweet/'
      type: 'GET'
      dataType: 'json'
      success: (res) ->
        if res.user
          $('#logout').show()
          $('#login').hide()
          $('#screen_name').text(res.user.screen_name)
          $('#main').show()
        else
          $('#login').show()
          $('#logout').hide()

      error: (res, text, error) ->
        message = $('<div>').addClass('error').text(res.responseText)
        $('#results').prepend message

  show_login_or_logout()