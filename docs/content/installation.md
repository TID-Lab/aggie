# Installation  

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
    - If using hate speech indication icons, set hateSpeechThreshold at the threshold the icon appears (.0 - 1) and set enable to true.
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
@reboot bash -c 'source $HOME/.nvm/nvm.sh; forever start -o $HOME/aggie/logs/hate-speech-out.log -e $HOME/aggie/logs/hate-speech-err.log -c python $HOME/aggie/hate-speech-api/hate_speech_clf_api.py > hate-cron.log 2>&1'
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

# OPTIONAL User input: Restart Aggie every 6 hours if you have high traffic. Memory leaks are in the process of being addressed.
crontab -e
# Paste the following line in crontab:
0 */6 * * * bash -c 'source $HOME/.nvm/nvm.sh && cd $HOME/aggie && npx pm2 restart aggie > $HOME/restart-cron.log 2>&1'

# User input: Enable log rotation.
sudo $EDITOR /etc/logrotate.conf
# Paste the following, changing `/home/my_user` to the location of the `aggie` folder.
/home/my_user/aggie/logs/*.log
/home/my_user/.pm2/logs/*.log
/var/log/mongodb/*.log
{
  daily
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

### Additional setup

Additional instructions for technical configurations can be found at the [GitHub repository](https://github.com/TID-Lab/aggie#README).
