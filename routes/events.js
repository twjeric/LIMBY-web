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
      res.render('events', { "err": null });
    } 
    catch (err) {
      res.render('events', { "err": err });
    }
  }
  else {
    // No user logged in
    res.redirect('/login');
  }  
});

module.exports = router;
