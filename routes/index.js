var express = require('express');
var router = express.Router();

// Event route will figure out where to go
router.get('/', function(req, res, next) {
  res.redirect('/events');
});

module.exports = router;
