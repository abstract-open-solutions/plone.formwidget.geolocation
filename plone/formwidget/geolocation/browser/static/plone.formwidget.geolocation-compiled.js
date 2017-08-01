/** @license
 * RequireJS plugin for async dependency load like JSONP and Google Maps
 * Author: Miller Medeiros
 * Version: 0.1.2 (2014/02/24)
 * Released under the MIT license
 */
define('async',[],function(){

    var DEFAULT_PARAM_NAME = 'callback',
        _uid = 0;

    function injectScript(src){
        var s, t;
        s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = src;
        t = document.getElementsByTagName('script')[0]; t.parentNode.insertBefore(s,t);
    }

    function formatUrl(name, id){
        var paramRegex = /!(.+)/,
            url = name.replace(paramRegex, ''),
            param = (paramRegex.test(name))? name.replace(/.+!/, '') : DEFAULT_PARAM_NAME;
        url += (url.indexOf('?') < 0)? '?' : '&';
        return url + param +'='+ id;
    }

    function uid() {
        _uid += 1;
        return '__async_req_'+ _uid +'__';
    }

    return{
        load : function(name, req, onLoad, config){
            if(config.isBuild){
                onLoad(null); //avoid errors on the optimizer
            }else{
                var id = uid();
                //create a global variable that stores onLoad so callback
                //function can define new module after async load
                window[id] = onLoad;
                injectScript(formatUrl(req.toUrl(name), id));
            }
        }
    };
});


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

    var lat = parseFloat(latitudeField.val()) || geolocation.data('latitude');
    var lng = parseFloat(longitudeField.val()) || geolocation.data('longitude');
    var zoom =
      parseInt(zoomField.val(), 10) || parseInt(geolocation.data('zoom'), 10);

    geolocation.addClass('mapActive').css({ width: '100%', height: '400px' });
    var center = {
      lat: lat,
      lng: lng
    };
    var map = new google.maps.Map(geolocation.get(0), {
      zoom: zoom,
      center: center
    });

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

define("/Users/keul/buildout/test5.1/src/plone.formwidget.geolocation/plone/formwidget/geolocation/browser/static/plone.formwidget.geolocation.js", function(){});

