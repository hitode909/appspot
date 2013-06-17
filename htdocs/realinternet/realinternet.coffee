render_map = (info) ->
  center = new google.maps.LatLng +info.center.lat, +info.center.long
  map_options =
    center: center
    zoom: 17
    disableDefaultUI: true
    mapTypeId: google.maps.MapTypeId.ROADMAP

  map = new google.maps.Map info.container, map_options

add_pin = (map, center, name) ->
  position = new google.maps.LatLng(center.lat, center.long)
  marker = new google.maps.Marker
    position: position
    title: name
    animation: google.maps.Animation.DROP,

  marker.setMap(map)

geocode = (position) ->
  d = $.Deferred()
  geocoder = new google.maps.Geocoder();
  center = new google.maps.LatLng +position.lat, +position.long

  geocoder.geocode latLng: center, (results, status) ->
    if status == "OK"
      d.resolve results[0].formatted_address
    else
      d.reject()
  d.promise()


get_position = ->
  d = $.Deferred()

  unless navigator?.geolocation?.getCurrentPosition
    d.reject()
  else
    navigator.geolocation.getCurrentPosition (position) ->
      d.resolve position

  d.promise()

$ ->
  get_position().done (position) ->

    center =
      lat: position.coords.latitude
      long: position.coords.longitude

    map = render_map
      center: center
      container: $('#map-container').get(0)

    geocode(center).done (name) ->
      add_pin map, center, name
      $('#checkin').text("#{name} にチェックイン")
      .show()
      .click ->
        window.open "http://t.heinter.net/#{name}"
    .fail ->
      alert "失敗しました"

  .fail ->
    alert "スマートフォンかGoogle ChromeかFirefoxでご利用ください．"

