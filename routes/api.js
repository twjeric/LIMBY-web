var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Particle = require('particle-api-js');
var particle = new Particle();
var fetch = require('node-fetch');
var JSONStream = require('JSONStream');

var config = require('../config.json');
var enfError = require('../models/enf');
var DB = require('../models/db');
var db = new DB();
// Middleware to restrict access to only authenticated users
var apiAuth = require('../auth/apiAuth');

// Register an user using Particle act
router.post('/user', async (req, res, next) => {
  try {
    await db.connect(process.env.MONGO_URL || config.mongodbUrl, config.dbName);
    await db.find(config.usersCollection, { "email": req.body.email });
    // User existed
    res.status(400).send("User already existed");
  } catch (err) { // User not exist, verify Particle act
    try {
      let email = req.body.email;
      let password = req.body.password;
      const data = await particle.login({ username: email, password: password });
      // Retrive device id
      // TODO: choose a specific device if there are multiple
      let at = data.body.access_token;
      const devicesRes = await fetch(config.particleEndPointUrl + config.particleDevicesApi + '?access_token=' + at, {method: 'GET'});
      const devices = await devicesRes.json();
      if (devices.length == 0) {
        res.status(400).status("No devices");
      }
      let deviceId = devices[0]['id'];
      // Generate userid, password hash then save user to db
      let userId = djb2(email);
      let hash = bcrypt.hashSync(password, config.salt);
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
    await db.connect(process.env.MONGO_URL || config.mongodbUrl, config.dbName);
    const user = await db.find(config.usersCollection, { "email": req.body.email });
    // Hash provided password to compare with hash in db
    if (bcrypt.compareSync(req.body.password, user[0].hash)) {
      const token = await jwt.sign({ uid: user[0].userid }, config.secret);
      res.cookie(config.jwtCookie, token);
      res.json({'token': token});
    }
    else {
      res.status(400).send("Incorrect email or password");
    }
  } catch (err) {
    if ((err instanceof jwt.JsonWebTokenError) || (err instanceof (enfError))) { // jwt verification failed
      res.status(400).send("Incorrect email or password");
    } else {
      res.status(400).send("Error authenticating user"); 
    }
  }
})

// Get device info
router.get('/device', apiAuth, async (req, res, next) => {
  try {
    await db.connect(process.env.MONGO_URL || config.mongodbUrl, config.dbName);
    const user = await db.find(config.usersCollection, { "userid": req.uid });
    const deviceRes = await fetch(config.particleEndPointUrl + config.particleDevicesApi + '/' + user[0].did + '?access_token=' + user[0].at, {method: 'GET'});
    const device = await deviceRes.json();
    res.json({
      'name': device.name,
      'id': device.id,
      'status': device.status,
      'online': device.connected,
      'last-heard': device.last_heard,
      'last-ip-address': device.last_ip_address,
      'system-firmware-version': device.system_firmware_version
    });
  } catch (err) {
    res.status(500).send("Error getting device detail");
  }
})

// Get past data
router.get('/past/:start/:end', apiAuth, async (req, res, next) => {
  let start = parseInt(req.params.start);
  let end = parseInt(req.params.end);
  let now = new Date();
  if (isNaN(start) || isNaN(end) || (start > end) || (end > now.getTime())) {
    res.status(400).send("Bad params");
  }
  try {
    await db.connect(process.env.MONGO_URL || config.mongodbUrl, config.dbName);
    const pastData = await db.find(config.dataCollection, { $and: [{"userid": req.uid}, {"time":{$gte: start}}, {"time":{$lte: end}}] }, 0);
    res.json(pastData);
  } catch (err) {
    res.status(400).send("Error getting past data");
  }
})


// Hash string to int (create userid)
function djb2(str) {
  let hash = 5381;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char;
  }
  return hash;  
}

module.exports = router;
