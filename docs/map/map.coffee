render_map = (info) ->
  center = new google.maps.LatLng +info.center.lat, +info.center.long
  map_options =
    center: center
    zoom: 17
    disableDefaultUI: true
    mapTypeId: google.maps.MapTypeId.ROADMAP

  map = new google.maps.Map info.container, map_options

random_color = ->
  choise = () ->
    v = Math.floor(Math.random()  * 100)
    s = (if v < 10 then '0' else '') + v
    s

  ['#', choise(), choise(), choise()].join('')


step = (map) ->

  feature_types = ['all', 'administrative', 'landscape', 'poi', 'road', 'road.arterial', 'road.highway', 'road.local', 'transit', 'water']

  stylers = ->
    [
        hue: random_color()
      ,
        saturation: 100
      ,
        lightness: 0
      ,
        gamma: 1.0
      ,
        weight: 1
    ]

  styles = []

  styles.push
    stylers: stylers()

  for feature_type in feature_types
    styles.push
      featureType: feature_type
      stylers: stylers()

  map.setOptions
    styles: styles

$ ->
  map = render_map
    center:
      lat: 35.688
      long: 139.699
    container: $('#map-container').get(0)

  step(map)

  setInterval ->
    step(map)
  , 10 * 1000
