var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var config = require('../config.json');
// Middleware to check if user logged in
var auth = require('../auth/auth');

// Display login page
router.get('/', auth, function (req, res, next) {
    // User logged in
    if (req.auth) {
        res.redirect('/events');
    }
    else {
        // No user logged in
        res.render('login', { "err": null, "msg": null });
    }
})

// Authenticate user
router.post('/', async (req, res, next) => {
    try {
        let body = { email: req.body.email, password: req.body.password };
        const apiRes = await fetch(config.cloudEndpointUrl + '/api/auth', {
            method: 'POST',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        if (apiRes.status == 200) {
            // Register done
            let monthInMs = 30*24*60*60*1000;
            const tokenJson = await apiRes.json();
            if (req.body.remember == 'on') { // "Remember me" is selected, set 1-month cookie
                res.cookie(config.jwtCookie, tokenJson['token'], {
                    expires: new Date(Date.now() + monthInMs),
                    httpOnly: true
                });
            } 
            else { // Set session cookie
                res.cookie(config.jwtCookie, tokenJson['token']);
            }
            res.redirect('/events');
        }
        else {
            // Register failed
            const err = await apiRes.text();
            res.render('login', { "err": err, "msg": null });
        }

    } catch (err) {
        res.render('login', { "err": err, "msg": null });
    }
})

module.exports = router;
