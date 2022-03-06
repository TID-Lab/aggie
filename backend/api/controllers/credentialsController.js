// Handles CRUD requests for credentials
'use strict';

const Credentials = require('../../models/credentials');
const Source = require('../../models/source');

  // Create new credentials
exports.credential_create = async (req, res) => {
  try {
      const credentials = await Credentials.create(req.body);
      credentials.stripSecrets();
      res.send(200, credentials);
  } catch (err) {
      res.status(err.status).send(err.message);
  }
}

  // Delete credentials by their ID
exports.credential_delete = async (req, res) => {
  const { _id } = req.params;
  try {
    // return 409 Conflict if Sources using these credentials are still left
    const sources = await Source.find({ credentials: _id }).exec();
    if (sources.length > 0) {
      res.sendStatus(409);
      return;
    }
    const { deletedCount } = await Credentials.deleteOne({ _id });
    if (deletedCount === 0) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    res.status(err.status).send(err.message);
  }
}

  // Get all of the (stripped) credentials
exports.credential_credentials = async (req, res) => {
  try {
      const credentials = await Credentials.find({}).exec();
      credentials.forEach((c) => c.stripSecrets());
      res.status(200).send(credentials);
  } catch (err) {
      res.status(err.status).send(err.message);
  }
}

// Get a set of (stripped) credentials by its ID
exports.credential_details = async (req, res) => {
  const { _id } = req.params;
  try {
      const credentials = await Credentials.findById(_id).exec();
      if (!credentials) {
        res.sendStatus(404);
        return;
      }
      credentials.stripSecrets();
      res.status(200).send(credentials);
  } catch (err) {
      res.status(err.status).send(err.message);
  }
}
