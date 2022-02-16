// Handles CRUD requests for SMTC-created tags.

var express = require('express');
var bodyParser = require('body-parser');
var SMTCTag = require('../../../models/tag');
var _ = require('lodash');

module.exports = function(app, user) {
    app = app || express();
    user = user || require('../authorization')(app);

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // Get a list of all Tags
    app.get('/api/v1/tag', user.can('view data'), function(req, res) {
        SMTCTag.find({}, function(err, tags) {
            if (err) res.send(err.status, err.message);
            else res.send(200, tags);
        }).populate({ path: 'user', select: 'username' });
    });

    // Create a new Tag
    app.post('/api/v1/tag', user.can('edit tags'), function(req, res) {
        if (req.user) req.body.user = req.user._id;
        SMTCTag.create(req.body, function(err, tag) {
            err = Error.decode(err);
            if (err) {
                console.log(err);
                res.send(err.status, err.message);
            } else {
                res.send(200, tag);
            }
        });
    });

    // Update a Tag
    app.put('/api/v1/tag/:_id', user.can('edit tags'), function(req, res) {
        // Find tag to update
        SMTCTag.findById(req.params._id, function(err, tag) {
            if (err) return res.send(err.status, err.message);
            if (!tag) return res.send(404);
            // Update the actual values
            tag = _.extend(tag, _.omit(req.body, 'creator'));

            // Update the values
            tag.save(function(err) {
                if (err) {
                    res.send(err.status, err.message);
                } else {
                    res.send(200);
                }
            });
        });
    });

    // Delete a Tag
    app.delete('/api/v1/tag/:_id', user.can('edit tags'), function(req, res) {
        SMTCTag.findById(req.params._id, function (err, tag) {
            if (err) return res.send(err.status, err.message);
            if (!tag) return res.send(404);

            tag.remove(function(err) {
                err = Error.decode(err);
                if (err) res.send(err.status, err.message);
                else res.send(200);
            });
        });
    });

    return app;
}