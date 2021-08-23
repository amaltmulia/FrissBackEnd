var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "LiFe1991",
  database: "friss"
});

con.connect(function (err){
    if(err) throw err;
});

module.exports = con;