# Aggie

Aggie is a web application for using social media to track incidents around real-time events such as elections or natural disasters.

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
1. To monitor code while developing, run `gulp`. You can pass an optional `--file=[test/filename]` parameter to only test a specific file.
1. To start server, run `npm start`.

## Angular application installation
1. Edit /etc/hosts to contain "127.0.0.1 aggie"
1. Install any updated dependencies using `npm install`

## Running the Angular application
1. Start the server using `npm start`
1. Concatenate Angular app into a single `app.min.js` file by running `gulp angular` (or, if you will be editing any files, run `gulp angular.watch`).
1. Navigate to "aggie:3000" in your browser.
