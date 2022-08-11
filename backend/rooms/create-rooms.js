const { Server } = require('socket.io');
const chalk = require('chalk');
const EventRouter = require('../event-router');

const oldCl = console.log.bind(console);
console.log = (...args) => oldCl(chalk.green(args));

module.exports = (httpServer) => {
  const serverSocket = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8000',
    },
  });

  console.log(`${chalk.green('Started Server Socket')}`);

  const ns = {
    tags: serverSocket.of('/tags'),
    sources: serverSocket.of('/sources'),
    groups: serverSocket.of('/groups'),
    reports: serverSocket.of('/reports'),
  };

  const onConnection = (ns) => async (socket) => {
    console.log('****** Adding incoming socket to ns', ns);

    socket.emit('message', `Connected to ns ${ns}`);
  };

  ns['tags'].on('connection', onConnection('tags'));
  ns['sources'].on('connection', onConnection('sources'));
  ns['groups'].on('connection', onConnection('groups'));
  ns['reports'].on('connection', onConnection('reports'));

  const handleEvent = (nsName) => async (eventName, data) => {
    // console.log('Received event', eventName, 'with data', data);

    ns[nsName].emit(eventName, {
      event: eventName,
      data,
    });
  };

  EventRouter.on('tags:create', handleEvent('tags'));
  EventRouter.on('tags:delete', handleEvent('tags'));
  EventRouter.on('tags:update', handleEvent('tags'));

  EventRouter.on('sources:create', handleEvent('sources'));
  EventRouter.on('sources:delete', handleEvent('sources'));
  EventRouter.on('sources:update', handleEvent('sources'));

  EventRouter.on('groups:create', handleEvent('groups'));
  EventRouter.on('groups:delete', handleEvent('groups'));
  EventRouter.on('groups:update', handleEvent('groups'));

  EventRouter.on('reports:update', handleEvent('reports'));
  EventRouter.on('reports:create', handleEvent('reports'));
  EventRouter.on('reports:delete', handleEvent('reports'));
};
