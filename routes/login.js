var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var config = require('../config.json');
var enfError = require('../models/enf');
var DB = require('../models/db');
var db = new DB();

// Authenticate user
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
            req.stat
            res.redirect('/events');
        
        } catch (err) {
            if ((err instanceof jwt.JsonWebTokenError) || (err instanceof (enfError))) { // Jwt verification failed, show login page
                res.render('login', { "error": null });
            } else {
                next(err);
            }
        }
    }
    // Query provided, verify it
    else {
        try {
            // Db connect and find user
            await db.connect(config.mongodbUrl, config.dbName);
            const user = await db.find(config.usersCollection, { "email": req.query.email });
            // Hash provided password to compare with hash in db
            if (bcrypt.compareSync(req.query.password, user[0].hash)) {
                // Ok, set cookie
                const token = await jwt.sign({ sub: user[0].email }, config.secret);
                res.cookie(config.jwtCookie, token);
                res.redirect(config.endpointUrl + '/events');
            }
            else {
                // Bad, retry login with err msg
                res.render('login', { "error": "Check your password again!" });
            }
        } catch (err) {
            if (err instanceof enfError) { // No user found, retry login with err msg
                res.render('login', { "error": "Check your email and password again!" });
            } else {
                next(err); 
            }
        }  
    }
})

module.exports = router;
