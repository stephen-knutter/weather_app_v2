'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var mapKey = process.env.MAPKEY;

/* GET home page. */
router.get('/geocode', function(req, res, next) {
  let lat = req.query.lat;
  let lng = req.query.lng;

  request('https://api.mapbox.com/geocoding/v5/mapbox.places/'+lng+','+lat+'.json?access_token='+mapKey, function(error, response, body){
    if(error) res.send(error);
    res.send(body);
  })
});

module.exports = router;
