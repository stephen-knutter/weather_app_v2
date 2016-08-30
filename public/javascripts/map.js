angular.module('mapping',['mapkey'])
  .factory('mapping', ['mapkey', function(mapkey){
    return{
      generateMap: function(lat, lng){
        let mapWrap = document.getElementById('map-wrap');
        let map = document.getElementById('map');
        map.parentNode.removeChild(map);

        let mapAppend = document.createElement('div');
        mapAppend.id = 'map';
        mapWrap.appendChild(mapAppend);
        
        L.mapbox.accessToken = mapkey;
        let newMap = L.mapbox.map(mapAppend, 'mapbox.streets').setView([lat,lng], 9);
      }
    }
  }])
