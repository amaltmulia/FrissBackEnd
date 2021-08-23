'use strict';

var response = require('../../config/response');
var connection = require('../../config/connection');
var query = require('../../core/query');

exports._listing = function(req, res) {
    var filter = {};
    if(req.body.user_name) filter.user_name = req.body.user_name;
    if(req.body.email) filter.email = req.body.email;
    if(req.body.role) filter.role = req.body.role;
    if(req.body.full_name) filter.role = req.body.full_name;
    if(req.body.status) filter.status = req.body.status;

    var arrParam = [];
    var qUser = "SELECT u.id, u.user_name, u.email, u.status, r.role_name role, m.full_name FROM fmusers u ";
    qUser += " INNER JOIN fmroles r ON r.id = u.role_id";
    qUser += " LEFT JOIN fdmember m ON u.id = m.user_id";
    qUser += " WHERE 1=1 ";

    if(filter.user_name) {
        qUser += " AND u.user_name like ? ";
        arrParam.push("%"+filter.user_name+"%");
    }
    if(filter.email) {
        qUser += " AND u.email like ? ";
        arrParam.push("%"+filter.email+"%");
    }
    if(filter.role) {
        qUser += " AND r.role_name like ? ";
        arrParam.push("%"+filter.role+"%");
    }
    if(filter.full_name) {
        qUser += " AND m.full_name like ? ";
        arrParam.push("%"+filter.full_name+"%");
    }
    if(filter.status) {
        qUser += " AND u.status = ? ";
        arrParam.push(filter.status);
    }

    qUser += " ORDER BY u.user_name";

    query._listing(req, qUser, arrParam, function (error, rows, fields){
        if(error){
            let errors = [
                error.code,
                error.sqlMessage,
                error.sql
            ];
            response.failed(res, {status:500, message:"Something Wrong", errors:errors});
        } else{
            query._count(qUser, arrParam, function(err, rowcnt) {
                response.ok(res, {data:rows, total:rowcnt[0].cnt});
            })
        }
    });
};

exports._view = function(req, res) {
    var qUser = "SELECT u.id, u.user_name, u.email, u.status, r.role_name role, m.full_name FROM fmusers u ";
    qUser += " INNER JOIN fmroles r ON r.id = u.role_id";
    qUser += " LEFT JOIN fdmember m ON u.id = m.user_id";
    qUser += " WHERE 1=1 AND u.id = ?";
    var arrParam = [req.params.id];

    query.execute(qUser, arrParam, function (error, rows, fields) {
        if(error){
            let errors = [
                error.code,
                error.sqlMessage,
                error.sql
            ];
            response.failed(res, {status:500, message:"Something Wrong", errors:errors});
        } else {
            if(!rows.length) {
                response.failed(res, {status:404, message:"Data Not Found"});
            } else {
                response.ok(res, {data:rows});
            }
        }
    });
};