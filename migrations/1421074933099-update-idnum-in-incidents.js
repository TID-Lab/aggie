var Group = require('../backend/models/group');
var each = require('async').eachSeries;

exports.up = function(next) {
  Group.find({}, function(err, groups) {
    if (err || !groups) return;
    each(groups, function(group, done) {
      var groupRaw = group.toObject();
      group.veracity = groupRaw.verified;
      group.save(function(err) {
        done();
      });
    }, next);
  });
};

exports.down = function(next) {
  next();
};
