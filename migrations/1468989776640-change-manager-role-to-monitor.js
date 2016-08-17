/* eslint-disable no-console */
'use strict';

var User = require('../models/user');

exports.up = function(next) {
  User.update({ role: 'manager' }, { role: 'monitor' }, { multi: true }, function(err, numAffected) {
    if (err) next(err);
    console.log('Number of managers changed to monitors: ' + numAffected);
    next();
  });
};

exports.down = function(next) {
  next();
};
