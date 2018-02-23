var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Particle = require('particle-api-js');
var particle = new Particle();

var config = require('../config.json');
var enfError = require('../models/enf');
var DB = require('../models/db');
var db = new DB();

// Create user
// TODO1: Use post instead
router.get('/', async (req, res, next) => {
    // No query provided, check for jwt cookie first
    if (Object.keys(req.query).length === 0) {
        try {
            // Db connect
            await db.connect(config.mongodbUrl, config.dbName);
            // Extract email from jwt cookie
            var token = req.cookies[config.jwtCookie];
            const decoded = await jwt.verify(token, config.secret); 
            var tokenUser = decoded.sub;
            // Check if extracted email in db
            const user = await db.find(config.usersCollection, { "email": tokenUser });
            // User logged in, redirect to events page
            res.redirect('/events');
        
        } catch (err) {
            if ((err instanceof jwt.JsonWebTokenError) || (err instanceof (enfError))) { // Jwt verification failed, show register page
                res.render('register', { "error": null });
            } else {
                next(err); 
            }
        }
    }
    // Query provided, try to connect to Particle cloud
    else {
        try {
            await db.find(config.usersCollection, { "email": req.query.email });
            // User exists, redirect to login
            //// TODO2: Let user know this account is already in db
            res.redirect('/login');
        } catch (err) {
            try {
                const data = await particle.login({ username: req.query.email, password: req.query.password });
                // Good credential, register this user
                //// TODO3: Randomize the salt and save together in db
                //// TODO4: Keep sync or change to async?
                const saltRounds = 10;
                var hash = bcrypt.hashSync(req.query.password, saltRounds);
                await db.connect(config.mongodbUrl, config.dbName);
                //// TODO5: Is there a way not have to save access token?
                await db.insertOne(config.usersCollection, { "email": req.query.email, "hash": hash, "at": data.body.access_token });
                //// TODO6: Let user know they succeeded 
                res.redirect('/login');
            } catch (err) {
                //// TODO7: WHY THERE IS NO CUSTOM ERROR FOR PARTICLE JS ???
                // if (err instanceof enfError) { // Bad credential, retry register with err msg
                    res.status(401);
                    res.render('register', { "error": "Please double check your Particle credential" });
                // } else {
                    // next(err);
                // }
            }  
        }
    }
})

module.exports = router;
