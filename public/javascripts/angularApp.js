'use strict';

var app = angular.module('weather', ['ui.router', 'mapping']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('weather', {
      url: '/',
      templateUrl: '/weather.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['getMap', function(getMap){
          return getMap.getLocation('info');
        }]
      }
    })
    .state('forecast', {
      url: '/forecast',
      templateUrl: '/forecast.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['getMap', function(getMap){
          return getMap.getLocation('forecast');
        }]
      }
    })
    .state('webcams', {
      url: '/webcams',
      templateUrl: '/webcams.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['getMap', function(getMap){
          return getMap.getLocation('webcams');
        }]
      }
    })

    $urlRouterProvider.otherwise('/');
}]);

app.factory('getMap', ['$http', 'mapping', function($http, mapping){
  let map = {
    selected: null,
    gotInfo: false,
    gotForecast: false,
    gotWebcams: false,
    gotMap: false,
    info: {
      display_location: {
        full: 'Searching...',
        zip: '00000',
        city: '',
        state: ''
      },
      observation_time: '00:00:00',
      local_time_rfc822: '00:00:00',
      weather: '...',
      temperature_string: '0 F (0 C)',
      feelslike_string: '0 F (0 C)',
      wind_dir: '',
      wind_mph: '0 MPH',
      observation_location: {
        latitude: '00.000000',
        longitude: '-000.000000',
        full: '...',
        elevation: '0 ft'
      },
      dewpoint_string: '0 F (0 C)',
      windchill_string: 'N/A',
      precip_today_string: '0.00 in (0 mm)',
      relative_humidity: '0%',
      forecast_url: '#',
      icon_url: '#',
    },
    coords: {lat: 37.77493, lng: -122.419416},
    weather: [],
    cams: [],
    forecasts: [],
    forecasts_txt: []
  };

  map.getLocation = function(page){
    map.selected = page;

    if(navigator.geolocation){
      let geolocation = navigator.geolocation.getCurrentPosition(function(position){
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        if(lat && lng){
          map.coords.lat = lat;
          map.coords.lng = lng;
          map.reverseGeocode();
        } else {
          map.reverseGeocode();
        }
      }, function(err){
        map.reverseGeocode();
      })
    } else {
      map.reverseGeocode();
    }
  };

  map.reverseGeocode = function(){
    $http.get('/map/geocode?lat='+map.coords.lat+'&lng='+map.coords.lng)
      .success(function(data){
        let geoData = data.features;
        let city = geoData[0].context[1].text;
        let state = geoData[0].context[3].short_code;

        if(!city || !state){
          state = 'CA';
          city = 'San_Francisco';
        }

        map.generate(state, city);
      })
  };

  map.reset = function(state, city){
    map.gotInfo = map.gotForecast = map.gotWebcams = map.gotMap = false;
    map.generate(state, city);
  };

  map.generate = function(state, city){
    state = state.toUpperCase().replace(/US\-/g, "").replace(/^[A-Z]$/gi, "");
    city = city.replace(/\s+/g, "_").replace(/^[a-zA-Z]$/gi, "_");

    if(!map.gotInfo){
      map.find(state, city);
    }

    if(!map.gotForecast){
      map.forecast(state, city);
    }

    if(!map.gotWebcams){
      map.webcams(state, city);
    }

  };

  map.find = function(state, city){
    $http.get('/weather/'+state+'/'+city).success(function(data){
      map.gotInfo = true;

      let response = data.response;
      let error = response.error;

      if(error){
        alert('Could not find data for '+ city + ' ,' + state);
      } else {
        let weather = data.current_observation;

        map.info = weather;

        if(!map.gotMap){
          map.gotMap = true;
          mapping.generateMap(map.info.observation_location.latitude, map.info.observation_location.longitude);
        }
      }
    })
  };

  map.forecast = function(state, city){
    $http.get('/weather/'+state+'/'+city+'/forecast').success(function(data){
      map.gotForecast = true;

      map.forecasts = data.forecast.simpleforecast.forecastday;
      map.forecasts_txt = data.forecast.txt_forecast.forecastday;

      for(var i=0; i<map.forecasts.length; i++){
        let current = map.forecasts[i];
        current.txt_obj = map.forecasts_txt[i];
      }
    });
  };

  map.webcams = function(state, city){
    $http.get('/weather/'+state+'/'+city+'/webcams').success(function(data){
      map.gotWebcams = true;
      map.cams = data.webcams;
    })
  };

  return map;
}]);

app.controller('MainCtrl', ['$scope', 'getMap', function($scope, getMap){
  $scope.map = getMap;

  $scope.newMap = function(){
    if(!$scope.city || !$scope.state) return false;
    $scope.map.reset($scope.state, $scope.city);
  }
}]);
