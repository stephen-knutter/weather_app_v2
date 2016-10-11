'use strict';

const app = angular.module('weather', ['ui.router', 'mapping']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) => {
    $stateProvider
      .state('weather', {
        url: '/',
        templateUrl: '/weather.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['getMap', (getMap) => {
            return getMap.getLocation('info');
          }],
        },
      })
      .state('forecast', {
        url: '/forecast',
        templateUrl: '/forecast.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['getMap', (getMap) => {
            return getMap.getLocation('forecast');
          }],
        },
      })
      .state('webcams', {
        url: '/webcams',
        templateUrl: '/webcams.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['getMap', (getMap) => {
            return getMap.getLocation('webcams');
          }],
        },
      });

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);

app.factory('getMap', ['$http', 'mapping', ($http, mapping) => {
  const map = {
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
        state: '',
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
        elevation: '0 ft',
      },
      dewpoint_string: '0 F (0 C)',
      windchill_string: 'N/A',
      precip_today_string: '0.00 in (0 mm)',
      relative_humidity: '0%',
      forecast_url: '#',
      icon_url: '/images/Weather-48.png',
    },
    coords: { lat: 37.77493, lng: -122.419416 },
    weather: [],
    cams: [],
    forecasts: [],
    forecasts_txt: [],
  };

  map.getLocation = (page) => {
    map.selected = page;

    if (navigator.geolocation) {
      let geolocation = navigator.geolocation.getCurrentPosition(function(position){
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (lat && lng) {
          map.coords.lat = lat;
          map.coords.lng = lng;
          map.reverseGeocode();
        } else {
          map.reverseGeocode();
        }
      }, (err) => {
        map.reverseGeocode();
      });
    } else {
      map.reverseGeocode();
    }
  };

  map.reverseGeocode = () => {
    $http.get('/map/geocode?lat='+map.coords.lat+'&lng='+map.coords.lng)
      .success((data) => {
        const geoData = data.features;
        let city = geoData[0].context[1].text;
        let state = geoData[0].context[3].short_code;

        if (!city || !state) {
          state = 'CA';
          city = 'San_Francisco';
        }

        map.generate(state, city);
      });
  };

  map.reset = (state, city) => {
    map.gotInfo = map.gotForecast = map.gotWebcams = map.gotMap = false;
    map.generate(state, city);
  };

  map.generate = (state, city) => {
    const newState = state.toUpperCase().replace(/US\-/g, "").replace(/^[A-Z]$/gi, "");
    const newCity = city.replace(/\s+/g, "_").replace(/^[a-zA-Z]$/gi, "_");

    if (!map.gotInfo) {
      map.find(newState, newCity);
    }

    if (!map.gotForecast) {
      map.forecast(newState, newCity);
    }

    if (!map.gotWebcams) {
      map.webcams(newState, newCity);
    }
  };

  map.find = (state, city) => {
    $http.get('/weather/'+state+'/'+city).success((data) => {
      map.gotInfo = true;

      const response = data.response;
      const error = response.error;

      if (error) {
        alert('Could not find data for '+ city + ' ,' + state);
      } else {
        const weather = data.current_observation;

        map.info = weather;

        if (!map.gotMap) {
          map.gotMap = true;
          mapping.generateMap(map.info.observation_location.latitude,
                              map.info.observation_location.longitude);
        }
      }
    });
  };

  map.forecast = (state, city) => {
    $http.get('/weather/'+state+'/'+city+'/forecast').success((data) => {
      map.gotForecast = true;

      map.forecasts = data.forecast.simpleforecast.forecastday;
      map.forecasts_txt = data.forecast.txt_forecast.forecastday;

      for (let i = 0; i < map.forecasts.length; i++) {
        const current = map.forecasts[i];
        current.txt_obj = map.forecasts_txt[i];
      }
    });
  };

  map.webcams = (state, city) => {
    $http.get('/weather/'+state+'/'+city+'/webcams').success((data) => {
      map.gotWebcams = true;
      map.cams = data.webcams;
    });
  };

  return map;
}]);

app.controller('MainCtrl', ['$scope', 'getMap', ($scope, getMap) => {
  $scope.map = getMap;

  $scope.newMap = () => {
    if (!$scope.city || !$scope.state) return false;
    $scope.map.reset($scope.state, $scope.city);
  };
}]);
