'use strict';

const express = require('express');
const request = require('request');

const router = express.Router();
const mapKey = process.env.MAPKEY;

/* GET home page. */
router.get('/geocode', (req, res, next) => {
  const lat = req.query.lat;
  const lng = req.query.lng;

  request('https://api.mapbox.com/geocoding/v5/mapbox.places/'+lng+','+lat+'.json?access_token='+mapKey, (error, response, body) => {
    if (error) res.send(error);
    res.send(body);
  });
});

module.exports = router;
