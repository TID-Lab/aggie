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

Contact mikeb@cc.gatech.edu for more information on the Aggie project.

[Sassafras Tech Collective](http://sassafras.coop) offers managed instances of Aggie, along with development and support services.

## Development Installation

### System requirements

The following need to be installed.

1. **node.js** (v.0.10.*, such as 0.10.32)
   - There are two ways to install/update node.js.
      1. Install a specific version of node.js.
         - Documentation and installation instructions can be found on the [node.js site](https://nodejs.org/).
      2. Use [Node Version Manager](https://github.com/creationix/nvm).
         - Node Version Manager (nvm) allows multiple versions of node.js to be used on your system and manages the versions within each project.
         - After installing nvm:
            1. in your terminal, navigate to the aggie project directory: `cd [aggie]`.
            2. use this command: `nvm use 0.10`.
2. **Mongo DB** (requires >= 2.6, such as 2.6.9)
   1. Follow the [installation structions](https://docs.mongodb.org/v2.6/) for your operating system.
   2. Stop and restart Mongo DB.
      1. On Linux run `sudo service mongod stop`. Then run `sudo mongod`.
      2. Make sure mongodb is running in the terminal and listening on an appropriate port. Your terminal with the mongo db process running should display something similar to the following: `[initandlisten] waiting for connections on port 27017`.
   3. Note: You do not need to create a user or database for aggie in Mongo DB. These will be generated during the installation process below.


### Installation
1. Checkout the [aggie repo](https://github.com/TID-Lab/aggie).
   - In your terminal, navigate to your main projects folder (e.g. Documents).
   - Use this command: `git clone git@github.com:TID-Lab/aggie.git`.
1. Copy `config/secrets.json.example` to `config/secrets.json`.
   1. Set `adminPassword` to the default password your want to use for the `admin` user during installation.
1. Run `npm install` from the project directory.
   - This installs all dependencies, adds indexing support to MongoDB, creates an admin user, and concatenates the angular application.
1. In your terminal during 'npm install', a user and password were generated. You will use these credentials to log into the application. Example: `"admin" user created with password "password"`.
1. Run `npm install -g gulp mocha`.
   - This installs gulp and mocha globally so they can be run from the command line for testing.
1. Run `npm install -g migrate`.
   - This installs node-migrate globally.
1. To start server, run `npm start`.
1. Navigate to `localhost:3000` in your browser.
   - This will show you the running site. Login with the user name and password from your terminal mentioned above.

## Maintenance
1. To run migrations run `migrate`.
2. To run tests, run `npm test`.
3. To monitor code while developing, run `gulp`. You can pass an optional `--file=[test/filename]` parameter to only test a specific file.

## Project Configuration
You can adjust the settings in the `config/secrets.json` file to configure the application.

### Tests
Set `config.adminParty=true` if you want to run tests.

### Social Media and Feeds

#### Twitter
   * Follow [these instructions](https://dev.twitter.com/oauth/overview/application-owner-access-tokens) to generate tokens to use the Twitter API.
   * In your `secrets.json` file:
      1. Uncomment the lines for the Twitter hash/object (`"twitter": {},`).
      2. Replace `consumer_key`, `consumer_secret`, `access_token`, and `access_token_secret` with the keys from [your app](https://apps.twitter.com).

#### Facebook
   * Known issue: The current Facebook API is not compatible with Aggie. Please see https://github.com/TID-Lab/aggie/issues/139 for more information.
   * Visit [your apps](https://developers.facebook.com/apps/) on the Facebook developers site. Create a new app if needed.
   * Inside your Facebook app, obtain `client_id` and `client_secret`.
   * To obtain an access token:
      * in a browser, visit `https://graph.facebook.com/oauth/access_token?client_secret=xxx&client_id=xxx&grant_type=client_credentials` using your `client_id` and `client_secret`.
      * OR do `GET https://graph.facebook.com/oauth/access_token?client_secret=xxx&client_id=xxx&grant_type=client_credentials`.
   * Uncomment the lines for the Facebook hash/object (`"facebook": {},`).
   * Replace the `accessToken` placeholder with your access token.

### Emails
   1. `fromEmail` is the email address from which system emails come. Also used for the default admin user.
   1. `email.from` is the address from which application emails will come
   1. `email.transport` is the set of parameters that will be passed to [NodeMailer](http://www.nodemailer.com).
   1. If you are using SES for sending emails, make sure `config.fromEmail` has been authorized in your Amazon SES configuration.

### Fetching
   1. Set `fetching` value to enable/disable fetching for all sources at global level.
      - This is also changed during runtime based on user choice.

### Logging
   Set various logging options in `logger` section:
   - `console` section is for console logging. For various options, see [winston](see https://github.com/flatiron/winston#working-with-transports)
   - `file` section is for file logging. For various options, see [winston](see https://github.com/flatiron/winston#working-with-transports)
   - `SES` section is for email notifications. For various options, see [winston-amazon-ses](see https://www.npmjs.com/package/winston-amazon-ses).
      - Set appropriate AWS key and secret values.
      - Set `to` and `from` email ids. Make sure `from` has been authorised in your Amazon SES configuration.
      - **DO NOT** set `level` to *debug*. Recommended value is *error*.

## Using the Application
### Sources
#### Adding Sources
   1. Inside the application, go to `Sources > Create Source`.
   2. To add a Twitter search, add all relevant keywords.
      - Twitter has [more information on search terms](https://dev.twitter.com/streaming/overview/request-parameters#track).
   3. To add an RSS feed, visit the website or blog you wish to use and find the RSS or other feed. (For example, `https://wordpress.org/news/feed/`.)

#### Warnings
   As the application pulls in data, the app may encounter warnings. These warnings help determine whether or not a feed is pulling in data correctly.

   1. Go to `Sources`.
   2. In the `Name` column, click the appropriate source.
   3. Under `Recent Events`, you can see recent warnings for the source.


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
