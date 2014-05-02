# Aggie

This is the future of Aggie.

## Development Installation

1. Checkout repo.
1. Install node.js (v.0.10.*)
1. Install Mongo DB (requires >= 2.6)
1. Copy `config/secrets.json.example` to `config/secrets.json` and fill in values appropriately.
   1. email.from is the address from which application emails will come.
   1. email.transport is the set of parameters that will be passed to [NodeMailer](http://www.nodemailer.com)
1. Start Mongo DB.
1. Run `npm install` from the project directory (This installs all dependencies, adds indexing support to MongoDB, and creates an admin user.)
1. Run `sudo npm install -g gulp mocha` (This installs gulp and mocha globally so they can be run from command line for testing.)
1. To run tests, run `npm test`.
1. To monitor code while developing, run `gulp`.
1. To start server, run `npm start`.
