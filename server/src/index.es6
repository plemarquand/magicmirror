'use strict';

require('dotenv').load();

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const socketio = require('socket.io');
const servers = {};

var allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

module.exports = {
  start: () => {
    const app = express();
    app.use(express.static(path.join(__dirname, '../www/')));
    app.use(allowCrossDomain);
    app.use(require('./routes/tv')(process.env.SICKBEARD_URL, process.env.SICKBEARD_KEY));

    servers.http = http.createServer(app);
    servers.socket = socketio(servers.http);
    app.use(require('./routes/socket')(servers.socket));

    servers.http.listen(8080);

    console.log('Configured http:', (servers.http.address().address + ':' + servers.http.address().port));

    return app;
  }
};

if (process.env.NODE_ENV !== 'testing') {
  module.exports.start();
}