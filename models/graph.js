// Represents a categorization of a report by an SMTC monitor

var database = require('../lib/database');
var mongoose = database.mongoose;
var logger = require('../lib/logger');
var _ = require('underscore');

var lengthValidator = function(str) {
    return validator.isLength(str, {min: 0, max: 40})
}
var graphSchema = new mongoose.Schema({
    tagType: String,
    graph: { Array, Array}
});


var SocialGraph = mongoose.model('socialgraph', graphSchema);


module.exports = SocialGraph;
