require.config({
  paths: {
    async: '++resource++plone.formwidget.geolocation/async'
  }
});

require(['jquery'], function($) {
  var portal_url = $('body').data('portalUrl');
  $.getJSON(portal_url + '/@@load-maps-api-key').then(function(data) {
    require([
      'async!http://maps.google.com/maps/api/js?v=3&libraries=places&key=' +
        data.key
    ], function() {
      function disableFields(fields) {
        $.each(fields, function() {
          $(this).attr('readonly', true);
        });
      }

      function updatePosition(
        marker,
        latField,
        longField,
        zoomField,
        mapContainer,
        map
      ) {
        var position = marker.getPosition();
        var lat = position.lat();
        var lng = position.lng();
        latField.val(lat);
        longField.val(lng);
        zoomLevel = map.getZoom();
        zoomField.val(zoomLevel);
        mapContainer.data('latitude', lat);
        mapContainer.data('longitude', lng);
      }

      function setInitialLocation(lat, lng, zoom, map) {
        if (lat === 0 && lng === 0 && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            map.setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          });
        } else {
          map.setCenter({
            lat: lat,
            lng: lng
          });
        }
        map.setZoom(zoom);
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
        var latitudeField = $('.geolocationfield-field.latitude', $this);
        var longitudeField = $('.geolocationfield-field.longitude', $this);
        var zoomField = $('.geolocationfield-field.zoom', $this);

        if (editing) {
          var lat = parseFloat(latitudeField.val());
          var lng = parseFloat(longitudeField.val());
          var zoom = parseInt(zoomField.val(), 10);
        } else {
          var lat = parseFloat(geolocation.data('latitude'));
          var lng = parseFloat(geolocation.data('longitude'));
          var zoom = parseInt(geolocation.data('zoom'), 10);
        }

        var map = new google.maps.Map(geolocation.get(0));
        setInitialLocation(lat, lng, zoom, map);

        geolocation
          .addClass('mapActive')
          .css({ width: '100%', height: '400px' });
        var initialPosition = new google.maps.LatLng(lat, lng);
        var marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29),
          draggable: editing,
          animation: google.maps.Animation.DROP
        });
        marker.setPosition(initialPosition);

        if (editing) {
          disableFields([latitudeField, longitudeField]);

          var searchBox = $('.map-search-input', $this);
          searchBox.show();

          // Handle enter pression
          google.maps.event.addDomListener(
            searchBox.get(0),
            'keydown',
            function(event) {
              if (event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          );
          var autocomplete = new google.maps.places.Autocomplete(
            searchBox.get(0)
          );
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

              updatePosition(
                marker,
                latitudeField,
                longitudeField,
                zoomField,
                geolocation,
                map
              );
            }

            infoWindowElement.find('.place-icon').attr('src', place.icon);
            infoWindowElement.find('.place-name').text(place.name);
            infoWindowElement.find('.place-address').text(address);
            infowindow.open(map, marker);
          });

          marker.addListener('dragend', function(ev) {
            updatePosition(
              marker,
              latitudeField,
              longitudeField,
              zoomField,
              geolocation,
              map
            );
          });
        }
      });

      // in case of late loading
      $('.geolocation_wrapper.edit,.geolocation_wrapper.view').trigger(
        'geowidget:init'
      );
    });
  });
});

define("/Users/keul/buildout/test5.1/src/plone.formwidget.geolocation/plone/formwidget/geolocation/browser/static/plone.formwidget.geolocation.js", function(){});

