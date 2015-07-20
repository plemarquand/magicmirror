var fs = require('fs');
var Rx = require('rx');
var _ = require('underscore');
var moment = require('moment');
var express = require('express');
var Sickbeard = require('node-sickbeard');

export default (url, apikey) => {
  var sb = new Sickbeard({
    url: url,
    apikey: apikey,
    debug: true
  });

  const test = false;
  const cutoffDays = 5;
  const lookbackCutoff = moment().subtract(moment.duration(cutoffDays, 'd'));
  const dateFilename = require('path').join(__dirname, 'lastSavedDate.dat');

  // Loads the Sickbeard history (last 100 items)
  const loadHistory = (sb) => Rx.Observable.fromPromise(sb.cmd('history', {}))

  // Returns the last date/time a TV report was run, minimum date `lookbackCutoff`.
  const loadLastSearchDate = (filename) => Rx.Observable.catch(
      Rx.Observable.fromNodeCallback(fs.readFile)(filename, 'utf-8').map(str => new Date(str)),
      Rx.Observable.fromNodeCallback(fs.writeFile)(filename, moment().toString()).map(() => new Date()))
    .map(jsDate => moment(jsDate))
    .map(date => date.isAfter(lookbackCutoff) ? lookbackCutoff : date)

  // Given a list of shows, reduces the list to only the ones that were downloaded
  // after the supplied date.
  var filterDownloadedShows = (shows, lastSearchedDate) => Rx.Observable.fromArray(shows)
    .filter(show => show.status === 'Downloaded' && moment(show.date).isAfter(lastSearchedDate))
    .reduce((acc, v) => acc.concat([v]), []);

  // Given a list of shows, reduces it to a hashmap where the key is the
  // name of the show and the value is an array of show objects.
  var getUniqueShows = (shows) => _.reduce(shows, (memo, show) => {
    if (!memo.hasOwnProperty(show.show_name)) {
      memo[show.show_name] = [];
    }
    memo[show.show_name].push(show);
    return memo;
  }, {});

  // Saves the current date and time to the last run text file.
  // Subsequent searches will only return shows downloaded after this date.
  var saveSearchDate = () => fs.writeFileSync(dateFilename, moment().toString());

  var router = express.Router();
  router.get('/tv', (req, res) => Rx.Observable.combineLatest(
      loadHistory(sb),
      loadLastSearchDate(dateFilename), (history, lastDate) => ({
        shows: history.data,
        lastDate
      })
    )
    .flatMap(({
      shows, lastDate
    }) => Rx.Observable.combineLatest(
      Rx.Observable.just(lastDate.toString()),
      filterDownloadedShows(shows, lastDate).map(getUniqueShows), (date, shows) => ({
        date, shows
      })
    ))
    .doAction(saveSearchDate)
    .subscribe(data => res.status(200).send(data), (e) => {
      console.log("E???", e.stack);
      res.status(500).send(e)
    }));

  return router;
}