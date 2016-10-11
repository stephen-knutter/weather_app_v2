'use strict';

angular.module('mapping',[])
  .factory('mapping', [() => {
    return {
      generateMap: (lat, lng) => {
        const mapWrap = document.getElementById('map-wrap');
        const map = document.getElementById('map');
        map.parentNode.removeChild(map);

        const mapAppend = document.createElement('div');
        mapAppend.id = 'map';
        mapWrap.appendChild(mapAppend);

        L.mapbox.accessToken = 'pk.eyJ1Ijoic21rcXA4IiwiYSI6ImNpcmtuZmh0YjAwMzZmZm04ZjF4ODU4NjQifQ.39jUUHq0jF4BzDD3gfxDOw';
        const newMap = L.mapbox.map(mapAppend, 'mapbox.streets').setView([lat,lng], 9);
      },
    };
  }]);
