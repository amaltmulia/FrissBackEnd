'use strict';

var response = require('../config/response');

module.exports = function(app) {
    var index = require('../controller/index');
    app.route('/').get(index.index);
    app.route('/debug').get(index.debug);

    // Authorization
    var auth = require('../controller/system/auth');
    app.route('/auth/login').post(auth.login);
    app.route('/auth/logout').get(auth.logout);
    app.route('/auth/refresh-token').get(auth.refreshToken);
    app.route('/auth/check-token').get(auth.checkToken); // send header : debug

    // User Object
    var users = require('../controller/system/users');
    app.route('/users').get(users._listing);
    app.route('/users/:id').get(users._view);


    // Page Not Found
    /* app.get('*', function(req, res){
      response.failed(res, {status:404,message:"Page Not Found"});
    }); */
};