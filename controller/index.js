'use strict';

var response = require('../config/response');
var crypto = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.index = function(req, res) {
  response.ok(res, {message: "Welcome to Friss API"})
};

exports.debug = function(req, res) {
  var data = {
    session: req.session
  }

  let password = req.body.password || "password123";
  let saltRounds = 10;

  // sync
  const salt = crypto.genSaltSync(saltRounds);
  const hash = crypto.hashSync(password, salt);
  const jwtx = jwt.sign({username: "system"}, "@F12iZsl4unDRy!:)", { expiresIn: '30s' });

  data.salt = salt;
  data.hash = hash;
  data.jwt = jwtx;

  // async
  /* crypto.genSalt(saltRounds, function(err, salt) {
    console.log("salt :", salt);
    crypto.hash(password, salt, function(err, hash) {
        // Store hash in your password DB.
        console.log("hash :", hash);
    });
  }); */

  response.ok(res, {message: "DEBUGGIN", data:data});
};