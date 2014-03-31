var mongoose = require('mongoose');
var processManager = require('../controllers/process-manager');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean
});

sourceSchema.pre('save', function(next) {
  processManager.broadcast('source:save', this.toObject());
  next();
});

sourceSchema.pre('remove', function(next) {
  processManager.broadcast('source:remove', this.toObject());
  next();
});

module.exports = mongoose.model('Source', sourceSchema);
