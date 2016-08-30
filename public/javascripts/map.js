'use strict';

angular.module('mapping',[])
  .factory('mapping', [function(){
    return{
      generateMap: function(lat, lng){
        let mapWrap = document.getElementById('map-wrap');
        let map = document.getElementById('map');
        map.parentNode.removeChild(map);

        let mapAppend = document.createElement('div');
        mapAppend.id = 'map';
        mapWrap.appendChild(mapAppend);

        L.mapbox.accessToken = 'pk.eyJ1Ijoic21rcXA4IiwiYSI6ImNpcmtuZmh0YjAwMzZmZm04ZjF4ODU4NjQifQ.39jUUHq0jF4BzDD3gfxDOw';
        let newMap = L.mapbox.map(mapAppend, 'mapbox.streets').setView([lat,lng], 9);
      }
    }
  }])
