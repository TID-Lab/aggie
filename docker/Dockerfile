FROM node:0.10

WORKDIR /usr/src/

RUN curl -L https://npmjs.org/install.sh | sh

# Eventually we can install from master
RUN git clone https://github.com/TID-Lab/aggie.git && cd aggie && git checkout master

WORKDIR aggie

RUN mv config/secrets.json.example config/secrets.json
RUN openssl req -x509 -newkey rsa:2048 -keyout config/key.pem -out config/cert.pem -days 365 -nodes

# Uncomment when using git clone
RUN npm install --global gulp forever && npm install --unsafe-perm=true

EXPOSE 3000

CMD node install.js && forever start app.js
