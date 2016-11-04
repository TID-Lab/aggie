angular.module('Aggie')

.factory('Map', function() {

  Map = function(params) {
    var self = this;
    self.params = params;

    // create the map
    var div = document.getElementById('map-canvas');
    self.map = new google.maps.Map(div, {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 1,
      streetViewControl: false,
      draggableCursor: 'pointer'
    });

    // add the markers and keep expanding the bounding rectangle
    var bounds = new google.maps.LatLngBounds();
    self.markers = [];
    self.params.locations.forEach(function(l) {
      // get float values from string
      var lat = parseFloat(l.latitude);
      var lng = parseFloat(l.longitude);

      if (isNaN(lat) || isNaN(lng)) { return; }

      // create marker and add to map
      var p = new google.maps.LatLng(lat, lng);
      var m = new google.maps.Marker({
        map: self.map,
        position: p,
        title: l.locationName,
        id: l._id
      });
      self.markers.push(m);

      // expand the bounding rectangle
      bounds.extend(p);

      // setup event listener to show info window
      google.maps.event.addListener(m, 'click', function() { self.show_info_window(this); });
    });

    if (self.markers.length == 0) {
      self.map.setCenter(new google.maps.LatLng(0, 0));
    } else {
      // else use bounds determined above
      // center/zoom the map
      self.map.fitBounds(bounds);

      // fitBounds() is apparently async:
      // http://stackoverflow.com/questions/4523023/using-setzoom-after-using-fitbounds-with-google-maps-api-v3
      //
      // so wait for event, check if zoomed in too much, if so,
      // zoom to a reasonable level (11 is city-ish level)
      var zoomChangeBoundsListener =
        google.maps.event.addListenerOnce(self.map, 'bounds_changed', function(event) {
          if (self.map.zoom && self.map.zoom > 11) {
            self.map.setZoom(11);
            google.maps.event.removeListener(zoomChangeBoundsListener);
          }
        });
    }
  };

  Map.prototype.show_info_window = function(marker) {
    var self = this;
    // close any existing window
    if (self.info_window) self.info_window.close();

    // open the window and show the loading message
    self.info_window = new google.maps.InfoWindow({
      height: 300,
      content: '<div class="info_window" style="width:200px; height:150px"><h5>Loading...</h5></div>'
    });
    self.info_window.open(self.map, marker);

    // do the ajax call after the info window is loaded
    google.maps.event.addListener(self.info_window, 'domready', function() {
      // load the response
      $.ajax({
        url: self.params.info_window_url + marker.id,
        method: 'get',
        success: function(data) {
          $('div.info_window').html(
            '<h5>' + data.title + '</h5>' +
            '<p>' + data.locationName + '</p>' +
            '<p>Status: ' + data.status + '</p>' +
            '<p>' + (data.veracity ? 'Verified' : 'Unverified') + '</p>' +
            '<a href="/incidents/' + data._id + '" class="btn btn-sm btn-info">View Incident</a>'
          );
        },
        error: function() {
          $('div.info_window').html('There was an error retrieving incident info.');
        }
      });
    });
  };

  return Map;
});
