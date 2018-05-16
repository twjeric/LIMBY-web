var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var config = require('../config.json');
// Middleware to check if user logged in
var auth = require('../auth/auth');

// Display register page
router.get('/', auth, function (req, res, next) {
    // User logged in
    if (req.auth) {
        res.redirect('/events');
    }
    else {
        // No user logged in
        res.render('register', { "err": null });
    }
})

// Register user
router.post('/', async (req, res, next) => {
    try {
        let body = { email: req.body.email, password: req.body.password };
        const apiRes = await fetch(config.cloudEndpointUrl + '/api/user', {
            method: 'POST',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        if (apiRes.status == 200) {
            // Register done
            res.render('login', { "err": null, "msg": "Registered successfully. Please log in :)" });
        }
        else {
            // Register failed
            const err = await apiRes.text();
            res.render('register', { "err": err });
        }
    } catch (err) {
        res.render('register', { "err": err });
    }
})

module.exports = router;
