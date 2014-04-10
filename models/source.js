var database = require('../controllers/database');
var mongoose = require('mongoose');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean,
  events: Array,
  unreadErrorCount: Number
});

sourceSchema.pre('save', function(next) {
  // Use set source.silent = true to avoid emitting save event
  if (!this.silent) sourceSchema.emit('save', this.toObject());
  next();
});

sourceSchema.pre('remove', function(next) {
  // Use set source.silent = true to avoid emitting remove event
  if (!this.silent) sourceSchema.emit('remove', this.toObject());
  next();
});

module.exports = mongoose.model('Source', sourceSchema);
