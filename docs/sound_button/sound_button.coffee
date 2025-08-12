$ ->
  $('button#a').mousedown ->
    $audio = $('<audio>').attr
      src: 'language.wav'

    $('body').append($audio)
    $audio.bind 'canplay', ->
      this.play()
    $audio.bind 'ended', ->
      $(this).remove()

  $audio_b = null
  $('button#b').mousedown ->
    if $audio_b
      $audio_b.remove()
      $audio_b = null
    $audio_b = $('<audio>').attr
      src: 'language.wav'

    $('body').append($audio_b)
    $audio_b.bind 'canplay', ->
      this.play()
    $audio_b.bind 'ended', ->
      $(this).remove()
      $audio_b = null

  $audio_c = null
  $('button#c').mousedown ->
    $audio_c = $('<audio>').attr
      src: 'language.wav'
      loop: true

    $('body').append($audio_c)
    $audio_c.bind 'canplay', ->
      this.play()

  $('button#c').mouseup ->
    if $audio_c
      $audio_c.remove()
      $audio_c = null

  $audio_d = null
  $('button#d').mousedown ->
    if $audio_d
      $audio_d[0].play()
      return

    $audio_d = $('<audio>').attr
      src: 'language.wav'
      loop: true

    $('body').append($audio_d)
    $audio_d.bind 'canplay', ->
      this.play()

  $('button#d').mouseup ->
    $audio_d[0].pause()

  $audio_e = null
  $('button#e').mousedown ->
    if $audio_e
      $audio_e[0].muted = false
      return

    $audio_e = $('<audio>').attr
      src: 'language.wav'
      loop: true

    $('body').append($audio_e)
    $audio_e.bind 'canplay', ->
      this.play()

  $('button#e').mouseup ->
    $audio_e[0].muted = true
