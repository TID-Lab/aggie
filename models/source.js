var mongoose = require('mongoose');

var sourceSchema = new mongoose.Schema({
  type: String,
  resource_id: String,
  url: String,
  keywords: String,
  enabled: Boolean
});

module.exports = mongoose.model('Source', sourceSchema);
