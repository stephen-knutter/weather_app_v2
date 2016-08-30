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
      "location": 'Searching...',
      "zip": '00000',
      "observation_time": '00:00:00',
      "time": '00:00:00',
      "description": '...',
      "temp": '0 F (0 C)',
      "feels": '0 F (0 C)',
      "wind": '0 MPH',
      "lat": '00.000000',
      "lng": '-000.000000',
      "full_location": '...',
      "full_description": '...',
      "duepoint": '0 F (0 C)',
      "windchill": 'N/A',
      "precipitation": '0.00 in (0 mm)',
      "humidity": '0%',
      "elevation": '0 ft',
      "ex_link": '#',
      "icon": "",
      "alt": "getting weather...",
      "coords": {"lat": 37.77493, "lng": -122.419416}
    },
    weather: [],
    cams: [],
    forecasts: []
  };

  map.getLocation = function(page){
    map.selected = page;

    if(navigator.geolocation){
      let geolocation = navigator.geolocation.getCurrentPosition(function(position){
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        if(lat && lng){
          map.info.coords.lat = lat;
          map.info.coords.lng = lng;
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
    $http.get('/map/geocode?lat='+map.info.coords.lat+'&lng='+map.info.coords.lng)
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

        map.info.location = weather.display_location.full;
        map.info.zip = weather.display_location.zip;
        map.info.observation_time = weather.observation_time;
        map.info.time = weather.local_time_rfc822;
        map.info.description = weather.weather;
        map.info.temp = weather.temperature_string;
        map.info.feels = weather.feelslike_string;
        map.info.wind = 'From the '+weather.wind_dir+' '+weather.wind_mph+' MPH';
        map.info.lat = weather.observation_location.latitude;
        map.info.lng = weather.observation_location.longitude;
        map.info.full_location = weather.display_location.full;
        map.info.full_description = weather.observation_location.full;
        map.info.duepoint = weather.dewpoint_string;
        map.info.windchill = weather.windchill_string;
        map.info.precipitation = weather.precip_today_string;
        map.info.humidity = weather.relative_humidity;
        map.info.elevation = weather.observation_location.elevation;
        map.info.ex_link = weather.forecast_url;
        map.info.icon = weather.icon_url;
        map.info.alt = weather.display_location.city+', '+weather.display_location.state+' Weather';

        if(!map.gotMap){
          map.gotMap = true;
          mapping.generateMap(map.info.lat, map.info.lng);
        }
      }
    })
  };

  map.forecast = function(state, city){
    $http.get('/weather/'+state+'/'+city+'/forecast').success(function(data){
      map.gotForecast = true;
      map.forecasts = [];

      let forecast = data.forecast.simpleforecast.forecastday;
      let txt = data.forecast.txt_forecast.forecastday;

      for(var i=0; i<3; i++){
        let current = forecast[i];

        let items = {
          index: i,
          conditions: current.conditions,
          tz: current.date.tz_long,
          month: current.date.monthname,
          day: current.date.day,
          year: current.date.year,
          high: current.high.fahrenheit,
          low: current.low.fahrenheit,
          icon: current.icon_url,
          wind_dir: current.avewind.dir,
          wind_mph: current.avewind.mph,
          text: txt[i].fcttext
        };

        map.forecasts.push(items);
      }
    });
  };

  map.webcams = function(state, city){
    $http.get('/weather/'+state+'/'+city+'/webcams').success(function(data){
      map.gotWebcams = true;
      map.cams = [];

      let webcams  = data.webcams;

      let count = 0;
      for(var i in webcams){
        let className = 'item';

        if(i == 0){
          className += ' active';
        }

        let current = webcams[i];

        if(count <= 10){
          let items = {
            image: current.CURRENTIMAGEURL,
            city: current.city,
            class_name: className
          }
          map.cams.push(items)
          count++;
        }
      }
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
