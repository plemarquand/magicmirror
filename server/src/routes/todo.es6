const Rx = require('rx');
const _ = require('underscore');
const moment = require('moment');
const express = require('express');
const request = require('request-promise');

export default (email, password) => {
  const apiBase = 'https://todoist.com/API/v6/';
  const url = (frag) => apiBase + frag;
  const reqParams = (frag, params, token) => _.extend({url: url(frag)}, {qsStringifyOptions: {arrayFormat: 'repeat'}}, {qs: _.extend(params, token ? {token} : {})});
  const login = Rx.Observable.fromPromise(request(reqParams('login', {email, password}))).map(res => JSON.parse(res));
  const req$ = (frag, params) => login
    .flatMap(user => Rx.Observable.fromPromise(request(reqParams(frag, params, user.token))))
    .map(res => JSON.parse(res));

  var router = express.Router();
  router.get('/todo/today', (req, res) => req$('query', {queries: '["today"]'})
    .map(response => response[0].data)
    .subscribe(data => res.status(200).send(data), e => res.status(500).send(e)));

  return router;
}