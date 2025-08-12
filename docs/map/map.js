var random_color, render_map, step;
render_map = function(info) {
  var center, map, map_options;
  center = new google.maps.LatLng(+info.center.lat, +info.center.long);
  map_options = {
    center: center,
    zoom: 17,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  return map = new google.maps.Map(info.container, map_options);
};
random_color = function() {
  var choise;
  choise = function() {
    var s, v;
    v = Math.floor(Math.random() * 100);
    s = (v < 10 ? '0' : '') + v;
    return s;
  };
  return ['#', choise(), choise(), choise()].join('');
};
step = function(map) {
  var feature_type, feature_types, stylers, styles, _i, _len;
  feature_types = ['all', 'administrative', 'landscape', 'poi', 'road', 'road.arterial', 'road.highway', 'road.local', 'transit', 'water'];
  stylers = function() {
    return [
      {
        hue: random_color()
      }, {
        saturation: 100
      }, {
        lightness: 0
      }, {
        gamma: 1.0
      }, {
        weight: 1
      }
    ];
  };
  styles = [];
  styles.push({
    stylers: stylers()
  });
  for (_i = 0, _len = feature_types.length; _i < _len; _i++) {
    feature_type = feature_types[_i];
    styles.push({
      featureType: feature_type,
      stylers: stylers()
    });
  }
  return map.setOptions({
    styles: styles
  });
};
$(function() {
  var map;
  map = render_map({
    center: {
      lat: 35.688,
      long: 139.699
    },
    container: $('#map-container').get(0)
  });
  step(map);
  return setInterval(function() {
    return step(map);
  }, 10 * 1000);
});