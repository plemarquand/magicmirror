var express = require('express');

export default (server) => {
  var router = express.Router();

  server.on('connection', (socket) => {
    let state = true;
    let id = setInterval(() => {
      state = !state;
      socket.emit('active', state);
    }, 500000);

    socket.on('disconnect', () => clearInterval(id));
  });
  return router;
}