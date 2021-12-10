// Performs some basic setup tasks. Should be run as part of deploy process.

var database = require('./lib/database');
var Report = require('./models/report');
var User = require('./models/user');
var config = require('./config/secrets').get();
const Jaccard = require("jaccard-index");
const Sentiment = require('sentiment');
const Translation = require("./lib/translation");
const ReportSimScore = require("./models/report_sim_scores");

//database.mongoose.set("debug", true);

var tasks = [];

// Enable full-text indexing for Reports
function enableIndexing(callback) {
    // Wait for database connection
    database.mongoose.connection.on('error', function (err) {
        console.error('mongoose connection error (retrying): ', err);
        setTimeout(function () {
            database.mongoose.connect(database.connectURL,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                });
        }, 200);
    });
    database.mongoose.connection.once('open', function () {
        Report.ensureIndexes(function (err) {
            if (err) console.error(err);
            else console.log('Indexing is enabled for Reports.');
            callback();
        });
    });
}

tasks.push(enableIndexing);

// Verify that an admin user exists
function createAdminUser(callback) {
    User.findOne({role: 'admin'}, function (err, user) {
        if (!user) {
            var userData = {
                provider: 'aggie',
                email: config.adminEmail,
                username: 'admin',
                password: config.adminPassword,
                role: 'admin',
                hasDefaultPassword: true
            };
            // Create new admin user
            User.create(userData, function (err, user) {
                if (err) console.error(err);
                else console.log('"admin" user created with password "' + config.adminPassword + '"');
                callback();
            });
        } else callback();
    });
}

tasks.push(createAdminUser);

function computeSimScore(report_one, report_two) {
    // Segment the content into tokens
    // Compute the Jaccard Index

    // Rough translation

    // Analyze the sentiment of the english translation
}

function computeReportSimScores(callback) {

    //const sentiment = new Sentiment(undefined);
    //var result = sentiment.analyze('Cats are stupid.');

    Report.find({}).limit(10).exec( (err, reports) => {
        if (err) console.error(err.status + " " + err.message);
        reports.map(report => {
            //const report_translation = Translation.translate("am", "en", report["content"]);
            Report.find({}).skip(10).limit(10).exec((err2, reports_two) => {
                if (err2) console.error(err2.status + " " + err2.message);
                reports_two.map(report_two => {
                    /*if (ReportSimScore.find({
                        "$and":
                            [
                                {"reports": {"$in": [report]}},
                                {"reports": {"$in": [report_two]}},
                            ]
                    })) {
                        return;
                    }*/
                    // Compute report to report similarity
                    var sim_score = new ReportSimScore();
                    sim_score.reports.push(report, report_two);
                    sim_score.score = computeSimScore(report, report_two);
                    sim_score.save();
                });
            });

        });
    });

    //else res.send(200, tags);
    callback();
};

//tasks.push(computeReportSimScores);

var remaining = tasks.length;
tasks.forEach(function (task) {
    task(function () {
        if (--remaining === 0) process.exit();
    });
});
