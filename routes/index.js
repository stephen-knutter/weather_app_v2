var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Stephen\'s Weather App', map_key: process.env.MAPKEY, weather_key: process.env.WEATHERKEY });
});

module.exports = router;
