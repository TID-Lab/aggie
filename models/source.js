var mongoose = require('mongoose');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean
});

sourceSchema.pre('save', function(next) {
  sourceSchema.emit('save', this.toObject());
  next();
});

sourceSchema.pre('remove', function(next) {
  sourceSchema.emit('remove', this.toObject());
  next();
});

module.exports = mongoose.model('Source', sourceSchema);
