var jwt = require('jsonwebtoken');
var config = require('../config.json');

async function apiAuth(req, res, next) {
  let token = req.cookies[config.jwtCookie];
  if (!token) { // jwt cookie not incl in header
    res.status(401).send("Unauthorized");
  }
  else {  // jwt cookie incl, verify it
    try {
      const decoded = await jwt.verify(token, config.secret);
      // User is authorized, call next passing userid
      req.uid = decoded.uid;
      next();

    } catch (err) { // Bad or expired token
      res.status(401).send("Bad token");
    }
  }
}

module.exports = apiAuth;
