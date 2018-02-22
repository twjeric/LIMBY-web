var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Particle = require('particle-api-js');
var particle = new Particle();

var config = require('../config.json');
var enfError = require('../models/enf');
var DB = require('../models/db');
var db = new DB();

// Check if user logged in
router.get('/', async (req, res, next) => {
  try {
    // Db connect
    await db.connect(config.mongodbUrl, config.dbName);
    // Extract email from jwt cookie
    var token = req.cookies[config.jwtCookie];
    const decoded = await jwt.verify(token, config.secret); 
    var tokenUser = decoded.sub;
    // Check if extracted email in db
    const user = await db.find(config.usersCollection, { "email": tokenUser });
    // User logged in, show event page
    res.render('events', { "accessToken": user[0].at });

  } catch (err) {
    if ((err instanceof jwt.JsonWebTokenError) || (err instanceof (enfError))) { // Jwt verification failed, redirect to login page
        res.redirect(config.endpointUrl + '/login');
    } else {
      next(err);
    }
  }  
});

module.exports = router;
