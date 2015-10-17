const Rx = require('rx');
const _ = require('underscore');
const moment = require('moment');
const express = require('express');
const request = require('request-promise');

export default (apikey) => {
  if(!apikey) {
    throw new Error('No API key provided. Please obtain one from http://openweathermap.org/');
  }

  const apiBase = 'http://api.openweathermap.org/data/2.5/';

  const url = (frag) => apiBase + frag;
  const reqParams = (frag) => _.extend({url: url(frag) + `&APPID=${apikey}`});
  const req$ = (frag) => Rx.Observable.fromPromise(request(reqParams(frag)));

  var router = express.Router();
  router.get('/weather/*', (req, res) => req$(req.url.replace('/weather/', ''))
    .subscribe(data => res.status(200).send(data), e => res.status(500).send(e)));

  return router;
}