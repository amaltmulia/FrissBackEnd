'use strict';

var response = require('../../config/response');
var connection = require('../../config/connection');
var crypto = require('bcrypt');
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv');
global.atob = require("atob");

dotenv.config();

exports.login = function(req, res) {
  if(req.session.loggedin) {
    response.ok(res, {message:"You already logged-in"});
    return;
  }
  var retvar = {
    status : 403,
    message : "Login is failed",
    errors : []
  };

  let username = req.body.username;
  let password = req.body.password;
  if(username && password) {
    let qUser = "SELECT u.id, u.user_name, u.user_password, u.salt, u.email, u.role_id, r.role_name, m.full_name, m.photo FROM fmusers u ";
    qUser += " INNER JOIN fmroles r ON r.id = u.role_id";
    qUser += " LEFT JOIN fdmember m ON u.id = m.user_id";
    qUser += " WHERE u.user_name = ? AND u.status = ?";
    
    connection.query(qUser, 
      [username, 1], function(error, result, fields) {
        if(error) {
          retvar.status = 500;
          retvar.errors.push(error.code);
          retvar.errors.push(error.sqlMessage);
          retvar.errors.push(error.sql);
        } else if(result.length > 0) {
          let userdata = result[0];

          const checkPass = crypto.compareSync(password, userdata.user_password);
          if(!checkPass) {
            retvar.errors.push("Invalid Username or Password");
          } else {
            req.session.loggedin = true;
            req.session.uid = userdata.user_id;
            req.session.uname = userdata.user_name;
            req.session.email = userdata.email;
            req.session.role = userdata.role_id;
            req.session.salt = userdata.salt;
            
            let token = jwt.sign({username: userdata.user_name}, userdata.salt, { expiresIn: process.env.TOKEN_EXPIRY });
            req.session.token = 'Bearer ' + token;
            if(req.headers.showlog) {
              console.log(token);
            }
            retvar = {
              username : username,
              email : userdata.email,
              role : userdata.role_name,
              name : userdata.full_name || username,
              photo : userdata.photo || "",
              token : token
            }

            response.ok(res, {data:retvar});
            return;
          }
          
        } else {
          retvar.errors.push("User is not registered");
        }
        response.failed(res, retvar);
      });
  } else {
    retvar.errors.push("Invalid Username or Password");
    response.failed(res, retvar);
  }
  
};

exports.logout = function(req, res) {
  if(!req.session.loggedin) {
    response.ok(res, {message:"You already logged-out"});
    return;
  }
  
  for(var key in req.session){
    if(key != 'cookie') {
      delete req.session[key];
    }
  }

  response.ok(res, {message:"Thank you"});
};

exports.refreshToken = function(req, res) {
  let token = jwt.sign({username: req.session.uname}, req.session.salt, { expiresIn: process.env.TOKEN_EXPIRY });
  req.session.token = 'Bearer ' + token;
  response.ok(res, {data:token});
};

exports.checkToken = function(req, res) {
  const authHeader = req.headers.authorization || req.session.token;
  if(authHeader == null) {
    response.failed(res, {status:401,message:"Invalid Token"});
    return;
  }
  const token = authHeader && authHeader.split(' ')[1]; // bearer
  
  var tokendata = token.split('.')[1]
  var decodedjwt = JSON.parse(atob(tokendata));
  var datenow = new Date()

  var retvar = {
    token : token,
    isexpired : decodedjwt.exp < (datenow.getTime() / 1000),
    jwtData : decodedjwt,
    diff : decodedjwt.exp - (datenow.getTime() / 1000)
  }

  response.ok(res, {data:retvar})
};