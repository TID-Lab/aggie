# Aggie

Aggie is a web application for using social media and other resources to track incidents around real-time events such as elections or natural disasters.

Aggie can retrieve data from several sources:

* [Twitter](https://search.twitter.com) (tweets matching a keyword search)
* [Facebook](https://facebook.com) (comments from publicly accessible groups and pages)
* [RSS](http://en.wikipedia.org/wiki/RSS) (article titles and descriptions)
* [ELMO](http://getelmo.org) (answers to survey questions)

Items (called *reports*) from all sources are streamed into the application. Monitors can quickly triage incoming reports by marking them as *relevant* or *irrelevant*.

Relevant reports can be grouped into *incidents* for further monitoring and follow-up.

Reports are fully searchable and filterable via a fast web interface.

Report queries can be saved and tracked over time via a series of visual analytics.

Aggie is built for scalability and can handle hundreds of incoming reports per second. The backend fetching and analytics systems feature a modular design well-suited to parallelism and multi-core architectures.

Users can be assigned to *admin*, *manager*, *monitor*, and *viewer* roles, each with appropriate permissions.

Aggie is built using Angular.js and Express.js, both state-of-the-art development frameworks.

Contact mikeb@cc.gatech.edu for more information.

## Development Installation

1. Checkout repo.
1. Install node.js (v.0.10.*)
1. Install Mongo DB (requires >= 2.6)
1. Copy `config/secrets.json.example` to `config/secrets.json` and fill in values appropriately.
   1. email.from is the address from which application emails will come.
   1. email.transport is the set of parameters that will be passed to [NodeMailer](http://www.nodemailer.com)
1. Start Mongo DB.
1. Run `npm install` from the project directory (This installs all dependencies, adds indexing support to MongoDB, creates an admin user, and concatenates angular application.)
1. Run `sudo npm install -g gulp mocha` (This installs gulp and mocha globally so they can be run from command line for testing.)
1. To run tests, run `npm test`.
1. To monitor code while developing, run `gulp`. You can pass an optional `--file=[test/filename]` parameter to only test a specific file.
1. To start server, run `npm start`.
1. Navigate to `localhost:3000` in your browser.

## Deployment

Internally, we use [forever](https://github.com/nodejitsu/forever) to keep Aggie
running. Since this is a multi-process application, the forever monitor will
sometimes hang up when restarting the Aggie process after deploying a new
version of the code. In this case, killing the forever process before deploying
seems to fix it.
