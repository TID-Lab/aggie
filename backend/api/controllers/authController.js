const User = require("../../models/user");
const jwt = require('jsonwebtoken');
const config = require('../../config/secrets').get();

exports.login = (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      res.status(err.status).send(err.message);
    } else {

      const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
      };
      const token = jwt.sign(payload, config.secret, {expiresIn: '12hr'});
      res.cookie('jwt', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 43200000), // +1 day
        secure: true,
      });
      res.json({
        token: token,
        success: true,
        message: "Authentication successful"
      });
    }
  });
}

exports.register = (req, res) => {
  User.register(
      new User({ name: req.body.name, username: req.body.username, email: req.body.email }),
      req.body.password,
      function (err, msg) {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Successful" });
        }
      }
  );
};

exports.session = (req, res, next) => {
  const user = req.user;
  User.findById(user.id, (err, foundUser) => {
    if (err) {
      res.status(422).send(err.message);
      next(err);
    } else {
      if (foundUser) {
        res.status(200).send(foundUser);
        next();
      } else {
        res.status(422).send("No user found.");
        next();
      }
    }
  });
}

exports.logout = (req, res) => {
  req.logout();
  res.status(200).send("Logged Out")
};