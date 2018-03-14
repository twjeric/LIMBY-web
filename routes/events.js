var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var config = require('../config.json');
// Middleware to check if user logged in
var auth = require('../auth/auth');

router.get('/', auth, async (req, res, next) => {
  // User logged in
  if (req.auth) {
    try {
      const apiRes = await fetch(config.endpointUrl + '/api/start', {
        method: 'POST',
        headers: {
          cookie: config.jwtCookie + '=' + req.cookies[config.jwtCookie]
        }
      });
      if (apiRes.status == 500) {
        console.log(500);
        res.render('events', { "err": "Server couldn't start saving live data" });
      }
      else {
        console.log(200);
        res.render('events', { "err": null });
      }
    } catch (err) {
      console.log(1500);
      res.render('events', { "err": err });
    }
  }
  else {
    // No user logged in
    res.redirect('/login');
  }  
});

module.exports = router;
