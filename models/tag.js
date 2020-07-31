// Represents a categorization of a report by an SMTC monitor

var database = require('../lib/database');
var mongoose = database.mongoose;
var logger = require('../lib/logger');
var _ = require('underscore');

var tagSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true }
});

tagSchema.pre('save', function(next) {
    var tag = this;

    if(!tag.name) return next(new Error.Validation("name_required"));

    // Check for uniqueness
    SMTCTag.checkUnique(tag, function(unique, err) {
        if (!unique) return next(new Error.Validation(err));
        else next();
    });

});

tagSchema.post('save', function() {
    tagSchema.emit('tag:new', {
        _id: this._id.toString(),
        name: this.name
    });
});

tagSchema.post('remove', function() {
    tagSchema.emit('tag:removed', this._id);
});

var SMTCTag = mongoose.model('SMTCTag', tagSchema);

SMTCTag.checkUnique = function(tag, callback) {
    var query = { $and: [
        { _id: { $ne: tag._id } },
        { name: tag.name }
    ]};
    SMTCTag.count(query, function(err, count) {
        if (err) {
            logger.warning(err);
        }
        if (count) callback(false, _.keys(_.last(query.$and))[0] + '_not_unique');
        else callback(true);
    })
}

module.exports = SMTCTag;