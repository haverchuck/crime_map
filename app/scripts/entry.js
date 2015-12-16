require('./leaflet');
require('angular/angular');
var angular = window.angular;
require('./directives/angular-leaflet-directive');

var crimeMapApp = angular.module('CrimeMapApp', ['leaflet-directive']);
// require('./services/services')(crimeMapApp);
// require('./directives/directives')(crimeMapApp);

crimeMapApp.controller("SimpleMapController", [ '$scope', '$http', 'leafletData', function($scope, $http, leafletData) {
  $scope.crimes = [];

  $scope.getAll = function() {
      $http.get('/api/crimes')
        .then(function(res) {
          $scope.crimes = res.data;
        }, function(err) {
          console.log(err.data);
        });
    };

    $scope.addAll = function() {
      leafletData.getMap().then(function(map) {
        L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/v1.0.0beta0.0/images';
        L.geoJson($scope.crimes, {
          onEachFeature: onEachFeature
        }).addTo(map);
      });
    };

    function onEachFeature(feature, layer) {
      // layer.bindPopup("hi");
      // if (feature.properties && feature.properties.offence_type) {
      console.log(feature.properties.offense_type);
      layer.bindPopup('offence type: ' + feature.properties.offense_type);
      // }
    }
//
//
// L.geoJson(geojsonFeature, {
//     onEachFeature: onEachFeature
// }).addTo(map);

  var tilesDict = {
    openstreetmap: {
              url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              options: {
                  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
          },
    opencyclemap: {
              url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
              options: {
                  attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
              }
          },

    mapbox_dark: {
              name: 'Mapbox Dark',
              url: 'https://api.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
              type: 'xyz',
              options: {
                  apikey: 'pk.eyJ1IjoibXJpbmdlbCIsImEiOiIwYjM4MzFkY2E3ZTEyNzAwNGM4M2VjODZlODlkNWZhNiJ9.EJlJwl9IJoBptQV_EARdYA',
                  mapid: 'mapbox.dark'
              }
          },
    mapbox_light: {
              name: 'Mapbox Light',
              url: 'http://api.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
              type: 'xyz',
              options: {
                  apikey: 'pk.eyJ1IjoibXJpbmdlbCIsImEiOiIwYjM4MzFkY2E3ZTEyNzAwNGM4M2VjODZlODlkNWZhNiJ9.EJlJwl9IJoBptQV_EARdYA',
                  mapid: 'mapbox.light'
              }
          }
      };


    angular.extend($scope, {
        seattle: {
          lat: 47.6,
          lng: -122.33,
          zoom: 12
        },
        defaults: {
            scrollWheelZoom: false
        },
        tiles: tilesDict.openstreetmap
    });

    $scope.changeTiles = function(tiles) {
               $scope.tiles = tilesDict[tiles];
           };

}]);
