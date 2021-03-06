// Generated by CoffeeScript 1.6.3
var add_pin, geocode, get_position, render_map;

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

add_pin = function(map, center, name) {
  var marker, position;
  position = new google.maps.LatLng(center.lat, center.long);
  marker = new google.maps.Marker({
    position: position,
    title: name,
    animation: google.maps.Animation.DROP
  });
  return marker.setMap(map);
};

geocode = function(position) {
  var center, d, geocoder;
  d = $.Deferred();
  geocoder = new google.maps.Geocoder();
  center = new google.maps.LatLng(+position.lat, +position.long);
  geocoder.geocode({
    latLng: center
  }, function(results, status) {
    if (status === "OK") {
      return d.resolve(results[0].formatted_address);
    } else {
      return d.reject();
    }
  });
  return d.promise();
};

get_position = function() {
  var d, _ref;
  d = $.Deferred();
  if (!(typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.geolocation) != null ? _ref.getCurrentPosition : void 0 : void 0)) {
    d.reject();
  } else {
    navigator.geolocation.getCurrentPosition(function(position) {
      return d.resolve(position);
    });
  }
  return d.promise();
};

$(function() {
  return get_position().done(function(position) {
    var center, map;
    center = {
      lat: position.coords.latitude,
      long: position.coords.longitude
    };
    map = render_map({
      center: center,
      container: $('#map-container').get(0)
    });
    return geocode(center).done(function(name) {
      add_pin(map, center, name);
      return $('#checkin').text("" + name + " にチェックイン").show().click(function() {
        return window.open("http://t.heinter.net/" + name);
      });
    }).fail(function() {
      return alert("失敗しました");
    });
  }).fail(function() {
    return alert("スマートフォンかGoogle ChromeかFirefoxでご利用ください．");
  });
});
