'use strict';
var connection = require('../config/connection');

exports.execute = function(sql, data, callback) {
  let arrparam = data || [];
  connection.query(sql, arrparam, callback);
};

exports._listing = function(req, sql, data, callback) {
  let arrparam = data || [];
  let limit = req.body.limit || 100;
  let page = req.body.page || 1;

  var startRow = (page - 1) * limit;

  sql += " LIMIT " + startRow + ", " + limit;

  connection.query(sql, arrparam, callback);
};

exports._count = function(sql, data, callback) {
  let arrparam = data || [];
  sql = sql.toLowerCase();

  let reFrom = /\b(from)\b/i
  let findFrom = sql.search(reFrom);

  sql = sql.substring(findFrom, sql.length);
  sql = "SELECT count(*) as cnt " + sql;

  connection.query(sql, arrparam, callback);
};