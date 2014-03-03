var mongoose = require('mongoose');

var TestingSchema = new mongoose.Schema({
	message: String,
	source: String, //source of the data - could be one of Twitter, Facebook or RSS
	user_name: String,
	user_handle: String,
	user_image_url: String,
	timestamp: String,
	terms: [] //array of search terms
});

/* Enumerating the different data sources */
TestingSchema.statics.TWITTER = "TWITTER";
TestingSchema.statics.FACEBOOK = "FACEBOOK";
TestingSchema.statics.RSS = "RSS";

var Testing = mongoose.model("Testing", TestingSchema);
module.exports = Testing;