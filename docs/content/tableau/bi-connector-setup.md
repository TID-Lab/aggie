![Aggie](../../../public/angular/images/logo-green.png)

# BI Connector setup

### Configuring MongoDB BI Connector for using Tableau

- Make sure ports 27017 and 3307 are publicly accessible

- Follow this tutorial to add access control for MongoDB: [Access control tutorial](https://docs.mongodb.com/manual/tutorial/enable-authentication/), example below
    - If access control is enabled, replace username and password for MongoDB in the following steps accordingly. If its not enabled, then remove username and password fields

Example:

```shell script
mongo aggie

db.createUser(
  {
    user: "admin",
    pwd: "CHANGE_ME",
    roles: [{ role: "userAdminAnyDatabase", db: "aggie" }, "readWriteAnyDatabase"]
  }
)

db.adminCommand({ shutdown: 1 })

mongo aggie -u admin
```

Then:

```shell script
# create temporary bin folder
mkdir ~/bin && cd ~/bin 

# download mongoDB BI connector 
wget https://info-mongodb-com.s3.amazonaws.com/mongodb-bi/v2/mongodb-bi-linux-x86_64-ubuntu1604-v2.12.0.tgz

# extract downloaded file
tar -xvzf mongodb-bi-linux-x86_64-ubuntu1604-v2.12.0.tgz

# go into the extracted folder
cd mongodb-bi-linux-x86_64-ubuntu1604-v2.12.0/

# install mongosqld connector
sudo install -m755 bin/mongo* /usr/local/bin/

# check mongosqld has been installed. It should successfully start mongosqld 
mongosqld

# create a config file for mongosqld
sudo vi /etc/mongosqld.conf

# copy and paste the following template:
#---------------------------------------------------
systemLog:
  path: '/var/log/mongosqld.log'
schema:
  path: /var/aggie-schema.drdl    #contains mongodb schema
net:
  bindIp: 127.0.0.1               #add private ip here. Use ifconfig -a to find private IP
  port: 3307                      #port where mongosqld will be available
mongodb:
  net:
    uri: "mongodb://localhost:27017/"      
    auth:
      username: admin
      password: CHANGE_ME
      mechanism: "SCRAM-SHA-1"
      source: aggie
security:
  enabled: true
processManagement:
  service:
    name: mongosqld
    displayName: mongosqld
    description: "BI Connector SQL proxy server"
#---------------------------------------------------

# Generate MongoDB schema [add -u and -p flags if authentication is enabled on MongoDB]
sudo mongodrdl -o /var/aggie-schema.drdl  -d aggie --authenticationDatabase aggie -u admin -p CHANGE_ME

# Check that schema has been generated
head /var/aggie-schema.drdl

# Install mongosqld as a service
sudo mongosqld install --config /etc/mongosqld.conf
sudo systemctl start mongosqld.service
sudo systemctl enable mongosqld.service

# Check that the service is running
sudo systemctl status mongosqld.service

# If there are any errors, then check the logs
tail -f /var/log/mongosqld.log

# Configuring TLS for BI Connector
sudo mkdir /opt/certs
cd /opt/certs

# generate private key mdbprivate.key
sudo openssl genrsa -out /opt/certs/mdbprivate.key -aes256 -passout pass:password

# The output of the following command will be used as Common Name for later prompts 
hostname -f

# Generate certification authority file. For Common Name prompt, enter the output of previous command
sudo openssl req -x509 -new -key /opt/certs/mdbprivate.key -days 1000 -out /opt/certs/mdbca.crt -passin pass:password

# At this point, there should be 2 files mdbca.cert and mdbprivate.key in the /opt/certs/ directory.
ls /opt/certs/

# Generate key and CSR for BI connector
sudo openssl req -new -nodes -newkey rsa:2048 -keyout /opt/certs/bi.key -out /opt/certs/bi.csr

# Sign the certificate
sudo openssl x509 -CA /opt/certs/mdbca.crt -CAkey /opt/certs/mdbprivate.key -CAcreateserial -req -days 1000 -in /opt/certs/bi.csr -out /opt/certs/bi.crt -passin pass:password

# Generate PEM file by combining bi.key and bi.crt
sudo bash -c 'cat /opt/certs/bi.key /opt/certs/bi.crt > /opt/certs/bi.pem'

# At this point, you should have the following file in /opt/certs/ directory
bi.crt  bi.csr  bi.key  bi.pem  mdbca.crt  mdbca.srl  mdbprivate.key

# Update the mongosqd.conf
sudo vi /etc/mongosqld.conf

# Add the following ssl lines under net block in the conf file.
# Note: This should NOT be added in the net block in mongodb:
#---------------------------------------------------
net:
  bindIp: 127.0.0.1
  port: 3307
  ssl:
    mode: 'requireSSL'
    PEMKeyFile: '/opt/certs/bi.pem'
    CAFile: '/opt/certs/mdbca.crt'
#---------------------------------------------------

# Restart mongosqld
sudo systemctl restart mongosqld

# Check mongosqld is running
sudo systemctl status mongosqld
```

Verify that you can connect remotely, using the admin password when it prompts you:

```shell script
mongo "mongodb://aggie.example.org" -u admin
```

Now Tableau can connect to the MongoDB on the server using the server IP, authentication information, and database name.
