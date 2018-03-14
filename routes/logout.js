var express = require('express');
var router = express.Router();
var config = require('../config.json');

router.get('/', function (req, res, next) {
    res.clearCookie(config.jwtCookie);
    res.redirect('/login');
})

module.exports = router;
