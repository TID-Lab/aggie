var passport = require('passport');
var _ = require('underscore');
var util = require('util');
var User = require('../models/User');
var Testing = require('../models/Testing');
var Chance = require('chance');

var fs = require('fs');

exports.saveDBTest = function(req, res) {

    //the amounts of tweets to save
    var TWEETS_TO_SAVE = 1000;

    //random obj generator
    var chance = new Chance();

    //start the timer for the test
    console.time("SaveM");

    //callback to check if saved failed
    var callback = function(err, results) {
        if (err) return handleError(err);
        console.log(results);
        id++;

    };

    //new Testing entry
    var item = new Testing({
        message: chance.sentance(),
        source: Testing.TWITTER,
        user_name: chance.name(),
        user_handle: change.twitter(),
        user_image_url: "imglink",
        timestamp: new Date().toISOString().slice(0, 10),
        terms: ['bar', 'foo']
    });

    //save all the items
    while (id < TWEETS_TO_SAVE) {
        item.save(callback);
    }

    //log the end of the saves
    console.timeEnd("SaveM");

    //remove all the added entries
    var b = Testing.remove({}, function(err) {
        if (err) return handleError(err);
        console.log("removed");
    });

    //execute delete query
    b.exec();

    //Send status of test
    res.send("Saved " + id);
};

exports.fetchDummyTwitterStream = function(req, res) {

    //log the process start time
    console.time("startSave");

    //sync loading of file
    var text = fs.readFileSync(__dirname + '/sample_tweet.txt');

    //convert buffer to string
    var string = text.toString();

    //initialize chance instance
    var chance = new Chance();

    // constants for performance tests
    var TWEETS_TO_GENERATE = 100;
    var RUN_FOR_ITERATIONS = 10;

    // counter
    var counter = 0;

    var generateTweets = function(err, data) {

        //only run for a total of 10 instances
        if (counter >= RUN_FOR_ITERATIONS) {
            return endTimeout();
        }

        //start a new JSON file string
        var file = '[';


        for (var i = 0; i < TWEETS_TO_GENERATE; i++) {
            file += util.format(string, chance.integer({
                min: -1000000000,
                max: 100000000
            }), chance.sentence({
                words: 10
            }), chance.name(), chance.twitter());
            if (i < TWEETS_TO_GENERATE - 1) {
                file += ",";
            }
        }

        //end json file
        file += "]";

        // String -> JSON
        var newJSON = JSON.parse(file);

        //Save all the JSON into mongodb
        for (var x = 0; x < newJSON.length; x++) {
            var item = new Testing({
                message: newJSON[x].text,
                source: Testing.TWITTER,
                user_name: newJSON[x].user.name,
                user_handle: newJSON[x].user.screen_name,
                user_image_url: newJSON[x].user.profile_image_url,
                timestamp: new Date().toISOString().slice(0, 10),
                terms: []
            }).save();
        }
        counter++;

        console.log(counter + " " + Object.keys(newJSON).length);
    };

    var timeoutsSecond = setInterval(generateTweets, 1000);
    setTimeout(endTimeout, 10000);

    var endTimeout = function() {
        console.timeEnd("startSave");
        clearInterval(timeoutsSecond);
        res.send("Tested " + TWEETS_TO_GENERATE + " tweets a second");
    };
};

exports.queryDummyTwitterStream = function(req, res) {

    //Find all the sources that are Twitter
    Testing.find({
        "source": Testing.TWITTER
    }, function(err, data) {
        console.log(">>>> " + data);

        //Count the amount of instances
        results = Object.keys(data).length;
        res.send("End of query test " + results);
    });
};
