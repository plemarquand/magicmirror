import express from 'express';
import proximity from '../controller/proxmity';
import { logErrors } from '../util/errorutil';

export default (server, proximitySensorPin = 10) => {
  const router = express.Router();
  const sockets = [];
  const emitState = (state) => sockets.forEach((socket) => socket.emit(state));

  proximity(logErrors(emitState), proximitySensorPin);

  server.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('disconnect', () => sockets.splice(sockets.indexOf(socket), 1));
  });

  return router;
}
