const { Server } = require('socket.io');
const httpServer = require('http').createServer();
const { io } = require('socket.io-client');

const port = 37778;
let eventServer = null,
  socketToClient = null,
  waitingForServerSocket = [],
  clientSocket = null;

const EventRouter = {
  eventCallbacks: {},
  publish: (event, data) => {
    EventRouter.eventCallbacks[event] = EventRouter.eventCallbacks[event] || [];
    EventRouter.eventCallbacks[event].forEach((cb) => cb(event, data));

    return Promise.resolve({});
  },

  on: (event, callback) => {
    EventRouter.eventCallbacks[event] = EventRouter.eventCallbacks[event] || [];
    EventRouter.eventCallbacks[event].push(callback);
  },

  initEventRouter: () => {
    if (!eventServer) {
      eventServer = new Server(httpServer);
      eventServer.on('connect', (socket) => {
        socketToClient = socket;
        waitingForServerSocket.map((resolve) => resolve(socketToClient));

        socket.onAny((event, data) => {
          EventRouter.eventCallbacks[event] =
            EventRouter.eventCallbacks[event] || [];
          EventRouter.eventCallbacks[event].forEach((cb) => cb(data, event));
        });
      });

      httpServer.listen(port);
    }
  },
};

module.exports = EventRouter;
