var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Particle = require('particle-api-js');
var particle = new Particle();
var fetch = require('node-fetch');
var JSONStream = require('JSONStream')

var config = require('../config.json');
var enfError = require('../models/enf');
var DB = require('../models/db');
var db = new DB();
// Middleware to restrict access to only authenticated users
var auth = require('../auth/auth');

// Register an user using Particle act
router.post('/user', async (req, res, next) => {
  try {
    await db.connect(config.mongodbUrl, config.dbName);
    await db.find(config.usersCollection, { "email": req.body.email });
    // User existed
    res.status(400).send("User already existed");
  } catch (err) { // User not exist, verify Particle act
    try {
      let email = req.body.email;
      let password = req.body.password;
      const data = await particle.login({ username: email, password: password });
      //// Good Particle act, register this user
      // Retrive device id
      // TODO: choose a specific device if there are multiple
      let at = data.body.access_token;
      const devicesRes = await fetch(config.particleEndPointUrl + config.particleDevicesApi + '?access_token=' + at, {method: 'GET'});
      const devices = await devicesRes.json();
      if (devices.length == 0) {
        res.status(400).status("No devices");
      }
      let deviceId = devices[0]['id'];
      // Generate userid
      let userId = djb2(email);
      // Hash password
      var hash = bcrypt.hashSync(password, config.salt);
      // Save user to db
      await db.insertOne(config.usersCollection, { "userid": userId, "email": email, "hash": hash, "did": deviceId, "at": at });
      res.status(200).send("Registered");
    } catch (err) {
      res.status(400).send("Error registering user"); 
    }  
  }
})

// Authenticate user
router.post('/auth', async (req, res, next) => {
  try {
    await db.connect(config.mongodbUrl, config.dbName);
    const user = await db.find(config.usersCollection, { "email": req.body.email });
    // Hash provided password to compare with hash in db
    if (bcrypt.compareSync(req.body.password, user[0].hash)) {
      // Ok, set cookie
      const token = await jwt.sign({ uid: user[0].userid }, config.secret);
      res.cookie(config.jwtCookie, token);
      res.json({'token': token});
    }
    else {
      res.status(400).send("Bad password");
    }
  } catch (err) {
    if ((err instanceof jwt.JsonWebTokenError) || (err instanceof (enfError))) { // jwt verification failed
      res.status(400).send("Bad credential");
    } else {
      res.status(400).send("Error authenticating user"); 
    }
  }
})

// Get past data
router.get('/past/:start/:end', auth, async (req, res, next) => {
  let start = parseInt(req.params.start);
  let end = parseInt(req.params.end);
  let now = new Date();
  if (isNaN(start) || isNaN(end) || (start > end) || (end > now.getTime())) {
    res.status(400).send("Bad params");
  }
  try {
    await db.connect(config.mongodbUrl, config.dbName);
    const pastData = await db.find(config.dataCollection, { $and: [{"userid": req.uid}, {"time":{$gte: start}}, {"time":{$lte: end}}] }, 0);
    res.json(pastData);
  } catch (err) {
    res.status(400).send("Error getting past data");
  }
})

// Get current data
router.get('/stream', auth, async (req, res, next) => {
  try {
    await db.connect(config.mongodbUrl, config.dbName);
    let now = new Date();
    db.stream(config.dataCollection, { $and: [{"userid": req.uid}, {"time":{$gte: 1}}] })
    .then(
      function(stream) {
        stream.pipe(JSONStream.stringify()).pipe(res);
      },
      function(err) {
        next(err);
        // res.status(400).send("Error getting data stream");
      }
    )
  } catch (err) {
    next(err);
    // res.status(400).send("Error getting data stream");
  }
})

// Start saving data from Particle cloud to db
router.post('/start', auth, async (req, res, next) => {
  try {
    await db.connect(config.mongodbUrl, config.dbName);
    const user = await db.find(config.usersCollection, { "userid": req.uid });
    saveStreamData(db, req.uid, user[0].did, user[0].at);
    res.send("Attempted to start saving data");
  } catch (err) {
    if (err instanceof (enfError)) {
      res.status(400).send("User not exist");
    } else {
      res.status(400).send("Error starting saving data");
    }    
  }
})

// Used by api/start
function saveStreamData(connectedDB, userId, deviceId, accessToken) {
  let temp = 0;
  particle.getEventStream({ deviceId: deviceId, auth: accessToken })
  .then(
    function(stream) {
      let timeout = null;
      function stopListening() {
        console.log("No input from stream for " + userId + " for " + config.streamTimeOut + " ms. Stop listening...");
        stream.removeAllListeners();
      }
      stream.on('event', function(data) {
        // Stream has input, clear then set timeout
        clearTimeout(timeout);
        timeout = setTimeout(stopListening, config.streamTimeOut);
        // Parse weight and save to db
        let weight = parseFloat(data.data);
        let now = new Date();
        if (!isNaN(weight)) {
          connectedDB.insertOne(config.dataCollection, { "userid": userId, "time": now.getTime(), "value": weight })
          .then(
            function(data) {},
            function(err) { console.log("Error connecting to database: " + err.message); }
          )
        }
      });
    }, 
    function(err) { console.log("Error getting event stream for " + userId); }
  );
}

// Hash string to int (create userid)
function djb2(str) {
  var hash = 5381;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char;
  }
  return hash;  
}

module.exports = router;
