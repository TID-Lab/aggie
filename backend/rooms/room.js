const { Server } = require('socket.io');
const logger = require('../logger');
const { httpServer } = require('../api');

let serverSocket = null,

const rooms = {};

const createRoomManager = (httpServer) => {
  const RoomManager = {
    initializeServer: () => {
      if (!serverSocket) {
        console.log('Initializing server');
        serverSocket = new Server(httpServer, {
          cors: {
            origin: 'http://localhost:8000',
          },
        });
      }
    },
    acceptConnectionAndJoinRoom: (room) => {
      if (!serverSocket) {
        RoomManager.initializeServer();
      }

      rooms[room] = rooms[room] = serverSocket.of(`${room}`);

      serverSocket.on('connection', async (socket) => {
        console.log('****** Adding incoming socket to room', room);

        await socket.join(room);

        socket.onAny((...args) =>
          console.log('****** Receved something', args)
        );

        socket.emit('message', `Connected to room ${room}`);
        socket.emit('message', 'Blah blah');

        socket.emit('rooms', 'Rooms Data Coming in');
        if (serverSocket && serverSocket.rooms) {
          socket.emit('rooms', Array.from(serverSocket.rooms).length);
        } else {
          socket.emit('rooms', 'No rooms found');
        }
      });
    },
    publishMessage: (room, message) => {
      if (serverSocket) {
        serverSocket.emit(message);
      } else {
        throw 'Could not publish message since connection is not established.';
      }
    },
  };

  return RoomManager;
};
module.exports = createRoomManager;
