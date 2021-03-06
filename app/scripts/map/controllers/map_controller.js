module.exports = function(app) {
  app.controller("MapController", [ '$scope', '$http', 'leafletData', '$compile', '$location', function($scope, $http, leafletData, $compile, $location) {

    var moment    = require('moment');
    var iconList  = require('../icon_list');
    var tilesDict = require('../tiles_dict');

    //all crimes (deprecated)
    $scope.crimes = [];
    //types of crimes in db
    $scope.crimeTypes = [];
    //crime types selected from dropdown
    $scope.selectedTypes = [];

    // layers that are currently on the map (deprecated by $scope.layerGroup)
    $scope.mapLayers = [];
    $scope.showMap=true;
    $scope.earliest = new Date(2015, 9, 1);
    $scope.startDate;
    $scope.endDate  = new Date();
    $scope.tweets = [];
    $scope.notFounds = [];

    // initialize a leaflet layergroup and add it to the map for better layer control
    $scope.layerGroup = null;
    $scope.layerControl = null;
    leafletData.getMap().then(function(map) {
      $scope.layerGroup = L.layerGroup().addTo(map);
      $scope.layerControl = new L.control.layers({},{},{position: 'topleft'}).addTo(map);
      L.Icon.Default.imagePath = './images/leaflet';
      map.on('layerremove', function(e) {
          $scope.layerControl.removeLayer(e.layer);
      });
    });


    $scope.toAbout = function() {
      $scope.showMap = false;
      $location.path('/about');
    };

    $scope.toHowTo = function() {
      $scope.showMap = false;
      $location.path('/howto');
    };

    $scope.toMap = function() {
      $scope.showMap = true;
      $location.path('/map');
    };
        //GETS ALL CRIMES IN DB (deprecated, not used in current master)
        $scope.getAll = function() {
          $http.get('/api/crimes')
          .then(function(res) {
            $scope.crimes = res.data;
          }, function(err) {
            console.log(err.data);
          });
        };

        //ADDS ALL CRIMES IN DB TO MAP (deprecated)
        $scope.addAll = function() {
          leafletData.getMap().then(function(map) {
            L.geoJson($scope.crimes, {
              onEachFeature: onEachFeature
            }).addTo(map);
          });
        };

        //USES SELECTED VALUES FROM DROPDOWN TO FETCH MATCHING CRIMES AND MAP
        $scope.mapSelected = function(){
          $scope.clearMap();
            for(var x=0; x<$scope.selectedTypes.length; x++){
              $http.get('/api/internal/crimetypes/'
                + $scope.selectedTypes[x].name
                + '/'
                + $scope.startDate
                + '/'
                + $scope.endDate)
              .then(function(res){
                if (res.data.length > 0) {
                  leafletData.getMap().then(function(map) {
                    var newLayer = L.geoJson(res.data, {
                      pointToLayer: function(feature, latlng) {
                        var customIcon = L.MakiMarkers.icon({icon: iconList[feature.properties.summarized_offense_description].icon,
                          color: iconList[feature.properties.summarized_offense_description].color,
                          size: 'l'});
                          return L.marker(latlng, {icon: customIcon});
                        },
                        onEachFeature: onEachFeature
                      });
                      $scope.layerGroup.addLayer(newLayer);
                      map.fitBounds(newLayer);
                      $scope.layerControl.addOverlay(newLayer, res.data[0].properties.summarized_offense_description);

                    });
                }  else {$scope.notFounds.push(res.config.url.split("/")[4].toLowerCase());
                  }
              });
            }
        };

        // removes layers that have been plotted on the map
        $scope.clearMap = function() {
          $scope.layerGroup.clearLayers();
          $scope.selectedItems = [];
          $scope.notFounds = [];
          $scope.tweets = [];
        };

        //POPULATES DROPDOWN WITH INDEXED CRIME TYPES
        $scope.getTypes = function() {
          $http.get('/api/internal/crimetypes')
            .then(function(res) {
              for(var i=0; i<res.data.length; i++){
                $scope.crimeTypes.push({name: res.data[i]});
              }
            }, function(err) {
              console.log(err.data);
            });
        };
        $scope.getTypes();

        // get's code inserted into DOM by leaflet popup compiled into angular
        $scope.$on('leafletDirectiveMap.popupopen', function(event, args) {
          var feature = args.leafletEvent.popup.options.feature;
          var newScope = $scope.$new();
          newScope.stream = feature;
          $compile(args.leafletEvent.popup._contentNode)(newScope);
        });

        // function that is called when button in popup is clicked
        $scope.popupClicker= function(lat, long, date) {

          var startDate = moment(date, "YYYYMMDD").format('YYYY-MM-DD');
          var endDate = moment(startDate).add(1, 'd').format('YYYY-MM-DD');
          $scope.getTweets(lat, long, startDate, endDate);
        };

        // Get tweets from same date as crime and within small geographic radius
        $scope.getTweets = function(lat, long, startDate, endDate) {
          $http.get('/api/tweets/' + lat + ',' + long + '/' + startDate + '/' + endDate)
          .then(function(res) {
            $scope.tweets = res.data;
          }, function(err) {
            console.log(err);
          });
        };

        // Called on each feature when plotted to attach popup
        function onEachFeature(feature, layer) {

          var date = feature.properties.occurred_date_or_date_range_start.split('-');
          yearMonthDay = date.slice(0,2).join('');
          yearMonthDay += (date[2].split('T')[0]);

          layer.bindPopup('<div><p> <b>offense type:</b> '
            + feature.properties.offense_type + '<br>' + '<b>occurred on:</b> '
            + feature.properties.occurred_date_or_date_range_start + '<br></p>'
            + '<button class="pure-button" data-ng-click="popupClicker('
            + feature.properties.latitude + ',' + feature.properties.longitude
            + ', ' + yearMonthDay + ')">Nearby Tweets</button></div>' );
        }


    //BEGIN DATE RENDERING
    $scope.startDate = new Date();
    $scope.endDate = new Date();

    $scope.minDate = new Date(
        $scope.startDate.getFullYear(),
        $scope.startDate.getMonth(),
        $scope.startDate.getDate()+1);

    $scope.maxDate = new Date();

    function daysInMonth(month,year) {
      return new Date(year, month, 0).getDate();
    }

    $scope.renderEnd = function(){
      $scope.minDate = new Date(
        $scope.startDate.getFullYear(),
        $scope.startDate.getMonth(),
        $scope.startDate.getDate()+1
      );
      $scope.maxDate = new Date(
        $scope.startDate.getFullYear(),
        $scope.startDate.getMonth(),
        $scope.startDate.getDate() + (daysInMonth($scope.startDate.getMonth()+1, $scope.startDate.getYear()) - $scope.startDate.getDate())
      );
    }
    //END DATE RENDERING

              angular.extend($scope, {
                seattle: {
                  lat: 47.6,
                  lng: -122.33,
                  zoom: 12
                },
                defaults: {
                  scrollWheelZoom: false,
                  tap: false
                },
                tiles: tilesDict.mapbox_highcontrast
              });

              $scope.changeTiles = function(tiles) {
                $scope.tiles = tilesDict[tiles];
              };

            }]);
};
