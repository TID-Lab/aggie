![Aggie](public/angular/images/logo-green.png)

## Introduction

Aggie is a web application for using social media and other resources to track incidents around real-time events such as elections or natural disasters.

Aggie can retrieve data from several sources:

* [Twitter](https://search.twitter.com) (tweets matching a keyword search)
* [Crowdtangle](https://www.crowdtangle.com/) (Facebook, Instagram, and Reddit posts from publicly accessible groups and pages)
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

## Table of Contents

* [Using the Application](#using-the-application)
* [Source Installation](#source-installation)
* [Maintenance](#maintenance)
* [Project Configuration](#project-configuration)
* [Architecture](#architecture)
* [Building and Publishing Aggie's documentation](#building-and-publishing-aggies-documentation)

## Using the Application

Extensive documentation about using the application can be found in [ReadTheDocs page](http://aggie.readthedocs.io/en/stable/).

## Source Installation

We recommend the **[semi-automated installation script](#semi-automated-installation-script)** below to install the required components on Ubuntu.

### System requirements

Again, see below for automated installation.

1. **node.js** (v12.16 LTS)
   1. Use [Node Version Manager](https://github.com/nvm-sh/nvm).
      - Node Version Manager (nvm) allows multiple versions of node.js to be used on your system and manages the versions within each project.
      - After installing nvm:
          1. Navigate to the aggie project directory: `cd aggie`.
          1. Run `nvm install` to install the version specified in `.nvmrc`.
1. **Mongo DB** (requires >= 4.2.0)
    1. Follow the [installation instructions](https://docs.mongodb.com/v4.2/installation/#mongodb-community-edition-installation-tutorials) for your operating system.
    1. Make sure MongoDB is running:
        1. On Linux run `sudo systemtl status mongod` to see whether the `mongod` daemon started MongoDB successfully. If there are any errors, you can check out the logs in `/var/log/mongodb` to see them.
    1. Note: You do not need to create a user or database for aggie in Mongo DB. These will be generated during the installation process below.
1. (optional) **SMTP email server**
    1. Required in production for adding new users.
1. (optional) **JRE**
    - Java is only required for running end-to-end tests with protractor. Installing Java can be safely skipped if these tests are not needed.
    - Install the Java SE Runtime Environment (JRE) from [Oracle](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) or your package manager
1. (optional) **Python** (requires >= 2.7) 
    - Python 2.7 is required to use the hate speech classifier (presently only available for Burmese language).
    - Python 2.7 is required because one of the dependencies ([Burmese Language Tools](https://github.com/MyanmarOnlineAdvertising/myanmar_language_tools)) for segmenting Burmese text is written in Python 2.7.


### Installation notes

Again, see below for automated installation.

1. Clone the [aggie repo](https://github.com/TID-Lab/aggie).
    - In your terminal, navigate to your main projects folder (e.g. Documents).
    - Use this command: `git clone https://github.com/TID-Lab/aggie.git`.
    - `cd aggie`
1. Copy `config/secrets.json.example` to `config/secrets.json`.
    -  Set `adminPassword` to the default password your want to use for the `admin` user during installation.
    - For production, set `log_user_activity` flag to `true`. For testing, set it as `false` (default value).
1. (optional, rarely needed) To make https work, you need to copy your SSL certificate information to the `config` folder (two files named `key.pem` and `cert.pem`).
    - If you do not have the certificate you can create a new self-signed certificate with the following command:
  `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365`
    - This will allow you to start the server but it will generate unsafe warnings in the browser. You will need a real trusted certificate for production use.
    - Adding the `-nodes` flag will generate an unencrypted private key, allowing you to run tests without passphrase prompt
1.  Hate speech detection is available for Burmese language. Set up steps are listed in Semi-automated installation script. In config/secrets.json, set the detectHateSpeech parameter to true. The API will run on http://localhost:5000. User will never directly interact with this API.
1. Run `npm install` from the project directory.
    - This installs all dependencies and concatenates the angular application.
1. (optional) Run `npm install -g gulp mocha karma-cli protractor migrate`.
    - This installs some tools globally which can then be run from the command line for testing.
    - You will most likely need Google Chrome installed on your computer for the protractor tests to run.
    - This is optional, as `npx` provides easy access to the local copies of these that are installed by `npm install`
1. To start server in production mode, run `npm start`. Use `npm run dev` for development.
    - In your terminal, a user and password were generated. You will use these credentials to log into the application. Example: `"admin" user created with password "password"`.
1. Navigate to `https://localhost:3000` in your browser.
    - This will show you the running site. Login with the user name and password from your terminal mentioned above.
    - If you did not set up the SSL certificate, use `http://localhost:3000` instead

### Semi-automated installation script

This is intended for setup on a fresh Ubuntu v18.04 system. Setup may need to be modified for other linux systems.

If it says "user input", you won't want to paste anything beyond that until addressing the input.

```shell script
# Set up system

export EDITOR=vim # Option 1
export EDITOR=nano # Option 2

sudo apt update
sudo apt install -y ntp nginx software-properties-common
sudo systemctl enable ntp
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Nginx server and SSL. Source: https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx
sudo curl -o /etc/nginx/sites-available/aggie.conf https://raw.githubusercontent.com/TID-Lab/aggie/develop/docs/content/aggie-nginx
sudo ln -s /etc/nginx/sites-available/aggie.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
# User input: Customize nginx settings with your domain name.
sudo $EDITOR /etc/nginx/sites-available/aggie.conf
# User input: Set up SSL with a couple of prompts.
sudo certbot --nginx

# User input: Set up SSL certificate auto-renewal.
crontab -e
# Paste the following line in crontab, replacing `X` with the current minutes + 1
# (e.g. if it's 12:15pm, write `16` instead of `X`):
X * * * * PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && sudo /usr/bin/certbot renew --no-self-upgrade > ${HOME}/certbot-cron.log 2>&1

# Then wait until that time occurs, and verify that it logged a renewal attempt: 
cat ~/certbot-cron.log
# You should see something like "Cert not yet due for renewal / No renewals were attempted."
# which means the certificate is valid and the cron job is running.

# If you make any config changes later, always run this afterward:
sudo systemctl restart nginx

# Mongo DB. Source: https://docs.mongodb.com/v4.2/tutorial/install-mongodb-on-ubuntu/
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
# Optional: Increase ulimits via https://docs.mongodb.com/manual/reference/ulimit/.
# This will affect DB performance in some cases.
# Finally:
sudo systemctl restart mongod

# Node version manager (nvm). Source: https://github.com/nvm-sh/nvm#installing-and-updating
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

```shell script
# Set up Aggie

git clone https://github.com/TID-Lab/aggie.git
cd aggie
nvm install && npm install

cp config/secrets.json.example config/secrets.json
# User input: Customize Aggie settings per the README instructions.
# This includes adding your SMTP email server credentials, detectHateSpeech option etc.
$EDITOR config/secrets.json

# User input: Get CrowdTangle sources per the README instructions, if using them.
# Otherwise stub it:
echo "{}" > config/crowdtangle_list.json

# Follow these steps for setting up hate speech API for Burmese
python --version # check if you have python 2 installed.
cd hate-speech-api
npm install forever -g # install `forever` npm module.
pip install virtualenv # install virtual environment.
virtualenv venv # create virtual environment.
source venv/bin/activate # activate virtual environment
pip install -r requirements.txt # install dependencies 
# User input: Set `detectHateSpeech: true`.
$EDITOR config/secrets.json
# User input: Set the script to run on startup.
crontab -e
# Paste the following line in crontab:
@reboot forever start -c python -e $HOME/aggie/hate-speech-api/error.log $HOME/aggie/hate-speech-api/hate_speech_clf_api.py &
# Reboot the machine and make sure the Hate Speech API is available on port 5000:
curl localhost:5000

# Ready! Test run:
npm start
# Now verify Aggie is online at your URL, then kill this process (ctrl+c) when you're done.
# Optional troubleshooting if it doesn't work:
curl localhost:3000
# This should return an HTML response starting with something like <html lang="en" ng-app="Aggie">
# If this works but you can't access Aggie publicly, check your network config to make sure ports 80 and 443 are exposed.
```

```shell script
# Final steps

# User input: Print a script to run that will enable Aggie on startup.
npx pm2 startup
# Copy/paste the last line of output as instructed.

# Start (or restart) Aggie in the background; save the PM2 state for startup.
npm run serve
npx pm2 save

# If you ever modify secrets.json, restart the app by running (in the `aggie` directory):
npx pm2 restart aggie

# User input: Enable log rotation.
sudo $EDITOR /etc/logrotate.conf
# Paste the following, changing `/home/my_user` to the location of the `aggie` folder.
/home/my_user/aggie/logs/*.log
/home/my_user/.pm2/logs/*.log
{
  weekly
  missingok
  rotate 12
  compress
  delaycompress
  notifempty
  copytruncate
}

# Whenever you need to, you can view app logs by running (in the `aggie` directory):
npx pm2 logs
```

### Semi-automated upgrade

Save backup:

```shell script
# Back up your database.
export DATE=`date -u +"%Y-%m-%d"`; mongodump -o "mongodump-$DATE" 
# OR authenticated (will prompt for your password):
export DATE=`date -u +"%Y-%m-%d"`; mongodump -o "mongodump-$DATE" -d aggie -u admin
```

Quick upgrade:

```shell script
cd aggie # Go to where you originally saved Aggie.
alias assertClean='git diff --exit-code && git diff --cached --exit-code' # Check for dirty files.
assertClean && (git pull && npm install && npx pm2 restart aggie) || echo "Dirty." # Serve the new version.
```

Full upgrade if the above fails:

```shell script
cd aggie # Go to where you originally saved Aggie.
git status # Check if anything is modified (this should be rare).
git add -A; git add -u; git stash # Save any files you may have changed.
git branch # Make sure you're on 'develop' (or whatever you need to be on).
git pull # Get upstream changes.
git stash pop # Only if you had changes saved earlier.
# ! Make sure to resolve any conflicts if there are any.
git status # Check if it looks right.
npm install # Make sure dependencies are up to date.
npx pm2 restart aggie # Serve the new version.
```

## Maintenance

1. To run migrations run `npx migrate`.
1. To run unit tests, run `npm test`.
    - **Leave your HTTPS certificate files unencrypted for testing**. If necessary, re-run `openssl` with the `-nodes` option as described above.
    - Calling `npm run mocha` will run just the backend tests
    - Calling `npm run karma` will run just the frontend tests
1. To monitor code while developing, run `npx gulp`. You can pass an optional `--file=[test/filename]` parameter to only test a specific file.
1. To run end-to-end tests:
    1. first start Aggie on the test database with `npm run testrun`
    1. then run protractor with `npm run protractor`
1. To run end-to-end tests with external APIs
    1. Set up the appropriate keys in `secrets.json` (e.g. Twitter)
    1. start Aggie on the test database with `npm run testrun`
    1. run protractor with `npm run protractor-with-apis`
1. To verify if the CRON job for updating Account Ids <-> Crowdtangle List Names and Saved Searches works
    1. Empty the contents of config/crowdtangle_list.json.
    1. Let the CRON job run at midnight UTC and check if the config/crowdtangle_list.json is updated with Account Ids <-> Crowdtangle List Names and Saved Searches.

## Project Configuration

You can adjust the settings in the `config/secrets.json` file to configure the application.

### Tests

Set `config.adminParty=true` if you want to run tests.

### Social Media and Feeds

#### Twitter

  1. Follow [these instructions](https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens) to generate tokens to use the Twitter API.
  1. Go to Settings > Configuration and edit the Twitter settings. Remember to toggle the switch on, once you have saved the settings.

#### CrowdTangle

  1. Create a dashboard on CrowdTangle and generate the dashboard token.
  1. Add your CT API token to `config/secrets.json`.
  1. Run `npm run update-ct-lists` to fetch data.
      - This will update `config/crowdtangle_list.json`.
      - This also happens automatically every night at midnight while Aggie is running.

Note: To have git ignore changes, run `git update-index --skip-worktree config/crowdtangle_list.json`

#### WhatsApp

The WhatsApp feature is documented in a [conference paper](http://idl.iscram.org/files/andresmoreno/2017/1498_AndresMoreno_etal2017.pdf). As WhatsApp does not currently offer an API, a Firefox extension in Linux is used to redirect notifications from [web.whatsapp.com](http://web.whatsapp.com) to Aggie server. Thus, you need a Linux computer accessing WhatsApp through Firefox for this to work. Follow these steps to have it working.
  1. Install Firefox in Linux using your distribution preferred method.
  1. Install [GNotifier](https://addons.mozilla.org/firefox/addon/gnotifier/) add-on in Firefox.
  1. Configure the add-on [about:addons](about:addons):
       * Set Notification Engine to Custom command
       * Set the custom command to `curl --data-urlencode "keyword=<your own keyword>" --data-urlencode "from=%title" --data-urlencode "text=%text" http://<IP address|domain name>:2222/whatsapp`
           * We suggest setting your `keyword` to a unique string of text with out spaces or symbols, e.g., the phone number of the WhatsApp account used for Aggie. This keyword must be the same one as the one specified in the Aggie application, when creating the WhatsApp Aggie source.
           * Replace `IP address|domain` with the address or domain where Aggie is installed (e.g., `localhost` for testing).
  1. Visit [web.whatsapp.com](http://web.whatsapp.com), follow instructions, and _enable browser notifications_
  1. Notifications will not be sent to Aggie when browser focus is on the WhatsApp tab, so move away from that tab if not replying to anyone.

#### ELMO


  1. Log in to your ELMO instance with an account having coordinator or higher privileges on the mission you want to track.
  1. In your ELMO instance, mark one or more forms as public (via the Edit Form page). Note the Form ID in the URL bar (e.g. if URL ends in `/m/mymission/forms/123`, the ID is `123`).
  1. Visit your profile page (click the icon bearing your username in the top-right corner) and copy your API key (click 'Regenerate' if necessary).
  1. Go to Settings > Configuration and edit the ELMO settings. Remember to toggle the switch on, once you have saved the settings.


### Google Places

Aggie uses Google Places for guessing locations in the application. To make it work:

1. You will need to get an API key from [Google API console](https://console.developers.google.com/) for [Google Places API](https://developers.google.com/places/documentation/).
1. Read about [Google API usage](https://developers.google.com/places/web-service/usage) limits and consider [whitelisting](https://support.google.com/googleapi/answer/6310037) your Aggie deployment to avoid surprises.
1. Go to Settings > Configuration and edit the Google Places settings and add the key.

### Emails

Email service is required to create new users.

1. `fromEmail` is the email address from which system emails come. Also used for the default admin user.
1. `email.from` is the address from which application emails will come
1. `email.transport` is the set of parameters that will be passed to [NodeMailer](http://www.nodemailer.com). Valid transport method values are: 'SES', 'sendgrid' and 'SMTP'.
1. If you are using SES for sending emails, make sure `config.fromEmail` has been authorized in your Amazon SES configuration.

### Fetching

1. Set `fetching` value to enable/disable fetching for all sources at global level.
  - This is also changed during runtime based on user choice.

### Logging

Set various logging options in `logger` section.

- `console` section is for console logging. For various options, see [winston](see https://github.com/winstonjs/winston#transports)
- `file` section is for file logging. For various options, see [winston](see https://github.com/winstonjs/winston#transports)
- `SES` section is for email notifications.
  - Set appropriate AWS key and secret values.
  - Set `to` and `from` email ids. Make sure `from` has been authorised in your Amazon SES configuration.
- `Slack` section is for Slack messages.
  - Set the webhook URL to send logs to a specific Slack channel
- **DO NOT** set `level` to *debug*. Recommended value is *error*.

Only the `console` and `file` transports are enabled by default. Transports can be disabled using the `"disabled"` field included in each section in the `config/secrets.json` file.

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

## Building and Publishing Aggie's documentation

The documentation is in the `docs` directory. These are automatically built and
pushed on each commit for the `master` and `develop` branches in Github:

* `develop`: [http://aggie.readthedocs.io/en/latest](http://aggie.readthedocs.io/en/latest/)
* `master`: [http://aggie.readthedocs.io/en/stable](http://aggie.readthedocs.io/en/stable/)

To build the docs locally, do the following:

1. Install [Python](https://www.python.org/downloads/) and [pip](https://pip.pypa.io/en/stable/installing/)
1. Install [Sphinx](http://www.sphinx-doc.org/) with `pip install -U Sphinx`
1. Install `recommonmark`: `pip install recommonmark`
1. Install Read The Docs theme: `pip install sphinx_rtd_theme`
1. From the `docs` directory in Aggie, run `make html`
1. The compiled documentation has its root at `docs/_build/html/index.html`
