var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    cors = require('cors'),
    session = require('express-session');

app.use(session({
  secret: '@F12iZsl4unDRy!:)',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5000',
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true
}));

//app.use(cors());

app.use(function (req, res, next) {
  // this is middleware
  let nzone = [
    "/",
    "/debug",
    "/auth/login",
    "/auth/check-token"
  ];
  
  let bypassToken = [
    "/auth/logout",
    "/auth/refresh-token",
  ];

  if(nzone.includes(req.originalUrl)) {
    return next();
  } else {
    if(!req.session.loggedin) {
      res.status(401).json({status:401,message:"You are not Authorized",errors:[]});
      res.end();
    } else {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // bearer

      if (token == null && !bypassToken.includes(req.originalUrl)) {
        return res.status(401).json({status:401,message:"Invalid Token",errors:[]}).end();
      } else {
        jwt.verify(token, req.session.salt, function (err, tokendata) {
          if (err && !bypassToken.includes(req.originalUrl)) {
            return res.status(403).json({status:403,message:"Token Expired",errors:[]}).end();
          }
          // console.log(tokendata);
          next()
        });
      }
    }
  }
});

var routes = require('./config/router');
routes(app);

app.listen(port);
console.log('Server Started on: ' + port);