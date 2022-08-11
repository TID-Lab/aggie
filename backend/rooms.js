module.exports = (httpServer) => {
  require('./rooms/create-rooms')(httpServer);
};
