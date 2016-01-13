FROM node:0.10

WORKDIR /usr/src/

RUN curl -L https://npmjs.org/install.sh | sh

# Using local version of aggie for debugging
# RUN mkdir aggie
# COPY . aggie/
# WORKDIR aggie

# we use branch for testing first
RUN git clone https://github.com/TID-Lab/aggie.git && cd aggie && git checkout dockerize-aggie

# Eventually we can install from master
# RUN git clone https://github.com/TID-Lab/aggie.git

WORKDIR aggie

RUN mv config/secrets.json.example config/secrets.json

# RUN npm install --production

# Uncomment when using git clone
RUN npm install --global gulp && npm install --unsafe-perm=true

EXPOSE 3000

CMD node install.js && npm start
