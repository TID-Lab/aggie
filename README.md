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
   1. To obtain facebook token, do GET https://graph.facebook.com/oauth/access_token?client_secret=xxx&client_id=xxx&grant_type=client_credentials. Obtain client_id and client_secret from https://developers.facebook.com/apps/ (create an app if necessary)
   1. `fromEmail` is the email address from which system emails come. Also used for the default admin user
   1. `email.from` is the address from which application emails will come
   1. `email.transport` is the set of parameters that will be passed to [NodeMailer](http://www.nodemailer.com)
   1. If you are using SES for sending emails, make sure `config.fromEmail` has been authorized in your Amazon SES configuration.
   1. Set `config.adminParty=true` if you want to run tests
   1. Set `adminPassword` to set default password for admin user during install phase
   1. Set `fetching` value to enable/disable fetching for all sources at global level.    This is also changed during runtime based on user choice
   1. Set various logging options in `logger` section
   		* `console` section is for console logging. For various options, see [winston](see https://github.com/flatiron/winston#working-with-transports)
   		* `file` section is for file logging. For various options, see [winston](see https://github.com/flatiron/winston#working-with-transports)
   		* `SES` section is for email notifications. For various options, see [winston-amazon-ses](see https://www.npmjs.com/package/winston-amazon-ses). 
   			* Set appropriate AWS key and secret values
   			* Set `to` and `from` email ids. Make sure `from` has been authorised in your Amazon SES configuration.
   			* **DO NOT** set `level` to *debug*. Recommended value is *error*.
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

## Architecture

Aggie consists of two largely separate frontend and backend apps. Some model code (in `/shared`) is shared between them.

### Backend

The backend is a Node.js/Express app responsible for fetching and analyzing data and servicing API requests. There are three main modules, each of which runs in its own process:

* API module
* Fetching module
* Analytics module

See README files in the `lib` subdirectories for more info on each module.

The model layer (in `/models`) is shared among all three modules.

### Frontend

The frontend is a single-page Angular.js app that runs in the browser and interfaces with the API, via both pull (REST) and push (WebSockets) modalities. It is contained in `/public/angular`.