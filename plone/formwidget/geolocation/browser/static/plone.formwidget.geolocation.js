require.config({
  paths: {
    async: '++resource++plone.formwidget.geolocation/async'
  }
});

require([
  'jquery',
  'async!http://maps.google.com/maps/api/js?v=3&libraries=places&key=AIzaSyAtTLEerLeB1gS4J3VG1z3AV5xrvIWHHpU'
], function($) {
  function disableFields(fields) {
    $.each(fields, function() {
      $(this).attr('readonly', true);
    });
  }

  function updatePosition(marker, latField, longField, map) {
    var position = marker.getPosition();
    var lat = position.lat();
    var lng = position.lng();
    latField.val(lat);
    longField.val(lng);
    map.data('latitude', lat);
    map.data('longitude', lng);
  }

  $(document).on('geowidget:init', function(ev) {
    var $this = $(ev.target);

    // prevent multiple activation
    if ($this.data('geolocationfield')) {
      return;
    } else {
      $this.data('geolocationfield', true);
    }

    var editing = $this.is('.edit');

    $('.geolocation-data', $this).hide();

    var geolocation = $('.geolocation', $this);
    var zoom = parseInt(geolocation.data('zoom'), 10);
    var latitudeField = $('.geolocationfield-field.latitude', $this);
    var longitudeField = $('.geolocationfield-field.longitude', $this);
    var zoomField = $('.geolocationfield-field.zoom', $this);

    disableFields([latitudeField, longitudeField]);

    geolocation.addClass('mapActive').css({ width: '100%', height: '400px' });
    var center = {
      lat: geolocation.data('latitude'),
      lng: geolocation.data('longitude')
    };
    var map = new google.maps.Map(geolocation.get(0), {
      zoom: zoom,
      center: center
    });

    var initialPosition = new google.maps.LatLng(
      geolocation.data('latitude'),
      geolocation.data('longitude')
    );
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29),
      draggable: editing,
      animation: google.maps.Animation.DROP
    });
    marker.setPosition(initialPosition);

    if (editing) {
      var searchBox = $('.map-search-input', $this);
      searchBox.show();

      // Handle enter pression
      google.maps.event.addDomListener(searchBox.get(0), 'keydown', function(
        event
      ) {
        if (event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
      var autocomplete = new google.maps.places.Autocomplete(searchBox.get(0));
      autocomplete.bindTo('bounds', map);

      // zoom update
      google.maps.event.addListener(map, 'zoom_changed', function() {
        zoomLevel = map.getZoom();
        zoomField.val(zoomLevel);
      });

      var infoWindowElement = $('.infowindow-content', $this);
      var infowindow = new google.maps.InfoWindow();
      var infowindowContent = infoWindowElement.get(0);
      infowindow.setContent(infowindowContent);
      autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(zoom);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] &&
              place.address_components[0].short_name) ||
              '',
            (place.address_components[1] &&
              place.address_components[1].short_name) ||
              '',
            (place.address_components[2] &&
              place.address_components[2].short_name) ||
              ''
          ].join(' ');

          updatePosition(marker, latitudeField, longitudeField, geolocation);
        }

        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
      });

      marker.addListener('dragend', function(ev) {
        updatePosition(marker, latitudeField, longitudeField, geolocation);
      });
    }
  });

  // in case of late loading
  $('.geolocation_wrapper.edit,.geolocation_wrapper.view').trigger(
    'geowidget:init'
  );
});
