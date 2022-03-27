// Handles CRUD requests for users.
var User = require('../../models/user');
var mailer = require('../../mailer');
const passport = require("passport");

const sendEmail = (user, req, callback) => {
  // Only send email if not in test mode.
  if (process.env.NODE_ENV == 'test')
    callback(null);
  else {
    const token = password.encodeToken(user);
    mailer.sendFromTemplate({
      template: 'newUser',
      user: user,
      token: token,
      host: req.headers.host,
      protocol: req.protocol,
      acceptLanguage: req.headers['accept-language']
    }, (err) => {
      if (err) callback(err);
      else callback(null);
    });
  }
}

exports.user_users = (req, res) => {
  let query = {};
  if (req.user) query.username = req.user.username;

  User.find(query, '-password', function(err, users) {
    if (err) res.status(err.status).send(err.message);
    else res.status(200).send(users);
  });
}

  // Get a User by id
exports.user_detail = (req, res) => {
  User.findById(req.params._id, '-password', function(err, user) {
    if (err) res.status(err.status).send(err.message);
    else if (!user) res.sendStatus(404);
    else res.status(200).send(user);
  });
}

// Create a new User
exports.user_create = (req, res) => {
  User.create(req.body, function(err, user) {
    err = Error.decode(err);
    if (err) res.status(err.status).send(err.message);
    else {
      // Send password reset email
      sendEmail(user, req, (err) => {
        if (err) res.send(502, err.message); // send status code "Bad Gateway" to indicate email failure
        else res.status(200).send(user);
      });
    }
  });
}

  // Update a User
exports.user_update = (req, res) => {
  User.findById(req.params._id, (err, user) => {
    if (err) return res.status(err.status).send(err.message);
    if (!user) return res.sendStatus(404);
    // Only admin can update users other than itself
    if (req.user && !(new UserPermissions(req.user)).can('admin users') && req.params._id != req.user._id) return res.send(403);

    for (var attr in req.body) {
      user[attr] = req.body[attr];
    }
    user.save((err) => {
      err = Error.decode(err);
      if (err) res.status(err.status).send(err.message);
      else res.status(200).send(user);
    });
  });
}

  // Delete a User
exports.user_delete = (req, res) => {
  User.findById(req.params._id, (err, user) => {
    if (err) return res.status(err.status).send(err.message);
    if (!user) return res.sendStatus(404);
    user.remove((err) => {
      err = Error.decode(err);
      if (err) res.status(err.status).send(err.message);
      else res.sendStatus(200);
    });
  });
}

// Use passport.authenticate() as route middleware to authenticate the request
exports.user_login = (req, res) => {
  User.authenticate('local', (err, user, info) => {
    if (err) res.status(err.status).send(err.message);
    if (!user) res.sendStatus(403);
    res.sendStatus(200);
  })
}
// Log the user out
exports.user_logout = (req, res, next) => {
  req.logout();
}

// Return the currently logged-in user object
exports.user_session = (req, res) => {

}

