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
        var body = { email: req.body.email, password: req.body.password };
        const apiRes = await fetch(config.endpointUrl + '/api/auth', {
            method: 'POST',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        if (apiRes.status == 200) {
            // Register done
            const tokenJson = await apiRes.json();
            res.cookie(config.jwtCookie, tokenJson['token']);
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
