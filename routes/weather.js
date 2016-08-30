'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var weatherKey = process.env.WEATHERKEY;

router.get('/:state/:city/forecast', function(req, res, next){
  let state = req.params.state;
  let city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/forecast10day/q/'+state+'/'+city+'.json', function(error, response, body){
    if(error) res.send(error);
    res.send(body);
  })
});

router.get('/:state/:city/webcams', function(req, res, next){
  let state = req.params.state;
  let city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/webcams/q/'+state+'/'+city+'.json', function(error, response, body){
    if(error) res.send(error);
    res.send(body);
  })
});

router.get('/:state/:city', function(req, res, next){
  let state = req.params.state;
  let city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/conditions/q/'+state+'/'+city+'.json', function(error, response, body){
    if(error) res.send(error);
    res.send(body);
  })
});

module.exports = router;
