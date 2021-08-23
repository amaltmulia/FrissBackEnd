'use strict';

exports.ok = function(res, retvar) {
  var data = {
      'status': retvar.status || 200,
      'message': retvar.message || 'OK',
      'data': retvar.data || retvar
  };

  for (const [key, value] of Object.entries(retvar)) {
    if(retvar.data && (key != 'status' || key != 'message' || key != 'data')) {
      data[key] = value;
    }
  }
  
  if(data.data.status && !retvar.data) delete data.data['status'];
  if(data.data.message && !retvar.data) delete data.data['message'];

  res.json(data);
  res.end();
};

exports.failed = function(res, retvar) {
  var data = {
      'status': retvar.status || 500,
      'message': retvar.message || 'Failed',
      'errors': retvar.errors || []
  };
  res.status(data.status).json(data);
  res.end();
};
