window.requestAnimationFrame = do ->
  window.requestAnimationFrame		||
  window.webkitRequestAnimationFrame	||
  window.mozRequestAnimationFrame		||
  window.oRequestAnimationFrame		||
  window.msRequestAnimationFrame		||
  (callback, element) ->
    window.setTimeout ->
      callback()
    , 1000 / 60

$ ->

  users = 'hitode909 nanto_vi nobuoka hakobe932 wakabatan'.split ' '
  currentUser = null
  $preview = $ '#preview'

  if location.hash
    users = (location.hash.replace /^\#/, '').split ','

  ($ '#add-user').click ->
    users.push do ($ '#add-user-name').val
    ($ '#add-user-name').val ''
    location.hash = '#' + (users.concat [currentUser]).join ','

  ($ '#reset-user').click ->
    currentUser = null
    users = []
    $preview.css
      opacity: 0

  step = ->
    users.push currentUser if currentUser
    currentUser = do users.shift
    return unless currentUser

    $preview.css
      opacity: 1

    $preview.attr
      src: "http://cdn1.www.st-hatena.com/users/#{currentUser[0...2]}/#{currentUser}/profile.gif"

  animationLoop = ->
    do step
    window.requestAnimationFrame animationLoop

  do animationLoop


  $preview.click ->
    ($ '#names').append ($ '<div>').text currentUser
    alert currentUser

  ($ 'form').submit ->
    do ($ '#add-user').click
    false