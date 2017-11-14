# Installation  


Aggie can be installed using [docker](https://www.docker.com) by following the installation instructions on the [GitHub repository](https://github.com/TID-Lab/aggie#deployment-installation-via-docker).

For production and development, Aggie can also be installed from source after installing the right version of its dependencies, [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/). See more details on the [GitHub repository](https://github.com/TID-Lab/aggie#development-installation).

For production we [PM2](https://www.npmjs.com/package/pm2) process manager, and [nginx](http://nginx.org/) as a web-server. You can get an example of our config file [here](aggie-nginx), which enables https, cache, compression and http2.

