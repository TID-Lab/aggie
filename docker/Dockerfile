FROM node:12.16

WORKDIR /usr/src/

# Eventually we can install from master. Change branch when merging to master or develop.
RUN git clone https://github.com/TID-Lab/aggie.git && cd aggie && git checkout master

#RUN cd aggie && git checkout master
WORKDIR aggie

RUN mv config/secrets.json.example config/secrets.json
RUN openssl req -x509 -newkey rsa:2048 -keyout config/key.pem -out config/cert.pem -days 365 -nodes -subj "/O=Aggie"

# Uncomment when using git clone
RUN npm install --global gulp@3 forever@0 && npm install --unsafe-perm=true

EXPOSE 3000

#CMD npm start
CMD forever -c "npm start" .
