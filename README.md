# Aggie

This is the future of Aggie.

## Development Installation

1. Checkout repo.
1. Install node.js (v.0.10.*)
1. Install Mongo DB.
1. Run `npm install` from
1. Run `sudo npm install -g gulp mocha` (This installs gulp and mocha globally so they can be run from command line for testing.)
1. Copy `config/secrets.json.example` to `config/secrets.json` and fill in values appropriately.
1. Start Mongo DB.
1. To run tests, run `gulp`.
1. To start server, run `npm start`.

## To enable full-text search in MongoDB

MongoDB 2.6+ has full-text search enabled by default. For 2.4 use the following
commands:

1. `mongo aggie --eval 'db.adminCommand({setParameter: 1, textSearchEnabled: true});'`
1. `mongo aggie --eval 'db.reports.ensureIndex({"content": "text"});'`
1. These commands are automatically run for the _aggie-test_ database when running tests.
