var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

var config = require('../config.json');
// Middleware to check if user logged in
var auth = require('../auth/auth');

router.get('/', auth, async (req, res, next) => {
    if (!req.auth) {
        res.redirect('/login');
    }
    else {
        const apiRes = await fetch(config.cloudEndpointUrl + '/api/device', {
            method: 'GET',
            headers: {
                cookie: config.jwtCookie + '=' + req.cookies[config.jwtCookie]
            }
        });
        if (apiRes.status == 200) {
            const infoJson = await apiRes.json();
            res.render('device', { "info": infoJson, "err": null });
        }
        else {
            const err = await apiRes.text();
            res.render('device', { "info": null, "err": err });
        }
    }
})

module.exports = router;
