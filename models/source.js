var mongoose = require('mongoose');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean
});

sourceSchema.pre('save', function(next) {
  process.emit('source:save', this.toObject());
  next();
});

sourceSchema.pre('remove', function(next) {
  process.emit('source:remove', this.toObject());
  next();
});

module.exports = mongoose.model('Source', sourceSchema);
