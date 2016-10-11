'use strict';

const express = require('express');
const request = require('request');
const router = express.Router();
const weatherKey = process.env.WEATHERKEY;

router.get('/:state/:city/forecast', (req, res, next) => {
  const state = req.params.state;
  const city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/forecast10day/q/'+state+'/'+city+'.json', (error, response, body) => {
    if (error) res.send(error);
    res.send(body);
  });
});

router.get('/:state/:city/webcams', (req, res, next) => {
  const state = req.params.state;
  const city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/webcams/q/'+state+'/'+city+'.json', (error, response, body) => {
    if (error) res.send(error);
    res.send(body);
  });
});

router.get('/:state/:city', (req, res, next) => {
  const state = req.params.state;
  const city = req.params.city;

  request('https://api.wunderground.com/api/'+weatherKey+'/conditions/q/'+state+'/'+city+'.json', (error, response, body) => {
    if (error) res.send(error);
    res.send(body);
  });
});

module.exports = router;
