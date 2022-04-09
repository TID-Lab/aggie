// Represents a categorization of a report by an SMTC monitor

var database = require('../database');
var mongoose = database.mongoose;
var logger = require('../logger');
var _ = require('underscore');

var lengthValidator = function(str) {
  return validator.isLength(str, {min: 0, max: 40})
}
var tagSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  color: String,
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  isCommentTag: { type: Boolean, default: false },
  updatedAt: Date,
  storedAt: Date,
});

tagSchema.pre('save', function(next) {
  var tag = this;
  if (this.isNew) this.storedAt = new Date();
  this.updatedAt = new Date();
  if(!tag.name) return next(new Error.Validation("name_required"));
  // Check for uniqueness
  SMTCTag.checkNewUnique(tag, function(unique, err) {
    if (!unique) return next(new Error.Validation(tag.name + " is not a unique tag name. Please use a unique name for new tags."));
    else next();
  });
});

tagSchema.post('save', function() {
  tagSchema.emit('tag:new', {
    _id: this._id.toString(),
    name: this.name,
    color: this.color,
    description: this.description,
    isCommentTag: this.isCommentTag,
  });
});


tagSchema.post('remove', function() {
  tagSchema.emit('tag:removed', this._id);
});

var SMTCTag = mongoose.model('SMTCTag', tagSchema);

SMTCTag.checkNewUnique = function(tag, callback) {
  var query = { $and: [
      { _id: { $ne: tag._id } },
      { name: tag.name }
    ]};
  SMTCTag.countDocuments(query, function(err, count) {
    if (err) {
      logger.warning(err);
    }
    if (count) callback(false, tag.name + '_not_unique');
    else callback(true);
  })
}


module.exports = SMTCTag;
